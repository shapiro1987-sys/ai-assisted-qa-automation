---
name: self-heal
description: Re-discovers one drifted Playwright locator from the Agent-Browser accessibility tree and patches only the page object. Use when the user says "the build is red because a locator broke", "fix the drifted selector", "the test broke after a UI change", or "heal the suite". Use it ONLY after triage classifies the red run as a test issue (drift), never for a real app bug.
---

# Self-heal

1. Require triage's drift classification, else stop and route to bug-reporter.
2. From the trace, find the failing locator and its POM.
3. Re-discover the element via the Agent-Browser a11y tree by its role + current accessible name.
4. Patch the locator in the POM, minimal role-based diff, never the spec's assertions.
5. Re-run and prove green WITH assertions unchanged (green via a weakened assertion is a bug, escalate).
6. Report the old->new locator diff + the green run. One repair per run; every heal becomes a PR.
