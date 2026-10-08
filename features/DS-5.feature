@DS-5 @program-setup
Feature: DS-5 Program list filtering and display
  As an admin user, I want to see all programs in a clear list so that I can quickly find and manage them.

  # Happy paths — Jira acceptance criteria

  Scenario: AC-001 Display program list with key details
    Given programs exist in the system
    When I navigate to the Programs page
    Then I see a list showing each program's name and description

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

  # Edge cases

  Scenario: TC-008 Long program name displays without breaking layout
    Given a program with a 100-character name exists
    When I view the Programs page
    Then the table layout remains usable

  Scenario: TC-009 Long description displays without breaking layout
    Given a program with a 500-character description exists
    When I view the Programs page
    Then the table layout remains usable

  Scenario: TC-011 List with many programs remains usable
    Given thousands of programs exist
    When I navigate to the Programs page
    Then the page loads and the list is scrollable

  Scenario: TC-012 Empty-state create prompt opens creation form
    Given no programs exist
    When I use the empty-state action to create the first program
    Then the New Program form opens

# Ambiguities / gaps
# - Story title mentions "filtering" but Jira AC only covers display and empty state; no search/filter/sort on test.didaxis.studio today.
# - AC-002 empty state is hard to test on shared test env with thousands of programs; needs isolated account or data reset.
# - Automation: tests/ds5-program-list.spec.ts
