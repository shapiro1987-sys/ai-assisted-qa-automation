---
name: pom-conventions
description: Enforces Playwright Page Object Model conventions for Didaxis tests. Use whenever creating or refactoring specs, locators, pages/, LoginPage, ProgramsPage, NewProgramModal, or when the user mentions POM, page objects, or inline locators.
---

# Playwright POM conventions

Specs describe behavior. Page Objects own locators and user actions.
Never put `getByRole` / `getByLabel` / `getByText` / CSS / XPath in a spec.

## Layout

```
pages/
  LoginPage.ts
  ProgramsPage.ts
  NewProgramModal.ts
tests/
  *.spec.ts
```

Minimum pages: `LoginPage`, `ProgramsPage`, `NewProgramModal`.
Compose the modal on `ProgramsPage` (`readonly newProgramModal`).

## Page Object rules

1. Locators are `readonly` properties assigned in the constructor.
2. Locators use `getByRole` / `getByLabel` / `getByText` only — no CSS, no XPath.
3. Methods perform user actions (`goto`, `openNewProgramForm`, `createProgram`, `fill`, `submit`). No `expect()` in a Page Object.
4. Parameterized locators are methods that return a `Locator` (e.g. `programInList(name)`).
5. Scope modal fields to the dialog: `this.dialog.getByLabel('Program Name')`.

## Spec rules

1. Instantiate the page in the test or `beforeEach`. Call `goto()` / actions from the POM.
2. Every `expect()` stays in the spec and targets POM locators:
   `await expect(programs.heading).toBeVisible()`.
3. Test body has **zero inline locators**.
4. Didaxis specs that need a session: `test.use({ storageState: authStorageFile })`.
5. Login-page specs: `test.use({ storageState: { cookies: [], origins: [] } })`.
6. Specs that create programs: import `test` from `fixtures/cleanup.fixture.ts` and track IDs (see `api-cleanup` skill).

## Do / don't

```ts
// Page Object — locators + actions only
export class ProgramsPage {
  readonly heading: Locator;
  readonly newProgramButton: Locator;
  readonly newProgramModal: NewProgramModal;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Programs', level: 2 });
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.newProgramModal = new NewProgramModal(page);
  }

  async goto() { await this.page.goto(programsUrl); }
  async openNewProgramForm() { await this.newProgramButton.click(); }
}

// Spec — no locators
await programs.goto();
await programs.openNewProgramForm();
await expect(programs.newProgramModal.dialog).toBeVisible();
```

```ts
// Don't: expect() inside a Page Object
async openNewProgramForm() {
  await this.newProgramButton.click();
  await expect(this.newProgramModal.dialog).toBeVisible(); // no
}

// Don't: locators in the spec
await page.getByRole('button', { name: '+ New Program' }).click();
```

## When adding a page

1. Put the class in `pages/<Name>.ts`.
2. Wire it from the spec. Do not grow `didaxis-helpers.ts` with new locators.
3. Include `pages/**/*.ts` in `tsconfig.json` if a new tree is added.
