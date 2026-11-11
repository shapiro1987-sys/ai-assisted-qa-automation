---
name: explore-and-generate
description: >-
  Maps the live UI against tests/ and proposes one uncovered flow as Gherkin.
  Use this skill whenever the user says "find what we're not testing",
  "explore <page> for untested flows", or "expand coverage", or asks which
  flows are untested — even if they do not name this skill. Do NOT use it
  when a ticket already exists (that's jira-ticket-analyzer; this is for
  when there's no ticket).
---

# Explore and generate

Read-only exploration. Do not edit repository files, do not implement the spec, and do not file a ticket. Stop after the plan so a human can review it. `test-writer` implements it.

## Steps

1. Map covered flows by reading `tests/`.
2. Crawl the target via the Playwright MCP and read the a11y tree, not pixels. Use `browser_snapshot`. Do not decide what the UI supports from screenshots.
3. Enumerate real user flows the UI supports. Only flows you observed.
4. Diff to find the coverage gap.
5. Pick the highest-value uncovered flow with a reason, one per run.
6. Output a Gherkin test plan (positive path + one edge case, every Then assertable) for the test-writer to implement.

## Output

State the picked flow and the reason it is the highest-value gap, then:

```gherkin
Feature: <observed flow>

  # Positive path
  Scenario: <name>
    Given <observed starting state>
    When <the user action>
    Then <observable outcome a test can assert>

  # Edge case
  Scenario: <name>
    Given <observed starting state>
    When <the boundary action>
    Then <observable outcome a test can assert>
```

Every `Then` names something visible or returned: text, visibility, URL, enabled state, or a count. No `Then` that only restates the action.
