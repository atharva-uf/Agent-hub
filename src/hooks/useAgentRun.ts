import { useCallback, useEffect, useRef, useState } from "react";
import {
  STEPS,
  type LogLine,
  type RunResult,
  type RunStatus,
  type StepName,
  type StepState,
  type TaskType,
} from "@/types";
import { asFailure, scriptFor, type ScriptedLine } from "@/mock/logs";

function nowTime() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

interface RunState {
  status: RunStatus;
  task: TaskType | null;
  taskStartedAt: number | null;
  logs: LogLine[];
  steps: Record<StepName, { state: StepState; startedAt?: number; durationMs?: number }>;
  result: RunResult | null;
}

const initialSteps = () =>
  Object.fromEntries(STEPS.map((s) => [s, { state: "pending" as StepState }])) as RunState["steps"];

const INITIAL: RunState = {
  status: "idle",
  task: null,
  taskStartedAt: null,
  logs: [],
  steps: initialSteps(),
  result: null,
};

export function useAgentRun(repoName: string) {
  const [state, setState] = useState<RunState>(INITIAL);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const counter = useRef(0);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const start = useCallback(
    (task: TaskType, _config?: string) => {
      clearTimers();
      counter.current = 0;
      const willFail = Math.random() < 0.2;
      const happy = scriptFor(task);
      const lines: ScriptedLine[] = willFail ? asFailure(happy) : happy;

      const startedAt = Date.now();
      setState({
        status: "running",
        task,
        taskStartedAt: startedAt,
        logs: [],
        steps: initialSteps(),
        result: null,
      });

      let cumulative = 0;
      lines.forEach((line, i) => {
        const delay = 600 + Math.round(Math.random() * 500); // 600-1100ms
        cumulative += delay;
        const t = setTimeout(() => {
          setState((prev) => {
            if (prev.taskStartedAt !== startedAt) return prev; // stale
            const message = line.message
              .replace("${REPO}", repoName)
              .replace("${RUN}", String(startedAt).slice(-6));
            const nextLogs: LogLine[] = [
              ...prev.logs,
              { id: `${startedAt}-${counter.current++}`, time: nowTime(), level: line.level, message },
            ];
            const steps = { ...prev.steps };
            if (line.step) {
              steps[line.step] = { state: "active", startedAt: Date.now() };
            }
            if (line.endStep) {
              const prior = steps[line.endStep];
              steps[line.endStep] = {
                state: "success",
                startedAt: prior?.startedAt,
                durationMs: prior?.startedAt ? Date.now() - prior.startedAt : undefined,
              };
            }
            return { ...prev, logs: nextLogs, steps };
          });
        }, cumulative);
        timers.current.push(t);
      });

      // finalize
      const finalT = setTimeout(() => {
        setState((prev) => {
          if (prev.taskStartedAt !== startedAt) return prev;
          const steps = { ...prev.steps };
          if (willFail) {
            // mark first non-success step as error, remaining stay pending
            const firstNotDone = STEPS.find((s) => steps[s].state !== "success");
            if (firstNotDone) {
              const prior = steps[firstNotDone];
              steps[firstNotDone] = {
                state: "error",
                startedAt: prior?.startedAt,
                durationMs: prior?.startedAt ? Date.now() - prior.startedAt : undefined,
              };
            }
          }
          const durationMs = Date.now() - startedAt;
          const result: RunResult = willFail
            ? {
                testsPassed: 397,
                testsFailed: 15,
                issuesDetected: 6,
                issuesFixed: 0,
                durationMs,
                confidence: "review",
              }
            : {
                testsPassed: 412,
                testsFailed: 0,
                issuesDetected: task === "deps" ? 4 : task === "refactor" ? 14 : 0,
                issuesFixed: task === "deps" ? 4 : task === "refactor" ? 14 : 0,
                prUrl: task === "pr" || task === "deps" ? `https://git.acme.dev/${repoName}/pull/${Math.floor(100 + Math.random() * 900)}` : undefined,
                durationMs,
                confidence: durationMs < 18000 ? "high" : "review",
              };
          return {
            ...prev,
            status: willFail ? "failure" : "success",
            steps,
            result,
          };
        });
      }, cumulative + 500);
      timers.current.push(finalT);
    },
    [repoName],
  );

  const reset = useCallback(() => {
    clearTimers();
    setState(INITIAL);
  }, []);

  return { ...state, start, reset };
}
