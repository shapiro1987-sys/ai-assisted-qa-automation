# Test Plan: Edit existing program details (DS-2)

## Positive flows

### TC-001 — Edit form opens pre-populated with current program data

**Preconditions:** Admin user is logged in; program "Web Development 2026" exists on the Programs page.

**Steps:**
1. Navigate to the Programs page.
2. Click the edit icon on "Web Development 2026".

**Expected result:** Edit form opens with Program Name and Description fields pre-populated with current values.

**Priority:** High

```gherkin
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data
```

---

### TC-002 — Updated program name appears immediately in the list

**Preconditions:** Admin user is editing "Web Development 2026".

**Steps:**
1. Change Program Name to "Web Development 2026 - Updated".
2. Click Save.

**Expected result:** Modal closes; program list immediately shows "Web Development 2026 - Updated".

**Priority:** High

```gherkin
Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"
```

---

### TC-003 — Unchanged fields are preserved when only Description is edited

**Preconditions:** Program "Web Development 2026" exists with Description "Full-stack web development program"; admin user is editing it.

**Steps:**
1. Change Description to "Updated full-stack curriculum".
2. Leave Program Name unchanged.
3. Click Save.

**Expected result:** Program Name remains "Web Development 2026"; only Description is updated.

**Priority:** High

```gherkin
Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged
```

---

### TC-004 — Description can be cleared during edit

**Preconditions:** Program "Data Science 2026" exists with a non-empty Description; admin user is editing it.

**Steps:**
1. Clear the Description field.
2. Click Save.

**Expected result:** Program is saved with an empty Description; Name remains unchanged.

**Priority:** Medium

```gherkin
Scenario: Clear description on edit
  Given I am editing "Data Science 2026" with Description "Original description"
  When I clear the Description field
  And I click Save
  Then the program list shows "Data Science 2026" with an empty description
```

---

## Negative flows

### TC-005 — Save button disabled when Program Name is cleared

**Preconditions:** Admin user is editing an existing program.

**Steps:**
1. Clear the Program Name field.
2. Observe Save button state.

**Expected result:** Save button is disabled; changes are not persisted.

**Priority:** High

```gherkin
Scenario: Empty program name prevents save
  Given I am editing a program
  When I clear the Program Name field
  Then the Save button is disabled
```

---

### TC-006 — Duplicate name on edit is rejected

**Preconditions:** Programs "Web Development 2026" and "Data Science 2026" exist; admin user is editing "Data Science 2026".

**Steps:**
1. Change Program Name to "Web Development 2026".
2. Click Save.

**Expected result:** Error message indicates the name already exists; original name is preserved.

**Priority:** High

```gherkin
Scenario: Duplicate name rejected on edit
  Given programs "Web Development 2026" and "Data Science 2026" exist
  And I am editing "Data Science 2026"
  When I change the Name to "Web Development 2026"
  And I click Save
  Then I see an error indicating the name already exists
  And the program name remains "Data Science 2026"
```

---

### TC-007 — Cancel discards unsaved changes

**Preconditions:** Admin user is editing "Web Development 2026".

**Steps:**
1. Change Program Name to "Should Not Be Saved".
2. Click Cancel.

**Expected result:** Modal closes; program list still shows "Web Development 2026".

**Priority:** High

```gherkin
Scenario: Cancel discards edit changes
  Given I am editing "Web Development 2026"
  When I change the Name to "Should Not Be Saved"
  And I click Cancel
  Then the modal closes
  And the program list shows "Web Development 2026"
```

---

### TC-008 — Double-clicking Save does not apply changes twice

**Preconditions:** Admin user is editing a program with valid changes entered.

**Steps:**
1. Change Description to "Updated once".
2. Double-click Save rapidly.

**Expected result:** Change is saved once; no duplicate side effects or errors.

**Priority:** Medium

```gherkin
Scenario: Double-click Save submits only once
  Given I am editing "Web Development 2026"
  When I change the Description to "Updated once"
  And I double-click Save
  Then the modal closes
  And the program shows Description "Updated once" exactly once
```

---

## Edge cases

### TC-009 — Program name at maximum length (100 characters) is accepted on edit

**Preconditions:** Admin user is editing an existing program.

**Steps:**
1. Change Program Name to a 100-character string.
2. Click Save.

**Expected result:** Program is saved with the 100-character name.

**Priority:** Medium

```gherkin
Scenario: Edit name to max length accepted
  Given I am editing a program
  When I change the Name to a 100-character string
  And I click Save
  Then the modal closes
  And the program list shows the 100-character name
```

---

### TC-010 — Program name exceeding 100 characters is rejected on edit

**Preconditions:** Admin user is editing an existing program.

**Steps:**
1. Change Program Name to a 101-character string.
2. Attempt to click Save.

**Expected result:** Validation error is shown; change is not saved.

**Priority:** Medium

```gherkin
Scenario: Edit name over 100 characters rejected
  Given I am editing a program
  When I change the Name to a 101-character string
  And I click Save
  Then I see a validation error for Program Name
  And the original name is preserved
```

---

### TC-011 — Description at maximum length (500 characters) is accepted on edit

**Preconditions:** Admin user is editing an existing program.

**Steps:**
1. Change Description to a 500-character string.
2. Click Save.

**Expected result:** Description is saved in full.

**Priority:** Medium

```gherkin
Scenario: Edit description to max length accepted
  Given I am editing a program
  When I change the Description to a 500-character string
  And I click Save
  Then the modal closes
  And the updated description is stored
```

---

### TC-012 — Whitespace-only Program Name is treated as empty on edit

**Preconditions:** Admin user is editing an existing program.

**Steps:**
1. Change Program Name to "   " (spaces only).
2. Observe Save button or attempt submission.

**Expected result:** Name is trimmed and treated as empty; Save is disabled or validation error shown.

**Priority:** High

```gherkin
Scenario: Whitespace-only name rejected on edit
  Given I am editing a program
  When I change the Name to "   "
  Then the Save button is disabled
```

---

### TC-013 — Special characters in edited name are preserved

**Preconditions:** Admin user is editing an existing program.

**Steps:**
1. Change Program Name to "Informatique & IA - Niveau 2".
2. Click Save.

**Expected result:** Program is saved with special characters intact.

**Priority:** Medium

```gherkin
Scenario: Special characters preserved on edit
  Given I am editing a program
  When I change the Name to "Informatique & IA - Niveau 2"
  And I click Save
  Then the program list shows "Informatique & IA - Niveau 2"
```

---

## Ambiguities and gaps in the ACs

- ACs do not specify max length limits for Program Name (100) or Description (500).
- ACs do not cover duplicate name validation when renaming a program.
- ACs do not define Cancel / close-without-save behavior.
- ACs do not address double-click Save or loading/disabled state during save.
- ACs do not specify whether leading/trailing spaces in Program Name are trimmed on save.
- ACs do not define whether editing the name to the same value (no change) should succeed silently.
- ACs do not specify which fields appear in the edit form beyond Name and Description.
