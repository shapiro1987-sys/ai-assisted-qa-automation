---
name: a11y-checks
description: Adds Playwright axe-core scans whenever a page spec is created or a Page Object is introduced. Use when writing or extending Playwright tests, pages/, *.spec.ts, or a new Didaxis screen — even if the user does not mention accessibility, a11y, axe, or WCAG.
---

# Accessibility checks (axe)

Every new Didaxis page that gets a spec also gets an axe scan. Do this
unprompted. Do not wait for the user to ask for a11y.

## When this applies

- Creating `pages/<Name>.ts` or `tests/<name>.spec.ts` for a screen
- Adding a major UI surface (page, dialog, modal) to an existing POM

Skip: TodoMVC, Playwright.dev example specs, setup-only files, pure API scripts.

## What to add

1. Prefer `tests/<page>.a11y.spec.ts` (see `tests/programs.a11y.spec.ts`).
2. Navigate only through POMs. Zero inline locators in the spec.
3. Authenticated screens: `test.use({ storageState: authStorageFile })`.
   Login screen: `test.use({ storageState: { cookies: [], origins: [] } })`.
4. Scan with `@axe-core/playwright`:

```ts
const results = await new AxeBuilder({ page }).analyze();
await expectNoAxeViolations(results.violations);
```

5. For a dialog/component, add **one** scoped scan:

```ts
await new AxeBuilder({ page }).include(form.axeIncludeSelector).analyze();
```

Axe `.include()` takes a selector, not a Playwright locator. Put a
role-based selector on the POM (`axeIncludeSelector = '[role="dialog"]'`).

## Violations

If axe finds real violations, DO NOT disable rules to go green — record them
(they may be a bug for the bug-reporter skill). Only `.disableRules()` with a
commented reason.

- Keep `expect(violations).toEqual([])` so the spec fails.
- Attach `axe-violations.json` on the test (ids, impact, help, targets).
- File a product Bug with `jira-bug-reporter` when the user asks, or note
  the findings in the reply.

Allowed:

```ts
.disableRules(['duplicate-id']) // vendor widget injects a duplicate id
```

Not allowed: stripping `color-contrast` (or any rule) only so CI is green.

Reuse `expectNoAxeViolations` from `tests/programs.a11y.spec.ts` or copy that helper.

## Checklist

- [ ] `AxeBuilder({ page }).analyze()` on the full page after POM `goto()`
- [ ] `.include(...)` for a modal/component when one exists
- [ ] No unexplained `.disableRules()`
- [ ] Violations attached, not swallowed
