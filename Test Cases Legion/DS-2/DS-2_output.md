# Test Plan: Edit existing program details (DS-2)

**Jira:** [DS-2](https://legionqaschool.atlassian.net/browse/DS-2) — **Edit existing program details** (Story, In Progress, High)  
**User story:** As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.  
**Automation:** `tests/ds2-edit-program.spec.ts` (prior sync: `ds2-edit-program_old.spec.ts`)  
**Explored on:** `https://test.didaxis.studio` — Programs list, Edit Program modal (browser MCP, Oct 2025)

## Live app notes (vs Jira AC)

| Area | Observed on test.didaxis.studio |
|------|----------------------------------|
| Open edit | Row action `Edit {Program Name}` (accessible name includes full program title) |
| Edit modal | `role=dialog` name **Edit Program**; heading **Edit Program** |
| Core fields | **Program Name**, **Description** (match Jira) |
| Actions | **Save**, **Cancel**; Save disabled when Program Name cleared / whitespace-only |
| Extra fields | **Show AI Generation Config**, Total Program Hours, session/exam defaults, audience/focus, sync/async (same family as create) |
| Length limits | No HTML `maxlength` on name/description in edit form |

**Auth:** Same as DS-1 — `tests/didaxis-auth.setup.ts` + `tests/.didaxis-auth.json` via `playwright.config.ts`.

---

## Jira acceptance criteria (required coverage)

### AC-001 — Open program for editing

**Playwright:** `AC-001 — Open program for editing (form pre-populated)`

```gherkin
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data
```

---

### AC-002 — Successfully edit a program name

**Playwright:** `AC-002 — Successfully edit a program name (modal closes, list updates)`

```gherkin
Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"
```

---

### AC-003 — Edit preserves unchanged fields

**Playwright:** `AC-003 — Edit preserves unchanged fields (description-only change)`

```gherkin
Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged
```

---

## Extended automation (beyond Jira AC)

| ID | Playwright test name | Notes from live app |
|----|----------------------|---------------------|
| TC-004 | `TC-004 — Description can be cleared during edit` | Empty description allowed on save |
| TC-005 | `TC-005 — Save button disabled when Program Name is cleared` | Cancel closes without save |
| TC-006 | `TC-006 — Duplicate name on edit is rejected` | `already exists` / `duplicate` |
| TC-007 | `TC-007 — Cancel discards unsaved changes` | |
| TC-008 | `TC-008 — Double-clicking Save does not apply changes twice` | Modal closes once |
| TC-009 | `TC-009 — Program name with 100 characters is accepted on edit` | |
| TC-010 | `TC-010 — Program name with 101 characters is accepted on edit (no client maxlength)` | **Updated** from “rejected” |
| TC-011 | `TC-011 — Description with 500 characters is accepted on edit` | |
| TC-012 | `TC-012 — Whitespace-only Program Name is treated as empty on edit` | |
| TC-013 | `TC-013 — Special characters in edited name are preserved` | |
| TC-014 | `TC-014 — AI Generation Config fields visible on edit form` | **New** from edit modal |

Narrative detail for legacy cases: `DS-2_output_old.md`.
