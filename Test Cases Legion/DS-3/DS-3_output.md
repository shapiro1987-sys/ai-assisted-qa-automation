# Test Plan: Program name validation and duplicate prevention (DS-3)

## Positive flows

### TC-001 — Program name with special characters is accepted

**Preconditions:** Admin user is on the program creation form.

**Steps:**
1. Enter "Informatique & IA - Niveau 2" in Program Name.
2. Fill in a valid Description.
3. Click Create.

**Expected result:** Program is created successfully with the name preserved exactly.

**Priority:** High

```gherkin
Scenario: Accept program name with special characters
  Given I am on the program creation form
  When I enter "Informatique & IA - Niveau 2" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully
```

---

### TC-002 — Program name with hyphens and numbers is accepted

**Preconditions:** Admin user is on the program creation form.

**Steps:**
1. Enter "Web-Dev 2026 v2" in Program Name.
2. Fill in a valid Description.
3. Click Create.

**Expected result:** Program is created; name appears in the list as entered.

**Priority:** Medium

```gherkin
Scenario: Name with hyphens and numbers accepted
  Given I am on the program creation form
  When I enter "Web-Dev 2026 v2" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully
```

---

### TC-003 — Duplicate check is case-sensitive (if applicable)

**Preconditions:** Program "Web Development 2026" exists; admin user is on the creation form.

**Steps:**
1. Enter "web development 2026" in Program Name.
2. Fill in a valid Description.
3. Click Create.

**Expected result:** Behavior matches product rule — either created as distinct name or rejected as duplicate. Document actual behavior.

**Priority:** Medium

```gherkin
Scenario: Case variation duplicate handling
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I enter "web development 2026" as the program name
  And I click Create
  Then the system applies consistent duplicate-name rules
```

---

## Negative flows

### TC-004 — Whitespace-only program name is not submitted

**Preconditions:** Admin user is on the program creation form.

**Steps:**
1. Enter "   " in Program Name.
2. Click Create.

**Expected result:** Form is not submitted; name is trimmed and treated as empty; Create is disabled or validation error shown.

**Priority:** High

```gherkin
Scenario: Reject program name with only whitespace
  Given I am on the program creation form
  When I enter "   " as the program name
  And I click Create
  Then the form is not submitted
  And the name is trimmed and treated as empty
```

---

### TC-005 — Duplicate program name is rejected on create

**Preconditions:** Program "Web Development 2026" already exists; admin user is on the creation form.

**Steps:**
1. Enter "Web Development 2026" in Program Name.
2. Fill in a valid Description.
3. Click Create.

**Expected result:** Error message indicates the name already exists; no duplicate program is created.

**Priority:** High

```gherkin
Scenario: Reject duplicate program name
  Given a program "Web Development 2026" already exists
  When I try to create a new program with the same name
  Then I see an error indicating the name already exists
```

---

### TC-006 — Empty program name is rejected

**Preconditions:** Admin user is on the program creation form.

**Steps:**
1. Leave Program Name empty.
2. Attempt to click Create.

**Expected result:** Create button is disabled; form is not submitted.

**Priority:** High

```gherkin
Scenario: Empty program name rejected
  Given I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

---

### TC-007 — Duplicate name rejected on edit of a different program

**Preconditions:** Programs "Web Development 2026" and "Data Science 2026" exist; admin user is editing "Data Science 2026".

**Steps:**
1. Change Program Name to "Web Development 2026".
2. Click Save.

**Expected result:** Error indicates name already exists; original name preserved.

**Priority:** High

```gherkin
Scenario: Duplicate name rejected on edit
  Given programs "Web Development 2026" and "Data Science 2026" exist
  And I am editing "Data Science 2026"
  When I change the Name to "Web Development 2026"
  And I click Save
  Then I see an error indicating the name already exists
```

---

## Edge cases

### TC-008 — Program name at exactly 100 characters is accepted

**Preconditions:** Admin user is on the program creation form.

**Steps:**
1. Enter a 100-character Program Name.
2. Fill in a valid Description.
3. Click Create.

**Expected result:** Program is created successfully.

**Priority:** Medium

```gherkin
Scenario: Name at max length accepted
  Given I am on the program creation form
  When I enter a 100-character string as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully
```

---

### TC-009 — Program name exceeding 100 characters is rejected

**Preconditions:** Admin user is on the program creation form.

**Steps:**
1. Enter a 101-character Program Name.
2. Attempt to click Create.

**Expected result:** Validation error shown; program is not created.

**Priority:** Medium

```gherkin
Scenario: Name over 100 characters rejected
  Given I am on the program creation form
  When I enter a 101-character string as the program name
  And I click Create
  Then I see a validation error for Program Name
  And the program is not created
```

---

### TC-010 — Leading and trailing spaces are trimmed before validation

**Preconditions:** Admin user is on the program creation form.

**Steps:**
1. Enter "  Web Development 2026  " in Program Name.
2. Fill in a valid Description.
3. Click Create.

**Expected result:** Program is saved as "Web Development 2026" (trimmed); no leading/trailing spaces preserved.

**Priority:** High

```gherkin
Scenario: Program name trimmed on create
  Given I am on the program creation form
  When I enter "  Web Development 2026  " as the program name
  And I click Create
  Then the program list shows "Web Development 2026"
```

---

### TC-011 — Duplicate detected after trimming whitespace

**Preconditions:** Program "Web Development 2026" exists; admin user is on the creation form.

**Steps:**
1. Enter "  Web Development 2026  " in Program Name.
2. Click Create.

**Expected result:** Duplicate error is shown after trim; program is not created.

**Priority:** High

```gherkin
Scenario: Duplicate detected after trim
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I enter "  Web Development 2026  " as the program name
  And I click Create
  Then I see an error indicating the name already exists
```

---

### TC-012 — Unicode characters in program name are accepted

**Preconditions:** Admin user is on the program creation form.

**Steps:**
1. Enter "Programme Français — Été 2026" in Program Name.
2. Fill in a valid Description.
3. Click Create.

**Expected result:** Program is created with Unicode characters preserved.

**Priority:** Low

```gherkin
Scenario: Unicode characters in name accepted
  Given I am on the program creation form
  When I enter "Programme Français — Été 2026" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully
```

---

### TC-013 — Renaming a program to its own current name succeeds

**Preconditions:** Program "Web Development 2026" exists; admin user is editing it.

**Steps:**
1. Leave Program Name as "Web Development 2026" (or re-enter the same value).
2. Change Description only.
3. Click Save.

**Expected result:** Save succeeds without duplicate-name error.

**Priority:** Medium

```gherkin
Scenario: Save with unchanged name succeeds
  Given I am editing "Web Development 2026"
  When I change only the Description
  And I click Save
  Then the modal closes
  And no duplicate name error is shown
```

---

## Ambiguities and gaps in the ACs

- ACs do not specify the max length for Program Name (100 characters inferred from related tickets).
- ACs do not define whether duplicate checking is case-sensitive or case-insensitive.
- ACs do not specify the exact error message text for duplicate or whitespace validation.
- ACs do not cover duplicate prevention on edit (only on create).
- ACs do not address whether trimmed names can collide with existing names that differ only by whitespace.
- ACs do not define allowed special characters beyond one example ("Informatique & IA - Niveau 2").
- ACs do not specify behavior for names containing only special characters (e.g., "---").
