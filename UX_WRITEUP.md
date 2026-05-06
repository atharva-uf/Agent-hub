# UX Design Rationale — Agent Hub

## Overview

Agent Hub is a developer portal for triggering and monitoring AI agent tasks against code repositories. The central UX challenge is not a visual one — it is a trust problem. A developer handing off a task to an autonomous agent is giving up control of something they are professionally responsible for. Every design decision in this portal addresses that tension: how do you make a developer feel informed, in control, and confident while an agent acts on their behalf?

The interface draws from terminal aesthetics deliberately. Developers already trust terminals. They read monospace output, interpret color-coded log levels, and understand status as a sequence of states. The goal was not to make the portal look like a consumer SaaS product — it was to make it feel like a tool a senior engineer would build for their own team.

---

## Key Design Decisions

### A. Terminal-native log output with semantic color coding

Log lines are color-coded to match conventions developers already carry from CI/CD systems and terminal sessions:

| Level | Color | Meaning |
|---|---|---|
| INFO | slate | Standard progress output |
| CMD | purple | Shell commands being executed |
| SUCCESS | green | Passing assertions, completed steps |
| WARN | amber | Non-fatal issues worth noting |
| ERROR | red | Failures requiring attention |

This is not decorative. A developer scanning 40 lines of output should be able to locate a failure in under two seconds. Color is the fastest pre-attentive channel for that scan. The mapping mirrors what developers already expect from tools like Jest, ESLint, and GitHub Actions.

The log terminal auto-scrolls as new lines stream in, matching the behavior of `tail -f` — a pattern every backend developer already understands. Scroll is preserved if the user manually scrolls up to inspect earlier output.

### B. Streaming cadence over instant results

Log lines are delivered one at a time with a 600–1100ms randomised delay between each line, not dumped all at once after the task completes. This is a deliberate UX choice, not a technical constraint.

Instant delivery hides the process. A developer watching a real CI pipeline sees the log build line by line — they can tell when something is taking too long, when a step is retrying, or when output has stalled. That temporal information is signal. Collapsing it into a single result dump removes the sense of watching a real system work.

The variable delay (not a fixed interval) prevents the output from feeling mechanical. Real processes have irregular output cadence.

### C. One-click retry, no confirmation dialog

When a task fails, the retry button is immediately available in the panel header. It does not ask "are you sure?" — it just replays.

A failed agent run is already a frustrating moment. Adding a confirmation dialog communicates distrust of the developer's intent. They pressed retry; they meant retry. The design should get out of the way. Timer cleanup and state reset happen silently before the new run begins, so there is no risk of a stale run overlapping a fresh one.

### D. Three independent success signals

Task completion is communicated through three simultaneous, redundant signals:

1. **Status badge** (top of the agent panel) — changes from "Running" to "Success" or "Failure"
2. **Timeline** — all step dots transition to green checkmarks on success
3. **Result summary card** — appears below the log output with test counts, issue totals, duration, and a confidence rating

This redundancy is intentional. In a real system, a developer might be looking at the timeline, or the log, or have scrolled down. Any one signal should be sufficient to understand the outcome. Relying on a single status badge means a developer who has scrolled past it gets no feedback unless they scroll back up.

The confidence rating ("High confidence" vs "Review recommended") gives the developer a second-order signal beyond pass/fail — it surfaces whether the agent is certain of its own output, which is the right question to ask when trusting an autonomous system.

### E. The execution details drawer as a post-mortem tool

The "View details" drawer is not the primary interface during a run — the log terminal in the main panel handles that. The drawer is designed for after a run completes, when a developer wants to understand what happened step by step.

It surfaces three things not visible in the main panel:

1. **Environment context** — Node version, runtime, region, runner pool. A developer debugging a failure wants to know exactly where the run executed.
2. **Step-by-step duration breakdown** — Knowing the Test step took 5.5s vs the usual 1.5s is diagnostic information. A per-step timing table is more useful than a single total duration.
3. **Log level summary counts** — A quick count of ERRORs, WARNs, and CMDs gives an at-a-glance read on run health without scrolling through the full output.

These three sections together are what a developer would reconstruct manually by tailing logs and checking CI metadata. The drawer pre-assembles that picture.

---

## Empty and Error States

Two states reviewers typically test first:

**No task running:** The agent panel shows a centred prompt — "No execution started" — with a single "Run Agent Task" CTA. There is no skeleton loader, no placeholder data, no fake progress. Empty is communicated honestly.

**Search returns no results:** The repo list shows "No repositories match your filters" inline where results would appear. No separate error page, no redirect.

**Unknown repo ID:** The `/repos/:id` route throws `notFound()` at the loader level and renders a dedicated not-found component with a back link. The URL space is treated as a real API surface.

---

## What Was Intentionally Left Out

- No light mode. The target user is a developer working in a terminal-adjacent environment. A forced dark theme is not an accessibility failure — it is an audience decision.
- No optimistic UI for integrations. The connect/disconnect flow shows a brief loading state before confirming. Pretending the action completed before it has is a pattern that erodes trust in tools that are supposed to be authoritative.
- No pagination on the log terminal. Real log viewers (`less`, `journalctl`) do not paginate mid-stream. The terminal scrolls; developers scroll.
