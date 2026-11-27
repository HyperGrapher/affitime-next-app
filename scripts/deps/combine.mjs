#!/usr/bin/env node
/**
 * Combines the per-candidate test results into the set of updates to commit.
 * Usage: node scripts/deps/combine.mjs --plan deps-plan.json --results results/ [--summary summary.md] [--failed-out failed.json]
 * Result files: results/<id>.json = { "id": "...", "status": "success" | "failure" | "cancelled" | "skipped" }
 */
import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { readJson, writeJson, setOutput, compare as compareVersions } from './lib.mjs'

const args = process.argv.slice(2)
const value = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback)

const plan = readJson(value('--plan', 'deps-plan.json'))
const resultsDir = value('--results', 'results')
const results = {}
if (existsSync(resultsDir)) {
  for (const f of readdirSync(resultsDir).filter((f) => f.endsWith('.json'))) {
    const r = readJson(path.join(resultsDir, f))
    results[r.id] = r.status
  }
}

const status = (c) => results[c.id] ?? 'missing'
const missing = plan.candidates.filter((c) => !results[c.id])
for (const c of missing) console.log(`::warning::No test result was found for ${c.id}; it is not applied.`)
const passed = plan.candidates.filter((c) => status(c) === 'success')
const failed = plan.candidates.filter((c) => status(c) === 'failure')

// Minor/patch first, then majors on top: a passing major replaces the minor target of the same package.
const merge = (list) => {
  const out = {}
  for (const kind of ['minor', 'major']) {
    const ofKind = list.filter((c) => c.kind === kind)
    // Ascending by version so that the highest passing major of a package is applied last and wins.
    ofKind.sort((x, y) => compareVersions(x.rank ?? '0.0.0', y.rank ?? '0.0.0'))
    for (const c of ofKind) Object.assign(out, c.packages)
  }
  return out
}
const safe = passed.filter((c) => c.kind !== 'major')
const from = Object.assign({}, ...plan.candidates.map((c) => c.from))

setOutput('any_passed', String(passed.length > 0))
setOutput('has_majors', String(passed.some((c) => c.kind === 'major')))
setOutput('packages', JSON.stringify(merge(passed)))
setOutput('lockfile', String(passed.some((c) => c.kind === 'lockfile')))
setOutput('safe_packages', JSON.stringify(merge(safe)))
setOutput('safe_lockfile', String(safe.some((c) => c.kind === 'lockfile')))
setOutput('any_failed', String(failed.length > 0))

// Memory for the next run: do not retry a candidate that failed with exactly these versions.
const failedNext = {}
for (const s of plan.skipped) failedNext[s.id] = s.signature
for (const c of failed) failedNext[c.id] = JSON.stringify(c.packages)
writeJson(value('--failed-out', 'deps-failed.json'), failedNext)

// Human-readable report.
const icon = { success: '✅ passed', failure: '❌ failed', cancelled: '⚪ cancelled', missing: '⚪ no result' }
const changes = (c) =>
  Object.keys(c.packages).length
    ? Object.entries(c.packages).map(([n, v]) => `\`${n}\` ${from[n] ?? '?'} → ${v}`).join('<br>')
    : c.label
const lines = ['## Dependency updates', '', '| Candidate | Changes | Tests |', '| --- | --- | --- |']
for (const c of plan.candidates) lines.push(`| ${c.id} | ${changes(c)} | ${icon[status(c)] ?? status(c)} |`)
for (const s of plan.skipped) lines.push(`| ${s.id} | _same versions as an earlier failed run_ | ⏭️ skipped |`)
writeFileSync(value('--summary', 'deps-summary.md'), lines.join('\n') + '\n')

const body = Object.entries(merge(passed)).map(([n, v]) => `- ${n}: ${from[n] ?? '?'} -> ${v}`)
if (passed.some((c) => c.kind === 'lockfile')) body.push('- lockfile: transitive dependencies refreshed within their ranges')
writeFileSync(value('--commit-body', 'deps-commit-body.txt'), body.join('\n') + '\n')

console.log(lines.join('\n'))
console.log(`\npassed: ${passed.map((c) => c.id).join(', ') || '-'}\nfailed: ${failed.map((c) => c.id).join(', ') || '-'}`)
