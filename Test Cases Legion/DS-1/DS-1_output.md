# Test Plan: Create new academic program (DS-1)

**Jira:** [DS-1](https://legionqaschool.atlassian.net/browse/DS-1) — Story, In Progress, High  
**User story:** As an admin user, I want to create a new academic program so that I can begin designing its curriculum structure.  
**Reference:** Confluence — Program Setup & Management > Overview  
**Automation:** `tests/ds1-create-program.spec.ts` (previous version: `.old/ds1-create-program_old.spec.ts`)

## Jira acceptance criteria (required coverage)

### AC-001 — Navigate to program creation form

**Maps to:** `AC-001 — Navigate to program creation form` in Playwright

**Preconditions:** Logged in as admin.

**Expected:** Programs page; "+ New Program" opens form with Program Name and Description.

```gherkin
Scenario: Navigate to program creation form
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description
```

**Gap addressed vs prior automation:** Assert Programs heading, **New Program** dialog visible, and both fields (not only field visibility after modal open).

---

### AC-002 — Successfully create a program

**Maps to:** `AC-002 — Successfully create a program (modal closes, list shows name)` in Playwright

**Preconditions:** On program creation form.

**Expected:** After Create, modal closes and list shows the new program name.

```gherkin
Scenario: Successfully create a program
  Given I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
```

**Gaps addressed vs prior automation:**

- Explicit **modal closes** before list assertions (Jira ordering).
- Assert **program name** appears in the list (prior TC-002 only asserted description text).

---

### AC-003 — Validation prevents empty program name

**Maps to:** `AC-003 — Validation prevents empty program name` in Playwright

**Preconditions:** On program creation form.

**Expected:** Create disabled when Program Name is empty.

```gherkin
Scenario: Validation prevents empty program name
  Given I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

**Gap addressed vs prior automation:** Assert Program Name field is empty when Description is filled (matches AC wording).

---

## Extended automation (not in Jira AC)

| ID | Title |
|----|--------|
| TC-004 | Program created with name only (empty description) |
| TC-005 | Duplicate program name rejected |
| TC-006 | Double-click Create does not duplicate |
| TC-007 | Name at max length (100) accepted |
| TC-008 | Name over 100 characters rejected |
| TC-009 | Description at max length (500) accepted |
| TC-010 | Description over 500 characters rejected |
| TC-011 | Special characters in program name accepted |
| TC-012 | Whitespace-only name treated as empty |

Full narrative steps: see `.old/DS-1_output_old.md`.
