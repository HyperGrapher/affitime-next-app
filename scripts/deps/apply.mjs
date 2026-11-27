#!/usr/bin/env node
// Writes new version specs into package.json. Usage: node scripts/deps/apply.mjs '{"next":"16.5.0"}'
// (values are complete specs such as "^5.4.0" or "3.95.0": exact pins stay exact, carets stay carets)
import { readJson, writeJson, SECTIONS } from './lib.mjs'

const updates = JSON.parse(process.argv[2] ?? '{}')
const pkg = readJson('package.json')
let changed = 0
for (const [name, spec] of Object.entries(updates)) {
  const section = SECTIONS.find((s) => pkg[s]?.[name])
  if (!section) throw new Error(`${name} is not a dependency in package.json`)
  if (pkg[section][name] !== spec) {
    console.log(`${name}: ${pkg[section][name]} -> ${spec}`)
    pkg[section][name] = spec
    changed++
  }
}
writeJson('package.json', pkg)
console.log(`${changed} package(s) changed in package.json`)
