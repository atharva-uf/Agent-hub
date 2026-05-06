import type { LogLevel, StepName, TaskType } from "@/types";

export interface ScriptedLine {
  level: LogLevel;
  message: string;
  step?: StepName; // when this line begins, advance/start this step
  endStep?: StepName; // when this line is appended, mark step success
}

const base: ScriptedLine[] = [
  { level: "INFO", message: "Initializing agent runtime v1.4.2...", step: "Initialize" },
  { level: "INFO", message: "Authenticated as agent@acme.dev" },
  { level: "INFO", message: "Workspace prepared at /tmp/agent-run-7f1c", endStep: "Initialize" },
  { level: "INFO", message: "Cloning repository (depth=1)...", step: "Analyze" },
  { level: "CMD", message: "git clone --depth=1 git@github.com:acme/${REPO}.git" },
  { level: "INFO", message: "Indexing 1,284 files across 96 modules" },
  { level: "INFO", message: "Detected toolchain: Node 20.11, pnpm 9.1", endStep: "Analyze" },
];

const installSteps: ScriptedLine[] = [
  { level: "INFO", message: "Resolving dependencies from lockfile...", step: "Install" },
  { level: "CMD", message: "pnpm install --frozen-lockfile" },
  { level: "INFO", message: "Restored 412 packages from cache (cache hit 94%)" },
  { level: "SUCCESS", message: "Dependencies installed in 11.3s", endStep: "Install" },
];

const finalize: ScriptedLine[] = [
  { level: "INFO", message: "Composing run report...", step: "Report" },
  { level: "INFO", message: "Uploading artifacts to run store" },
  { level: "SUCCESS", message: "Report ready (12.4 KB)", endStep: "Report" },
  { level: "INFO", message: "Cleaning workspace...", step: "Finalize" },
  { level: "SUCCESS", message: "Agent run completed", endStep: "Finalize" },
];

const failureTail: ScriptedLine[] = [
  { level: "WARN", message: "3 flaky tests retried" },
  { level: "ERROR", message: "Assertion failed: expected status 200, got 503" },
  { level: "ERROR", message: "Step exited with non-zero status" },
];

export function scriptFor(task: TaskType): ScriptedLine[] {
  switch (task) {
    case "tests":
      return [
        ...base,
        ...installSteps,
        { level: "INFO", message: "Discovering test suites...", step: "Test" },
        { level: "CMD", message: "pnpm test --reporter=dot --shard=1/1" },
        { level: "INFO", message: "Running 412 tests across 38 files" },
        { level: "INFO", message: "  unit ........ 286 passed" },
        { level: "INFO", message: "  integration . 102 passed" },
        { level: "INFO", message: "  e2e ......... 24 passed" },
        { level: "SUCCESS", message: "All 412 tests passed in 47.2s", endStep: "Test" },
        ...finalize,
      ];
    case "refactor":
      return [
        ...base,
        ...installSteps,
        { level: "INFO", message: "Building call graph (LSP)...", step: "Test" },
        { level: "CMD", message: "agent refactor --strategy=safe-rename" },
        { level: "INFO", message: "Applied 14 codemods across 22 files" },
        { level: "INFO", message: "Running typecheck..." },
        { level: "SUCCESS", message: "tsc --noEmit clean (0 errors)" },
        { level: "INFO", message: "Re-running impacted test files" },
        { level: "SUCCESS", message: "63 of 63 affected tests pass", endStep: "Test" },
        ...finalize,
      ];
    case "deps":
      return [
        ...base,
        { level: "INFO", message: "Auditing dependency tree...", step: "Install" },
        { level: "CMD", message: "pnpm audit --json" },
        { level: "WARN", message: "2 moderate advisories detected" },
        { level: "INFO", message: "Computing safe upgrade plan..." },
        { level: "SUCCESS", message: "Plan: bump 4 packages, no breaking changes", endStep: "Install" },
        { level: "INFO", message: "Applying upgrades on branch agent/deps-${RUN}", step: "Test" },
        { level: "CMD", message: "pnpm up axios@^1.7 zod@^3.23 vite@^7.1 -L" },
        { level: "INFO", message: "Re-running test suite to validate" },
        { level: "SUCCESS", message: "All checks green", endStep: "Test" },
        ...finalize,
      ];
    case "pr":
      return [
        ...base,
        ...installSteps,
        { level: "INFO", message: "Generating diff against origin/main...", step: "Test" },
        { level: "CMD", message: "git diff --stat origin/main..HEAD" },
        { level: "INFO", message: "22 files changed, +614 −187" },
        { level: "INFO", message: "Drafting PR description from commits" },
        { level: "SUCCESS", message: "PR draft ready", endStep: "Test" },
        ...finalize,
      ];
  }
}

export function asFailure(lines: ScriptedLine[]): ScriptedLine[] {
  // truncate at the Test phase and append failure tail
  const cutIdx = lines.findIndex((l) => l.endStep === "Test");
  if (cutIdx === -1) return [...lines.slice(0, Math.max(3, lines.length - 4)), ...failureTail];
  return [...lines.slice(0, cutIdx), ...failureTail];
}
