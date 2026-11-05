@DS-5 @program-setup
Feature: DS-5 Program list filtering and display
  As an admin user, I want to see all programs in a clear list so that I can quickly find and manage them.

  # Happy paths — Jira acceptance criteria

  Scenario: AC-001 Display program list with key details
    Given programs exist in the system
    When I navigate to the Programs page
    Then I see the "Programs" heading
    And I see the text "Manage academic programs and semesters"
    And I see a table whose first column is "Program"
    And each row shows that program's name and description

  Scenario: AC-002 Empty state when no programs exist
    Given no programs exist
    When I navigate to the Programs page
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program

  # Happy paths — extended

  Scenario: TC-003 Newly created program appears in the list immediately
    Given I am on the Programs page
    When I create a program "Web Development 2026"
    Then the list shows "Web Development 2026" without a full page refresh

  Scenario: TC-004 Program with empty description displays correctly in list
    Given a program exists with an empty description
    When I view the Programs page
    Then the program name is visible
    And the row does not show broken layout

  Scenario: TC-006 Program list reflects edited name without refresh
    Given a program "Web Development 2026" exists
    When I rename it to "Web Development 2026 - Updated"
    Then the list shows the updated name immediately

  Scenario: TC-010 Program name with special characters displays correctly
    Given a program "Informatique & IA - Niveau 2" exists
    When I view the Programs page
    Then the name is displayed exactly as stored

  # Negative

  Scenario: TC-005 Program list does not show stale data after deletion
    Given a program "Test Program" exists
    When I delete "Test Program" and confirm
    Then "Test Program" no longer appears in the list

  Scenario: TC-007 Non-admin user cannot access Programs page
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then access is denied or Programs is not available in the shell

  Scenario: TC-013 Programs page has no search or filter control
    Given I am logged in as an admin
    When I navigate to the Programs page
    Then I see the program table
    And I do not see a search box, filter, or sort control

  # Edge cases

  Scenario: TC-008 Long program name displays without breaking layout
    Given a program with a 100-character name exists
    When I view the Programs page
    Then the "Programs" heading and "+ New Program" button stay visible

  Scenario: TC-009 Long description displays without breaking layout
    Given a program with a 500-character description exists
    When I view the Programs page
    Then the "Programs" heading and "+ New Program" button stay visible

  Scenario: TC-011 List with many programs remains usable
    Given hundreds of programs exist
    When I navigate to the Programs page
    Then the "Programs" heading, the subtitle, and "+ New Program" are visible

  Scenario: TC-012 Empty-state create prompt opens creation form
    Given no programs exist
    When I use the empty-state action to create the first program
    Then the New Program form opens

# Crawl 2026-10-29 on https://test.didaxis.studio/programs (signed-in admin)
# Observed: heading "Programs"; subtitle "Manage academic programs and semesters";
# button "+ New Program"; button "Sign out"; one table; column headers "Program" and a blank second header;
# 747 data rows; each row shows name and description together;
# row buttons named "Edit {program name}" and "Delete {program name}".
# Not observed: search box, filter, sort, combobox, or any "no programs" empty-state copy.
# Playwright MCP could not launch (Google Chrome is not installed). Crawl used project Chromium.

# Ambiguities / gaps
# - Story title says "filtering" but the acceptance criteria only cover display and empty state.
#   The live page has no search, filter, or sort. Open bug DS-221 already records that gap.
# - AC-002 empty-state copy was not on screen. The shared test env has 747 programs, so the message text must not be invented.
# - The actions column header is blank. Open bug DS-117 already records that.
# - TC-007 needs a non-admin account. None is configured in this environment.
# - Automation target: tests/ds5-program-list.spec.ts
