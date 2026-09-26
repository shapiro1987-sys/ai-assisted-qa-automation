# Test Plan: Create new academic program (DS-1)

## Positive flows

### TC-001 — Program creation form displays required fields

**Preconditions:** Admin user is logged in.

**Steps:**
1. Navigate to the Programs page.
2. Click "+ New Program".

**Expected result:** Program creation form opens with Program Name and Description fields visible.

**Priority:** High

```gherkin
Scenario: Navigate to program creation form
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description
```

---

### TC-002 — New program appears in list after successful creation

**Preconditions:** Admin user is logged in; program creation form is open.

**Steps:**
1. Enter "Web Development 2026" in Program Name.
2. Enter "Full-stack web development program" in Description.
3. Click Create.

**Expected result:** Modal closes; program list shows "Web Development 2026" with the entered description.

**Priority:** High

```gherkin
Scenario: Successfully create a program
  Given I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
```

---

### TC-003 — Program can be created with name only and empty description

**Preconditions:** Admin user is logged in; program creation form is open.

**Steps:**
1. Enter "Data Science 2026" in Program Name.
2. Leave Description empty.
3. Click Create.

**Expected result:** Program is created; modal closes; "Data Science 2026" appears in the list.

**Priority:** Medium

```gherkin
Scenario: Create program with empty description
  Given I am on the program creation form
  When I fill in Program Name with "Data Science 2026"
  And I leave Description empty
  And I click Create
  Then the modal closes
  And the program list shows "Data Science 2026"
```

---

## Negative flows

### TC-004 — Create button remains disabled when Program Name is empty

**Preconditions:** Admin user is logged in; program creation form is open.

**Steps:**
1. Leave Program Name empty.
2. Optionally enter text in Description.
3. Observe the Create button state.

**Expected result:** Create button is disabled; form is not submittable.

**Priority:** High

```gherkin
Scenario: Validation prevents empty program name
  Given I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

---

### TC-005 — Duplicate program name is rejected on create

**Preconditions:** Program "Web Development 2026" already exists; admin user is on the creation form.

**Steps:**
1. Enter "Web Development 2026" in Program Name.
2. Enter any description.
3. Click Create.

**Expected result:** Form is not submitted; error message indicates the name already exists.

**Priority:** High

```gherkin
Scenario: Duplicate program name rejected
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I click Create
  Then I see an error indicating the name already exists
  And the program is not created
```

---

### TC-006 — Double-clicking Create does not create duplicate programs

**Preconditions:** Admin user is on the creation form with valid data entered.

**Steps:**
1. Fill in Program Name with "Mobile Development 2026".
2. Fill in Description with "iOS and Android development".
3. Double-click the Create button rapidly.

**Expected result:** Only one program is created; only one entry appears in the list.

**Priority:** High

```gherkin
Scenario: Double-click Create submits only once
  Given I am on the program creation form
  When I fill in Program Name with "Mobile Development 2026"
  And I fill in Description with "iOS and Android development"
  And I double-click Create
  Then only one program "Mobile Development 2026" exists in the list
```

---

## Edge cases

### TC-007 — Program name at maximum length (100 characters) is accepted

**Preconditions:** Admin user is on the creation form.

**Steps:**
1. Enter a 100-character Program Name (e.g., "A" repeated 100 times).
2. Enter a valid Description.
3. Click Create.

**Expected result:** Program is created successfully.

**Priority:** Medium

```gherkin
Scenario: Program name at max length accepted
  Given I am on the program creation form
  When I fill in Program Name with a 100-character string
  And I fill in Description with "Valid description"
  And I click Create
  Then the modal closes
  And the program appears in the list
```

---

### TC-008 — Program name exceeding 100 characters is rejected

**Preconditions:** Admin user is on the creation form.

**Steps:**
1. Enter a 101-character Program Name.
2. Enter a valid Description.
3. Attempt to click Create.

**Expected result:** Validation error is shown or Create is disabled; program is not created.

**Priority:** Medium

```gherkin
Scenario: Program name over 100 characters rejected
  Given I am on the program creation form
  When I fill in Program Name with a 101-character string
  And I click Create
  Then I see a validation error for Program Name
  And the program is not created
```

---

### TC-009 — Description at maximum length (500 characters) is accepted

**Preconditions:** Admin user is on the creation form.

**Steps:**
1. Enter "Cloud Computing 2026" in Program Name.
2. Enter a 500-character Description.
3. Click Create.

**Expected result:** Program is created with the full description stored.

**Priority:** Medium

```gherkin
Scenario: Description at max length accepted
  Given I am on the program creation form
  When I fill in Program Name with "Cloud Computing 2026"
  And I fill in Description with a 500-character string
  And I click Create
  Then the modal closes
  And the program is created successfully
```

---

### TC-010 — Description exceeding 500 characters is rejected

**Preconditions:** Admin user is on the creation form.

**Steps:**
1. Enter "DevOps 2026" in Program Name.
2. Enter a 501-character Description.
3. Attempt to click Create.

**Expected result:** Validation error is shown; program is not created.

**Priority:** Medium

```gherkin
Scenario: Description over 500 characters rejected
  Given I am on the program creation form
  When I fill in Program Name with "DevOps 2026"
  And I fill in Description with a 501-character string
  And I click Create
  Then I see a validation error for Description
  And the program is not created
```

---

### TC-011 — Program name with special characters is accepted

**Preconditions:** Admin user is on the creation form.

**Steps:**
1. Enter "Informatique & IA - Niveau 2" in Program Name.
2. Enter a valid Description.
3. Click Create.

**Expected result:** Program is created with the special characters preserved.

**Priority:** Medium

```gherkin
Scenario: Special characters in program name accepted
  Given I am on the program creation form
  When I fill in Program Name with "Informatique & IA - Niveau 2"
  And I fill in Description with "Advanced AI program"
  And I click Create
  Then the modal closes
  And the program list shows "Informatique & IA - Niveau 2"
```

---

### TC-012 — Whitespace-only Program Name is treated as empty

**Preconditions:** Admin user is on the creation form.

**Steps:**
1. Enter "   " (spaces only) in Program Name.
2. Observe Create button state or attempt submission.

**Expected result:** Name is trimmed and treated as empty; Create is disabled or validation error is shown.

**Priority:** High

```gherkin
Scenario: Whitespace-only program name rejected
  Given I am on the program creation form
  When I enter "   " as the Program Name
  Then the Create button is disabled
```

---

## Ambiguities and gaps in the ACs

- ACs do not specify max length for Program Name (100 characters) or Description (500 characters); inferred from related bug tickets.
- ACs do not define whether Description is required or optional.
- ACs do not cover duplicate name prevention, double-click submission, or special characters in the name.
- ACs do not specify whether leading/trailing spaces in Program Name should be trimmed before save.
- ACs do not define expected behavior when the user closes the modal without saving (Cancel / X button).
- ACs do not specify sort order of the program list after creation.
