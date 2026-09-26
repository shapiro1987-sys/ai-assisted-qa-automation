# Test Plan: Delete program with confirmation (DS-4)

## Positive flows

### TC-001 — Confirmed deletion removes program from the list

**Preconditions:** Program "Test Program" exists on the Programs page; admin user is logged in.

**Steps:**
1. Navigate to the Programs page.
2. Click the delete icon for "Test Program".
3. Confirm deletion in the dialog.

**Expected result:** Confirmation dialog appears; after confirming, "Test Program" is removed from the program list.

**Priority:** High

```gherkin
Scenario: Delete program with confirmation
  Given a program "Test Program" exists
  When I click the delete icon for "Test Program"
  Then I see a confirmation dialog
  When I confirm deletion
  Then "Test Program" is removed from the program list
```

---

### TC-002 — Cancelled deletion keeps program in the list

**Preconditions:** At least one program exists on the Programs page; admin user is logged in.

**Steps:**
1. Click the delete icon for a program.
2. Click Cancel in the confirmation dialog.

**Expected result:** Dialog closes; program remains in the list unchanged.

**Priority:** High

```gherkin
Scenario: Cancel program deletion
  Given I click the delete icon for a program
  When I see the confirmation dialog
  And I click Cancel
  Then the program still exists in the list
```

---

### TC-003 — Confirmation dialog displays the program name

**Preconditions:** Program "Web Development 2026" exists on the Programs page.

**Steps:**
1. Click the delete icon for "Web Development 2026".

**Expected result:** Confirmation dialog shows the program name (e.g., "Are you sure you want to delete Web Development 2026?").

**Priority:** Medium

```gherkin
Scenario: Confirmation dialog shows program name
  Given a program "Web Development 2026" exists
  When I click the delete icon for "Web Development 2026"
  Then the confirmation dialog references "Web Development 2026"
```

---

## Negative flows

### TC-004 — Program is not deleted without confirmation

**Preconditions:** Program "Test Program" exists; admin user clicked delete but has not confirmed.

**Steps:**
1. Click the delete icon for "Test Program".
2. Close the dialog via X or clicking outside (if supported).
3. Check the program list.

**Expected result:** "Test Program" still exists in the list.

**Priority:** High

```gherkin
Scenario: Dismiss dialog without confirming
  Given a program "Test Program" exists
  When I click the delete icon for "Test Program"
  And I dismiss the confirmation dialog without confirming
  Then "Test Program" still exists in the list
```

---

### TC-005 — Double-clicking confirm does not cause errors

**Preconditions:** Program "Data Science 2026" exists; delete confirmation dialog is open.

**Steps:**
1. Double-click the Confirm / Delete button rapidly.

**Expected result:** Program is deleted once; no error state; list shows program removed exactly once.

**Priority:** Medium

```gherkin
Scenario: Double-click confirm deletes only once
  Given I see the confirmation dialog for "Data Science 2026"
  When I double-click Confirm
  Then "Data Science 2026" is removed from the list
  And no error is displayed
```

---

### TC-006 — Delete action unavailable or blocked for programs with dependencies (if applicable)

**Preconditions:** A program linked to curriculum content exists (if the system supports dependencies).

**Steps:**
1. Attempt to delete the linked program.
2. Observe system response.

**Expected result:** Either deletion is blocked with a clear message, or cascade behavior is documented and tested.

**Priority:** Medium

```gherkin
Scenario: Delete blocked for program with dependencies
  Given a program with linked curriculum content exists
  When I click the delete icon for that program
  And I confirm deletion
  Then I see a message explaining why deletion is not allowed
  And the program remains in the list
```

---

## Edge cases

### TC-007 — Delete last remaining program shows empty state

**Preconditions:** Only one program "Test Program" exists.

**Steps:**
1. Delete "Test Program" and confirm.

**Expected result:** Program list is empty; empty-state message and create prompt are displayed.

**Priority:** Medium

```gherkin
Scenario: Delete last program shows empty state
  Given only "Test Program" exists
  When I delete "Test Program" and confirm
  Then the program list is empty
  And I see a message indicating no programs have been created
```

---

### TC-008 — Delete program with special characters in name

**Preconditions:** Program "Informatique & IA - Niveau 2" exists.

**Steps:**
1. Click delete icon for "Informatique & IA - Niveau 2".
2. Confirm deletion.

**Expected result:** Program is removed; confirmation dialog correctly displays the special-character name.

**Priority:** Medium

```gherkin
Scenario: Delete program with special characters in name
  Given a program "Informatique & IA - Niveau 2" exists
  When I click the delete icon for "Informatique & IA - Niveau 2"
  And I confirm deletion
  Then "Informatique & IA - Niveau 2" is removed from the program list
```

---

### TC-009 — Delete one program does not affect others

**Preconditions:** Programs "Web Development 2026" and "Data Science 2026" exist.

**Steps:**
1. Delete "Web Development 2026" and confirm.
2. Check the program list.

**Expected result:** "Data Science 2026" remains; only the deleted program is removed.

**Priority:** High

```gherkin
Scenario: Delete one program preserves others
  Given programs "Web Development 2026" and "Data Science 2026" exist
  When I delete "Web Development 2026" and confirm
  Then "Data Science 2026" remains in the program list
  And "Web Development 2026" is not in the list
```

---

### TC-010 — Keyboard accessibility for confirmation dialog

**Preconditions:** Delete confirmation dialog is open.

**Steps:**
1. Press Escape to dismiss (if supported).
2. Re-open delete dialog.
3. Press Enter on Confirm (if supported).

**Expected result:** Escape cancels deletion; Enter confirms (if keyboard support is expected).

**Priority:** Low

```gherkin
Scenario: Keyboard interaction with delete dialog
  Given I see the confirmation dialog for a program
  When I press Escape
  Then the dialog closes
  And the program still exists in the list
```

---

## Ambiguities and gaps in the ACs

- ACs do not specify the exact confirmation dialog text or button labels (Delete / Confirm / Cancel).
- ACs do not define whether closing the dialog via X or clicking outside counts as Cancel.
- ACs do not address programs with linked curriculum or other dependencies.
- ACs do not cover double-click on Confirm or loading state during deletion.
- ACs do not specify whether deletion is soft (recoverable) or hard (permanent).
- ACs do not define expected behavior when deleting the last program (empty state transition).
- ACs do not mention undo or success notification after deletion.
