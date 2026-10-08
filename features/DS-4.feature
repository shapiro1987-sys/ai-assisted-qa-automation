@DS-4 @program-setup
Feature: DS-4 Delete program with confirmation
  As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

  # Happy paths — Jira acceptance criteria

  Scenario: AC-001 Delete program with confirmation
    Given a program "Test Program" exists
    When I click the delete control for "Test Program"
    Then I see a confirmation dialog
    When I confirm deletion
    Then "Test Program" is removed from the program list

  Scenario: AC-002 Cancel program deletion
    Given a program exists on the Programs page
    When I click the delete control for that program
    And I dismiss the confirmation without confirming
    Then the program still exists in the list

  # Happy paths — extended

  Scenario: TC-003 Confirmation dialog displays the program name
    Given a program "Test Program" exists
    When I click the delete control for "Test Program"
    Then the confirmation message references "Test Program"

  Scenario: TC-008 Delete program with special characters in name
    Given a program "Informatique & IA - Niveau 2" exists
    When I delete that program and confirm
    Then it is removed from the program list

  Scenario: TC-009 Delete one program does not affect others
    Given programs "Web Development 2026" and "Data Science 2026" exist
    When I delete "Web Development 2026" and confirm
    Then "Data Science 2026" remains in the list

  # Negative

  Scenario: TC-004 Program is not deleted without confirmation
    Given a program "Test Program" exists
    When I open the delete confirmation
    And I dismiss it without confirming
    Then "Test Program" remains in the list

  # Edge cases

  Scenario: TC-005 Double-clicking confirm does not cause errors
    Given a program "Test Program" exists
    When I confirm deletion twice rapidly
    Then the program is removed once
    And no error state is shown

  Scenario: TC-007 Delete last remaining program shows empty state
    Given only one program exists
    When I delete that program and confirm
    Then I see the empty programs state

  Scenario: TC-010 Keyboard accessibility for confirmation dialog
    Given a program exists
    When I trigger delete from the keyboard
    Then I can confirm or dismiss the dialog using the keyboard

  Scenario: TC-006 Delete blocked for programs with dependencies
    Given a program has semesters or courses attached
    When I attempt to delete that program
    Then deletion is blocked or a clear warning is shown

# Ambiguities / gaps
# - Live app uses native window.confirm, not an in-app modal with a Cancel button; map "dismiss" to Cancel on the browser prompt.
# - Jira wording "delete icon" vs accessible name "Delete {program name}".
# - TC-006 and TC-007 depend on test data setup (dependencies, sole program).
# - Automation: tests/ds4-delete-program.spec.ts
