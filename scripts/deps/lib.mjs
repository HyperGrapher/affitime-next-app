// Shared helpers for the dependency-update scripts. No third-party packages: plain Node + the public npm registry.
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs'

export const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))
export const writeJson = (file, data) => writeFileSync(file, JSON.stringify(data, null, 2) + '\n')

export const SECTIONS = ['dependencies', 'devDependencies', 'optionalDependencies']

/** Appends `key=value` to the GitHub Actions output file (or prints it when run locally). */
export function setOutput(key, value) {
  const line = `${key}=${typeof value === 'string' ? value : JSON.stringify(value)}\n`
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, line)
  else process.stdout.write(`[output] ${line}`)
}

export const isStable = (v) => /^\d+\.\d+\.\d+$/.test(v)
export const parse = (v) => v.split('.').map(Number)
export const major = (v) => parse(v)[0]
export function compare(a, b) {
  const [x, y] = [parse(a), parse(b)]
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]
  return 0
}
export const lowest = (versions) => versions.reduce((a, b) => (compare(a, b) <= 0 ? a : b))

/** "^1.2.3" -> { prefix: "^", version: "1.2.3" }; null for anything that is not a plain registry version. */
export function parseSpec(spec) {
  const m = /^([\^~]?)(\d+\.\d+\.\d+)$/.exec(spec)
  return m ? { prefix: m[1], version: m[2] } : null
}

export function matches(pattern, name) {
  return pattern.endsWith('*') ? name.startsWith(pattern.slice(0, -1)) : pattern === name
}

/** Name of the lockstep group a package belongs to, or null. */
export function groupOf(config, name) {
  for (const [group, patterns] of Object.entries(config.lockstep ?? {})) {
    if (patterns.some((p) => matches(p, name))) return group
  }
  return null
}

/** Published stable versions of a package from the public npm registry: { "1.2.3": deprecated(boolean) }. */
export async function registryVersions(name) {
  const url = `https://registry.npmjs.org/${name.replace('/', '%2f')}`
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/vnd.npm.install-v1+json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      return Object.fromEntries(
        Object.entries(data.versions ?? {})
          .filter(([v]) => isStable(v))
          .map(([v, meta]) => [v, Boolean(meta.deprecated)]),
      )
    } catch (err) {
      if (attempt >= 3) throw new Error(`Could not read ${name} from the npm registry: ${err.message}`)
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
}
