# Test Plan: TodoMVC (https://demo.playwright.dev/todomvc/)

## Positive flows

### TC-001 — New todo item appears in the list after submission

**Preconditions:** TodoMVC app is open; the todo list is empty.

**Steps:**
1. Click the "What needs to be done?" input field.
2. Type `Buy milk`.
3. Press Enter.

**Expected result:** `Buy milk` appears in the todo list; the footer shows `1 item left`.

---

### TC-002 — Todo item is marked completed after toggling its checkbox

**Preconditions:** TodoMVC app is open; todo item `Walk the dog` exists in the list.

**Steps:**
1. Click the toggle checkbox next to `Walk the dog`.

**Expected result:** `Walk the dog` is shown as completed (strikethrough styling); the footer shows `0 items left`.

---

### TC-003 — Todo item is removed from the list after deletion

**Preconditions:** TodoMVC app is open; todo item `Read a book` exists in the list.

**Steps:**
1. Hover over `Read a book`.
2. Click the destroy (×) button.

**Expected result:** `Read a book` is removed from the list; the todo list is empty.

---

### TC-004 — Multiple todo items can be added sequentially

**Preconditions:** TodoMVC app is open; the todo list is empty.

**Steps:**
1. Add `Buy milk` and press Enter.
2. Add `Walk the dog` and press Enter.
3. Add `Read a book` and press Enter.

**Expected result:** All three items appear in the list in the order entered; the footer shows `3 items left`.

---

## Negative flows

### TC-005 — Empty input does not create a todo item

**Preconditions:** TodoMVC app is open; the todo list is empty.

**Steps:**
1. Click the "What needs to be done?" input field.
2. Press Enter without typing any text.

**Expected result:** No new item is added; the todo list remains empty.

---

### TC-006 — Whitespace-only input does not create a todo item

**Preconditions:** TodoMVC app is open; the todo list is empty.

**Steps:**
1. Click the "What needs to be done?" input field.
2. Type three spaces (`   `).
3. Press Enter.

**Expected result:** No new item is added; the todo list remains empty.

---

### TC-007 — Delete control is not actionable without hovering the item

**Preconditions:** TodoMVC app is open; todo item `Buy milk` exists in the list.

**Steps:**
1. Without hovering over `Buy milk`, attempt to click the destroy (×) button.

**Expected result:** The delete button is not visible or clickable; `Buy milk` remains in the list.

---

## Edge cases

### TC-008 — Duplicate todo text can be added as separate items

**Preconditions:** TodoMVC app is open; todo item `Buy milk` already exists in the list.

**Steps:**
1. Add `Buy milk` again and press Enter.

**Expected result:** A second `Buy milk` entry appears in the list; the footer shows `2 items left`.

---

### TC-009 — Todo text with special characters is preserved

**Preconditions:** TodoMVC app is open; the todo list is empty.

**Steps:**
1. Add `Buy milk & eggs @ 5pm!` and press Enter.

**Expected result:** The item is displayed exactly as `Buy milk & eggs @ 5pm!` in the list.

---

### TC-010 — Long todo text is accepted and displayed

**Preconditions:** TodoMVC app is open; the todo list is empty.

**Steps:**
1. Add a 200-character todo (e.g., `Plan quarterly roadmap review with design, engineering, and product teams to align on priorities, milestones, deliverables, and success metrics for the upcoming release cycle and beyond`).
2. Press Enter.

**Expected result:** The full text is stored and visible in the list; the item counts as one todo.

---

### TC-011 — Completing one item leaves other items active

**Preconditions:** TodoMVC app is open; `Buy milk` and `Walk the dog` exist in the list.

**Steps:**
1. Click the toggle checkbox next to `Buy milk` only.

**Expected result:** `Buy milk` is completed; `Walk the dog` remains active; the footer shows `1 item left`.

---

### TC-012 — Deleting one item preserves remaining items

**Preconditions:** TodoMVC app is open; `Buy milk`, `Walk the dog`, and `Read a book` exist in the list.

**Steps:**
1. Hover over `Walk the dog`.
2. Click the destroy (×) button.

**Expected result:** `Walk the dog` is removed; `Buy milk` and `Read a book` remain; the footer shows `2 items left`.

---

### TC-013 — Completed item can be toggled back to active

**Preconditions:** TodoMVC app is open; completed todo item `Walk the dog` exists in the list.

**Steps:**
1. Click the toggle checkbox next to `Walk the dog` again.

**Expected result:** `Walk the dog` returns to active state (no strikethrough); the footer shows `1 item left`.

---

## Ambiguities and gaps in the ACs

- ACs do not specify whether whitespace-only input should be rejected or trimmed before save.
- ACs do not define a maximum length for todo text.
- ACs do not state whether duplicate todo labels are allowed or should be prevented.
- ACs do not cover toggling a completed item back to active.
- ACs do not cover adding, completing, or deleting multiple items in one session.
- ACs do not mention filters (All / Active / Completed), editing an existing todo, or clearing completed items.
- ACs do not define expected counter text for singular vs. plural (e.g., `1 item left` vs. `2 items left`).
