#!/usr/bin/env node
/**
 * Works out which dependency updates are available and splits them into independent candidates, each of
 * which is tested on its own in CI:
 *   minor-<group>  minor/patch updates of one lockstep group (next, react, prisma, ...)
 *   minor-other    minor/patch updates of every remaining package
 *   major-<name>   a major update of one package / lockstep group
 *   lockfile       newer transitive versions inside the existing ranges (npm update, lockfile only)
 *
 * Usage: node scripts/deps/plan.mjs [--no-major] [--failed <file>] [--out <file>] [--check-lockfile]
 *   --failed          JSON map of candidates that failed earlier: { id: signature }. A candidate with the same
 *                     signature (= the same target versions) is not retried; a newer release is.
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { readJson, writeJson, SECTIONS, setOutput, parseSpec, registryVersions, compare, major, lowest, groupOf } from './lib.mjs'

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const value = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback)

const config = readJson(new URL('./config.json', import.meta.url))
const pkg = readJson('package.json')
const failedFile = value('--failed')
const previouslyFailed = failedFile && existsSync(failedFile) ? readJson(failedFile) : {}

// --- direct dependencies ---------------------------------------------------
const direct = {}
for (const section of SECTIONS) {
  for (const [name, spec] of Object.entries(pkg[section] ?? {})) {
    if (config.ignore?.includes(name)) continue
    const parsed = parseSpec(spec)
    if (!parsed) {
      console.log(`skip ${name}@${spec}: not a plain version`)
      continue
    }
    direct[name] = parsed
  }
}

const names = Object.keys(direct)
const available = {}
let next = 0
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (next < names.length) {
      const name = names[next++]
      available[name] = await registryVersions(name)
    }
  }),
)

/**
 * Highest published version above the current one: within the same major ("minor") or in a newer one ("major").
 * Deprecated versions are skipped, except that a package whose current version is itself deprecated (old majors
 * are often flagged, e.g. eslint 9) may still move to a newer version of the same line.
 */
function target(name, kind, exactMajor = null) {
  const { version } = direct[name]
  const published = available[name]
  const allowDeprecated = kind === 'minor' && published[version] === true
  const candidates = Object.keys(published).filter(
    (v) =>
      (allowDeprecated || !published[v]) &&
      (kind === 'minor'
        ? major(v) === major(version) && compare(v, version) > 0
        : exactMajor !== null
          ? major(v) === exactMajor
          : major(v) > major(version)),
  )
  return candidates.length ? candidates.reduce((a, b) => (compare(a, b) >= 0 ? a : b)) : null
}

const spec = (name, version) => `${direct[name].prefix}${version}`

// --- candidates ------------------------------------------------------------
const units = new Map() // lockstep group (or single package) -> member names
for (const name of names) {
  const key = groupOf(config, name) ?? `pkg:${name}`
  units.set(key, [...(units.get(key) ?? []), name])
}

const candidates = []
const other = { id: 'minor-other', kind: 'minor', label: 'minor/patch updates (other packages)', packages: {}, from: {} }

for (const [key, members] of units) {
  const isGroup = !key.startsWith('pkg:')
  const label = isGroup ? key : key.slice(4)
  const currentMajor = major(direct[members[0]].version)
  // 'minor' = newest version inside the current major. 'major' = newest version of the newest major, plus the
  // next major step (e.g. 5 -> 6 when 7 is out) so that a too-new major does not block the step before it.
  const steps = [{ kind: 'minor', exact: null }]
  if (!flag('--no-major') && !members.some((m) => config.ignoreMajor?.includes(m))) {
    steps.push({ kind: 'major', exact: null })
    steps.push({ kind: 'major', exact: currentMajor + 1, intermediate: true })
  }
  for (const { kind, exact, intermediate } of steps) {
    // A lockstep group moves to the lowest version that all of its members have published.
    const targets = members.map((m) => target(m, kind, exact))
    if (targets.some((t) => t === null)) {
      // Nothing newer, or only a partial release so far (some members have a newer version, some don't): wait.
      if (isGroup && targets.some((t) => t !== null)) console.log(`wait ${label}: ${kind} release incomplete`)
      continue
    }
    const version = lowest(targets)
    if (intermediate && major(version) === major(lowest(members.map((m) => target(m, 'major'))))) continue // same as the newest major
    const packages = Object.fromEntries(members.map((m) => [m, spec(m, version)]))
    const from = Object.fromEntries(members.map((m) => [m, spec(m, direct[m].version)]))
    if (kind === 'minor' && !isGroup) {
      Object.assign(other.packages, packages)
      Object.assign(other.from, from)
    } else {
      const slug = label.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')
      candidates.push({
        id: `${kind}-${slug}${intermediate ? `-v${major(version)}` : ''}`,
        kind,
        label: `${label} (${kind}${kind === 'major' ? ` ${major(version)}` : ''})`,
        // Sort key: when several majors of the same package pass, the highest one wins.
        rank: version,
        packages,
        from,
      })
    }
  }
}
if (Object.keys(other.packages).length) candidates.push(other)

// --- lockfile-only refresh (transitive dependencies inside the existing ranges) ---
if (flag('--check-lockfile')) {
  // `npm update` re-resolves everything inside the ranges (and raises caret floors in package.json).
  const files = ['package.json', 'package-lock.json']
  const before = files.map((f) => readFileSync(f, 'utf8'))
  try {
    execSync('npm update --package-lock-only --ignore-scripts', { stdio: 'inherit' })
    if (files.some((f, i) => readFileSync(f, 'utf8') !== before[i])) {
      candidates.push({ id: 'lockfile', kind: 'lockfile', label: 'npm update (newer versions inside the existing ranges)', packages: {}, from: {} })
    }
  } finally {
    files.forEach((f, i) => writeFileSync(f, before[i])) // leave the checkout untouched; each job re-applies its own candidate
  }
}

// --- skip what already failed with exactly these versions -------------------
const signature = (c) => JSON.stringify(c.packages)
const skipped = []
const active = []
for (const c of candidates) {
  const prev = previouslyFailed[c.id]
  // The lockfile candidate has no fixed versions: always retry it (it is cheap when nothing changed).
  if (c.kind !== 'lockfile' && prev && prev === signature(c)) skipped.push({ id: c.id, label: c.label, signature: prev })
  else active.push(c)
}

const plan = { candidates: active, skipped, previouslyFailed }
writeJson(value('--out', 'deps-plan.json'), plan)

console.log(`\n${active.length} candidate(s), ${skipped.length} skipped (failed before with the same versions)`)
for (const c of active) {
  console.log(`- ${c.id}: ${Object.entries(c.packages).map(([n, v]) => `${n} ${c.from[n]} -> ${v}`).join(', ') || c.label}`)
}
for (const s of skipped) console.log(`- ${s.id}: skipped`)

setOutput('count', String(active.length))
setOutput('matrix', JSON.stringify({ include: active.map((c) => ({ id: c.id, kind: c.kind, label: c.label, packages: JSON.stringify(c.packages) })) }))
