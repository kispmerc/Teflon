import { system } from "@minecraft/server";

const activeRuns = new Map();

export function registerThrottledTask(name, callback, intervalTicks) {
  if (activeRuns.has(name)) return;

  const runId = system.runInterval(() => {
    try {
      callback();
    } catch (err) {}
  }, intervalTicks);

  activeRuns.set(name, runId);
}

export function stopThrottledTask(name) {
  const runId = activeRuns.get(name);
  if (runId === undefined) return;
  system.clearRun(runId);
  activeRuns.delete(name);
}

export function stopAllThrottledTasks() {
  for (const name of activeRuns.keys()) {
    stopThrottledTask(name);
  }
}
