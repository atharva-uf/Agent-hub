export type Health = "healthy" | "warning" | "critical";
export type BuildStatus = "passing" | "failing" | "unknown";

export interface Repo {
  id: string;
  name: string;
  owner: string;
  description: string;
  language: string;
  languageColor: string;
  health: Health;
  lastUpdated: string; // ISO
  branch: string;
  lastCommit: { sha: string; message: string; author: string; at: string };
  openPRs: number;
  openIssues: number;
  buildStatus: BuildStatus;
  tags: string[];
  insights: {
    buildSuccessRate: number; // 0-100
    testCoverage: number; // 0-100
    avgMergeHours: number;
    dependencyHealth: number; // 0-100
    weeklyCommits: number[];
    stars: number;
    contributors: number;
    deploys: number;
  };
}

export type TaskType = "tests" | "refactor" | "deps" | "pr";

export const TASK_LABEL: Record<TaskType, string> = {
  tests: "Run tests",
  refactor: "Refactor code",
  deps: "Dependency scan",
  pr: "Create PR",
};

export type RunStatus = "idle" | "pending" | "running" | "success" | "failure";
export type StepState = "pending" | "active" | "success" | "error";

export const STEPS = [
  "Initialize",
  "Analyze",
  "Install",
  "Test",
  "Report",
  "Finalize",
] as const;
export type StepName = (typeof STEPS)[number];

export type LogLevel = "INFO" | "CMD" | "SUCCESS" | "WARN" | "ERROR";

export interface LogLine {
  id: string;
  time: string; // HH:MM:SS
  level: LogLevel;
  message: string;
}

export interface RunResult {
  testsPassed: number;
  testsFailed: number;
  issuesDetected: number;
  issuesFixed: number;
  prUrl?: string;
  durationMs: number;
  confidence: "high" | "review";
}
