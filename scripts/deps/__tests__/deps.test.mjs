import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compare, groupOf, isStable, lowest, major, matches, parseSpec } from "../lib.mjs";

const here = path.dirname(new URL(import.meta.url).pathname);
const scripts = path.join(here, "..");
const config = JSON.parse(readFileSync(path.join(scripts, "config.json"), "utf8"));

describe("version helpers", () => {
  it("compares semver triples numerically", () => {
    expect(compare("1.10.0", "1.9.9")).toBeGreaterThan(0);
    expect(compare("2.0.0", "10.0.0")).toBeLessThan(0);
    expect(compare("1.2.3", "1.2.3")).toBe(0);
    expect(major("16.4.6")).toBe(16);
    expect(lowest(["16.5.0", "16.4.9", "16.10.0"])).toBe("16.4.9");
  });
  it("only treats plain x.y.z as stable", () => {
    expect(isStable("7.10.1")).toBe(true);
    expect(isStable("8.0.0-rc.36")).toBe(false);
    expect(isStable("5.9")).toBe(false);
  });
  it("parses plain specs and skips ranges/tags", () => {
    expect(parseSpec("^4.6.7")).toEqual({ prefix: "^", version: "4.6.7" });
    expect(parseSpec("5.9.3")).toEqual({ prefix: "", version: "5.9.3" });
    expect(parseSpec("5.9")).toBeNull();
    expect(parseSpec("latest")).toBeNull();
    expect(parseSpec(">=1.0.0")).toBeNull();
  });
  it("matches wildcard patterns", () => {
    expect(matches("@trpc/*", "@trpc/server")).toBe(true);
    expect(matches("@trpc/*", "@trpcx/server")).toBe(false);
    expect(matches("next", "next")).toBe(true);
  });
});

describe("lockstep groups (config.json)", () => {
  it("keeps framework packages that must share a version together", () => {
    expect(groupOf(config, "eslint-config-next")).toBe(groupOf(config, "next"));
    expect(groupOf(config, "react-dom")).toBe(groupOf(config, "react"));
    expect(groupOf(config, "@prisma/client")).toBe(groupOf(config, "prisma"));
    expect(groupOf(config, "@prisma/adapter-pg")).toBe(groupOf(config, "prisma"));
    expect(groupOf(config, "@trpc/tanstack-react-query")).toBe(groupOf(config, "@trpc/server"));
    expect(groupOf(config, "@tailwindcss/postcss")).toBe(groupOf(config, "tailwindcss"));
    expect(groupOf(config, "zod")).toBeNull();
  });
  it("every lockstep/ignore entry refers to something that exists in package.json (or is a wildcard)", () => {
    const pkg = JSON.parse(readFileSync(path.join(scripts, "../../package.json"), "utf8"));
    const all = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    for (const name of [...config.ignore, ...config.ignoreMajor]) expect(all, `${name} is configured but not installed`).toContain(name);
    for (const patterns of Object.values(config.lockstep)) {
      for (const p of patterns) expect(all.some((n) => matches(p, n)), `lockstep pattern ${p} matches nothing`).toBe(true);
    }
  });
});

describe("apply.mjs / combine.mjs", () => {
  function sandbox() {
    const dir = mkdtempSync(path.join(tmpdir(), "deps-"));
    writeFileSync(path.join(dir, "package.json"), JSON.stringify({ dependencies: { a: "^1.0.0", b: "2.0.0" }, devDependencies: { c: "~3.1.0" } }, null, 2));
    return dir;
  }
  const run = (script, args, cwd, env = {}) => execFileSync("node", [path.join(scripts, script), ...args], { cwd, env: { ...process.env, ...env }, encoding: "utf8" });

  it("apply writes complete specs into the right section and keeps prefixes", () => {
    const dir = sandbox();
    run("apply.mjs", [JSON.stringify({ a: "^1.2.0", b: "2.1.0", c: "~3.2.0" })], dir);
    const pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"));
    expect(pkg.dependencies).toEqual({ a: "^1.2.0", b: "2.1.0" });
    expect(pkg.devDependencies).toEqual({ c: "~3.2.0" });
  });

  it("apply refuses packages that are not dependencies", () => {
    expect(() => run("apply.mjs", [JSON.stringify({ nope: "1.0.0" })], sandbox())).toThrow();
  });

  it("combine applies passing candidates, drops failed ones and remembers failures", () => {
    const dir = sandbox();
    mkdirSync(path.join(dir, "results"));
    const plan = {
      candidates: [
        { id: "minor-other", kind: "minor", label: "x", packages: { a: "^1.2.0" }, from: { a: "^1.0.0" } },
        { id: "major-b", kind: "major", label: "b", rank: "3.0.0", packages: { b: "3.0.0" }, from: { b: "2.0.0" } },
        { id: "major-c", kind: "major", label: "c", rank: "4.0.0", packages: { c: "~4.0.0" }, from: { c: "~3.1.0" } },
      ],
      skipped: [],
    };
    writeFileSync(path.join(dir, "deps-plan.json"), JSON.stringify(plan));
    writeFileSync(path.join(dir, "results/minor-other.json"), JSON.stringify({ id: "minor-other", status: "success" }));
    writeFileSync(path.join(dir, "results/major-b.json"), JSON.stringify({ id: "major-b", status: "success" }));
    writeFileSync(path.join(dir, "results/major-c.json"), JSON.stringify({ id: "major-c", status: "failure" }));
    const out = path.join(dir, "gh-output");
    writeFileSync(out, "");
    run("combine.mjs", ["--plan", "deps-plan.json", "--results", "results"], dir, { GITHUB_OUTPUT: out });
    const outputs = Object.fromEntries(readFileSync(out, "utf8").trim().split("\n").map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
    expect(JSON.parse(outputs.packages)).toEqual({ a: "^1.2.0", b: "3.0.0" });
    expect(JSON.parse(outputs.safe_packages)).toEqual({ a: "^1.2.0" }); // fallback = without majors
    expect(outputs.has_majors).toBe("true");
    expect(outputs.any_failed).toBe("true");
    expect(JSON.parse(readFileSync(path.join(dir, "deps-failed.json"), "utf8"))).toEqual({ "major-c": JSON.stringify({ c: "~4.0.0" }) });
    expect(readFileSync(path.join(dir, "deps-summary.md"), "utf8")).toContain("❌ failed");
  });

  it("combine does not apply a candidate that has no result", () => {
    const dir = sandbox();
    writeFileSync(path.join(dir, "deps-plan.json"), JSON.stringify({ candidates: [{ id: "minor-other", kind: "minor", label: "x", packages: { a: "^1.2.0" }, from: {} }], skipped: [] }));
    const out = path.join(dir, "gh-output");
    writeFileSync(out, "");
    run("combine.mjs", ["--plan", "deps-plan.json", "--results", "results"], dir, { GITHUB_OUTPUT: out });
    expect(readFileSync(out, "utf8")).toContain("any_passed=false");
  });
});
