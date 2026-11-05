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

1. Prefer `tests/<page>.a11y.spec.ts`. One tag per test.
2. Navigate only through the existing POMs. Zero inline locators in the spec.
3. Authenticated screens: `test.use({ storageState: authStorageFile })`.
   Login screen: `test.use({ storageState: { cookies: [], origins: [] } })`.
4. Scan with `@axe-core/playwright`:

```ts
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze();
await expect(results.violations).toEqual([]);
```

5. Call `.include()` or `.exclude()` only when a third-party widget is noisy, and comment why. Do not scope a scan just to shrink it.
6. Add the keyboard check axe cannot do. On the programs page, tab to `programs.newProgramButton`, assert `toBeFocused()`, press Enter, and assert `programs.newProgramModal.dialog` is visible. Those locators stay on the POM.

## Violations

If the scan finds real violations, report them and stop. Never call `.disableRules()` to go green.

## Checklist

- [ ] `withTags(['wcag2a', 'wcag2aa'])` and `expect(results.violations).toEqual([])`
- [ ] `.include()` / `.exclude()` only for a noisy third-party widget, with a comment
- [ ] Keyboard: tab to the primary control, `toBeFocused()`, Enter, dialog open
- [ ] POM locators only, one tag per test
- [ ] No `.disableRules()`
