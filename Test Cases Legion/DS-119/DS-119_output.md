# Test Plan: Dashboard displaying the right components (DS-119)

**Jira:** [DS-119](https://legionqaschool.atlassian.net/browse/DS-119) — Story, In Progress, Medium  
**User story:** As an admin user, I want to see the correct dashboard.  
**Reference:** Confluence — Program Setup & Management > Overview  
**Gherkin:** `features/DS-119.feature`  
**Automation:** _(not yet — suggest `tests/ds119-dashboard.spec.ts`)_

## Jira acceptance criteria (required coverage)

### AC-001 — Navigate to the Dashboard

**Maps to:** `AC-001 Navigate to the Dashboard` in Gherkin

**Preconditions:** Logged in as admin.

**Expected:** Dashboard shows module cards: **Programs**, **Calendar**, **Validation**, **AI Assist**.

```gherkin
Scenario: Navigate to the Dashboard
  Given I am logged in as admin
  When I navigate to the Dashboard page
  Then I see the Dashboard with the right blocks: Programs, Calendar, Validation, AI Assist
```

**Live app notes:** Route `/`; heading **Dashboard**; subtitle welcome copy; **Connected** badge when API is up.

---

### AC-002 — Navigate to Programs from Dashboard

**Maps to:** `AC-002 Successfully navigate to Program Page`

```gherkin
Scenario: Successfully navigate to Program Page
  Given I am on the Dashboard
  When I click on Programs card
  Then I navigate to the Programs page
```

**Expected URL/path:** `/programs` — Programs heading and **+ New Program**.

---

### AC-003 — Navigate to Calendar from Dashboard

**Maps to:** `AC-003 Successfully navigate to Calendar Page`

```gherkin
Scenario: Successfully navigate to Calendar Page
  Given I am on the Dashboard
  When I click on Calendar card
  Then I navigate to the Calendar page
```

**Expected:** `/calendar` — heading **Calendar**.

---

### AC-004 — Navigate to Validation from Dashboard

**Maps to:** `AC-004 Successfully navigate to Validation Page`

```gherkin
Scenario: Successfully navigate to Validation Page
  Given I am on the Dashboard
  When I click on Validation card
  Then I navigate to the Validation page
```

**Expected:** `/validation` — heading **Validation**.

---

### AC-005 — Navigate to AI Assist from Dashboard

**Maps to:** `AC-005 Successfully navigate to AI Assist Page`

```gherkin
Scenario: Successfully navigate to AI Assist Page
  Given I am on the Dashboard
  When I click on AI Assist card
  Then I navigate to the AI Assist page
```

**Expected:** `/cli` — heading **AI Assist** (card label may differ slightly from route).

---

## Extended automation (not in Jira AC)

| ID | Title | Priority |
|----|--------|----------|
| TC-001 | Dashboard shows primary heading and welcome copy | Medium |
| TC-002 | Connected status visible when backend reachable | Low |
| TC-003 | Quick Start section lists onboarding steps | Low |
| TC-004 | Sidebar Dashboard link returns to home | Medium |
| TC-005 | Unauthenticated user redirected to login | High |
| TC-006 | Dashboard cards keyboard accessible | Medium |
| TC-007 | Browser back from module returns to Dashboard | Low |
| TC-008 | Programs card reflects existing program data | Low |

Full Gherkin for extended cases: `features/DS-119.feature`.

---

## Gaps and ambiguities

- Jira description typo **Dashboardx** — use **Dashboard** in tests and docs.
- **Quick Start** and **Connected** are on live UI but not in Jira AC; include as extended coverage only unless AC is updated.
- Related clone/open work: **DS-177** (per Confluence feature map).
- Shell navigation (**AppShell**) overlaps DS-119; dashboard card clicks are the AC focus.
