# Test Plan: Edit existing program details (DS-2)

**Jira:** [DS-2](https://legionqaschool.atlassian.net/browse/DS-2) — Story, In Progress, High  
**User story:** As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.  
**Automation:** `tests/ds2-edit-program.spec.ts` (previous version: `ds2-edit-program_old.spec.ts`)

## Jira acceptance criteria (required coverage)

### AC-001 — Open program for editing

**Maps to:** `AC-001 — Open program for editing (form pre-populated)` in Playwright

**Preconditions:** Admin on Programs page; program "Web Development 2026" exists.

**Expected:** Edit form opens with Program Name and Description pre-populated.

```gherkin
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data
```

---

### AC-002 — Successfully edit a program name

**Maps to:** `AC-002 — Successfully edit a program name (modal closes, list updates)` in Playwright

**Preconditions:** User is editing "Web Development 2026".

**Expected:** Modal closes; list shows "Web Development 2026 - Updated" immediately.

```gherkin
Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"
```

**Gap addressed vs prior automation:** Explicit assertion that the edit modal closes before verifying the updated row in the list (Jira "Then the modal closes").

---

### AC-003 — Edit preserves unchanged fields

**Maps to:** `AC-003 — Edit preserves unchanged fields (description-only change)` in Playwright

**Preconditions:** User is editing a program.

**Expected:** After changing only Description and saving, Program Name and other fields remain unchanged.

```gherkin
Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged
```

**Gaps addressed vs prior automation:**

- Assert prior description text is no longer shown after update.
- Re-open edit and verify Program Name and Description fields still hold the expected values (stronger "unchanged" / persisted state).

---

## Extended automation (not in Jira AC)

The following remain in `ds2-edit-program.spec.ts` as regression coverage beyond the three Jira scenarios:

| ID | Title |
|----|--------|
| TC-004 | Description can be cleared during edit |
| TC-005 | Save disabled when Program Name is cleared |
| TC-006 | Duplicate name on edit rejected |
| TC-007 | Cancel discards unsaved changes |
| TC-008 | Double-click Save does not apply twice |
| TC-009 | Name at max length (100) accepted |
| TC-010 | Name over 100 characters rejected |
| TC-011 | Description at max length (500) accepted |
| TC-012 | Whitespace-only name treated as empty |
| TC-013 | Special characters in name preserved |

Full narrative steps for extended cases: see `DS-2_output_old.md`.
