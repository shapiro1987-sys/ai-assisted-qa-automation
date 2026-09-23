# Test Plan: Program list filtering and display (DS-5)

## Positive flows

### TC-001 — Program list displays name and description for each program

**Preconditions:** Multiple programs exist (e.g., "Web Development 2026", "Data Science 2026"); admin user is logged in.

**Steps:**
1. Navigate to the Programs page.

**Expected result:** List shows each program's name and description.

**Priority:** High

```gherkin
Scenario: Display program list with key details
  Given programs exist in the system
  When I navigate to the Programs page
  Then I see a list showing each program's name and description
```

---

### TC-002 — Empty state shown when no programs exist

**Preconditions:** No programs exist in the system; admin user is logged in.

**Steps:**
1. Navigate to the Programs page.

**Expected result:** Message indicates no programs have been created; prompt to create the first program is visible.

**Priority:** High

```gherkin
Scenario: Empty state when no programs exist
  Given no programs exist
  When I navigate to the Programs page
  Then I see a message indicating no programs have been created
  And I see a prompt to create the first program
```

---

### TC-003 — Newly created program appears in the list immediately

**Preconditions:** Admin user creates a new program from the Programs page.

**Steps:**
1. Create program "Mobile Development 2026" with Description "Cross-platform mobile apps".
2. Observe the program list.

**Expected result:** "Mobile Development 2026" appears in the list without page refresh.

**Priority:** High

```gherkin
Scenario: New program appears in list after creation
  Given I am on the Programs page
  When I create a program "Mobile Development 2026" with Description "Cross-platform mobile apps"
  Then the program list shows "Mobile Development 2026"
```

---

### TC-004 — Program with empty description displays correctly in list

**Preconditions:** Program "DevOps 2026" exists with an empty Description.

**Steps:**
1. Navigate to the Programs page.
2. Locate "DevOps 2026" in the list.

**Expected result:** Name is shown; empty description is handled gracefully (blank, dash, or "No description").

**Priority:** Medium

```gherkin
Scenario: Program with empty description displayed
  Given a program "DevOps 2026" exists with an empty description
  When I navigate to the Programs page
  Then I see "DevOps 2026" in the list
  And the description area is handled appropriately
```

---

## Negative flows

### TC-005 — Program list does not show stale data after deletion

**Preconditions:** Program "Test Program" exists; admin user deletes it.

**Steps:**
1. Delete "Test Program" and confirm.
2. Observe the program list.

**Expected result:** "Test Program" is no longer visible in the list.

**Priority:** High

```gherkin
Scenario: Deleted program removed from list immediately
  Given a program "Test Program" exists
  When I delete "Test Program" and confirm
  Then "Test Program" is not shown in the program list
```

---

### TC-006 — Program list reflects edited name without refresh

**Preconditions:** Program "Web Development 2026" exists; admin user edits the name.

**Steps:**
1. Edit name to "Web Development 2026 - Updated" and save.
2. Observe the program list.

**Expected result:** List shows updated name; old name is not displayed.

**Priority:** High

```gherkin
Scenario: Edited program name reflected in list
  Given a program "Web Development 2026" exists
  When I edit the name to "Web Development 2026 - Updated" and save
  Then the program list shows "Web Development 2026 - Updated"
  And "Web Development 2026" is not shown
```

---

### TC-007 — Non-admin user cannot access Programs page (if role-restricted)

**Preconditions:** A non-admin user account exists (if applicable).

**Steps:**
1. Log in as non-admin.
2. Attempt to navigate to the Programs page.

**Expected result:** Access is denied or page is not visible in navigation.

**Priority:** Medium

```gherkin
Scenario: Non-admin cannot access program list
  Given I am logged in as a non-admin user
  When I attempt to navigate to the Programs page
  Then I do not see the program list
```

---

## Edge cases

### TC-008 — Long program name displays without breaking layout

**Preconditions:** Program with a 100-character name exists.

**Steps:**
1. Navigate to the Programs page.
2. Observe how the long name is rendered.

**Expected result:** Name is truncated with ellipsis or wraps without breaking the layout.

**Priority:** Medium

```gherkin
Scenario: Long program name displayed correctly
  Given a program with a 100-character name exists
  When I navigate to the Programs page
  Then the program name is displayed without breaking the layout
```

---

### TC-009 — Long description displays without breaking layout

**Preconditions:** Program exists with a 500-character Description.

**Steps:**
1. Navigate to the Programs page.
2. Observe how the long description is rendered.

**Expected result:** Description is truncated or wrapped appropriately.

**Priority:** Medium

```gherkin
Scenario: Long description displayed correctly
  Given a program with a 500-character description exists
  When I navigate to the Programs page
  Then the description is displayed without breaking the layout
```

---

### TC-010 — Program name with special characters displays correctly

**Preconditions:** Program "Informatique & IA - Niveau 2" exists.

**Steps:**
1. Navigate to the Programs page.

**Expected result:** Name and description render correctly with special characters (no HTML encoding issues).

**Priority:** Medium

```gherkin
Scenario: Special characters displayed correctly
  Given a program "Informatique & IA - Niveau 2" exists
  When I navigate to the Programs page
  Then I see "Informatique & IA - Niveau 2" displayed correctly
```

---

### TC-011 — List with many programs remains usable

**Preconditions:** 20 or more programs exist in the system.

**Steps:**
1. Navigate to the Programs page.
2. Scroll through the list (if paginated or scrollable).

**Expected result:** All programs are accessible; performance remains acceptable; pagination or scrolling works if implemented.

**Priority:** Low

```gherkin
Scenario: Large program list is navigable
  Given 20 or more programs exist
  When I navigate to the Programs page
  Then I can view all programs via scrolling or pagination
```

---

### TC-012 — Empty-state create prompt opens creation form

**Preconditions:** No programs exist.

**Steps:**
1. Navigate to the Programs page.
2. Click the create prompt / "+ New Program" from the empty state.

**Expected result:** Program creation form opens.

**Priority:** Medium

```gherkin
Scenario: Empty state create prompt opens form
  Given no programs exist
  When I navigate to the Programs page
  And I click the prompt to create the first program
  Then I see the program creation form
```

---

## Ambiguities and gaps in the ACs

- ACs mention "filtering" in the feature title but do not define any filter or search behavior in the acceptance criteria.
- ACs do not specify sort order (alphabetical, creation date, etc.).
- ACs do not define how empty Description is displayed in the list.
- ACs do not specify pagination, infinite scroll, or max visible items.
- ACs do not define which columns or fields beyond name and description appear (e.g., created date, actions).
- ACs do not address list refresh behavior after create, edit, or delete operations.
- ACs do not specify expected empty-state message text or create prompt label.
- ACs do not define role-based access to the Programs page.
