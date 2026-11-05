@DS-4 @program-setup
Feature: DS-4 Delete program with confirmation
  As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

  # Happy paths — Jira acceptance criteria

  Scenario: AC-001 Delete program with confirmation
    Given a program "Test Program" exists on the Programs page
    When I click the button named "Delete Test Program"
    Then I see a browser confirmation
    And the message is:
      """
      Delete program "Test Program"? All its semesters and courses will be removed. This cannot be undone.
      """
    When I accept the confirmation
    Then "Test Program" is removed from the program list

  Scenario: AC-002 Cancel program deletion
    Given a program "Test Program" exists on the Programs page
    When I click the button named "Delete Test Program"
    And I dismiss the browser confirmation
    Then the button named "Edit Test Program" is still in the list

  # Happy paths — extended

  Scenario: TC-003 Confirmation dialog displays the program name
    Given a program "Web Development 2026" exists on the Programs page
    When I click the button named "Delete Web Development 2026"
    Then the confirmation message contains "Web Development 2026"
    When I dismiss the confirmation
    Then "Web Development 2026" remains in the list

  Scenario: TC-009 Delete one program does not affect others
    Given programs "Web Development 2026" and "Data Science 2026" exist
    When I accept deletion of "Web Development 2026"
    Then "Web Development 2026" is removed from the program list
    And "Data Science 2026" remains in the list

  # Negative

  Scenario: TC-004 Program is not deleted without confirmation
    Given a program "Test Program" exists on the Programs page
    When I open the delete confirmation for "Test Program"
    And I dismiss it without accepting
    Then "Test Program" remains in the list

  # Edge cases

  Scenario: TC-010 Enter on the delete button opens the same confirmation
    Given a program "Test Program" exists on the Programs page
    When I focus the button named "Delete Test Program" and press Enter
    Then I see the same browser confirmation for "Test Program"
    When I dismiss the confirmation
    Then "Test Program" remains in the list

  Scenario: TC-005 Double-clicking delete asks once
    Given a program "Test Program" exists on the Programs page
    When I double-click the button named "Delete Test Program"
    Then one confirmation is shown
    And "Test Program" remains until that confirmation is accepted

# Crawl 2026-11-03 on https://test.didaxis.studio/programs (signed-in admin, project Chromium).
# Playwright MCP could not launch: Google Chrome is not installed.
# Observed: heading "Programs"; subtitle "Manage academic programs and semesters";
# button "+ New Program"; table column header "Program" and a blank second header.
# Delete control is a button with accessible name "Delete {program name}", no visible text,
# and an inline trash svg (tabler-icon-trash). It is not an img and not an emoji.
# Click and keyboard Enter both open a native confirm dialog, not an in-app dialog or alertdialog.
# Message: Delete program "{name}"? All its semesters and courses will be removed. This cannot be undone.
# Dismiss leaves the "Edit {name}" button. Accept sends DELETE /api/programs/{id} (HTTP 200)
# and removes that row only.
# Double-click opened two confirm dialogs. Dismissing both left the program in the list.
# Not observed: an in-app Cancel button, a search box, or an empty-state message.
# The shared list already contains many programs, so empty-state copy must not be invented.

# Ambiguities / gaps
# - Jira says "delete icon" and "click Cancel". The live control is the named button above.
#   Cancel is dismissing the native confirm. There is no in-app confirmation dialog.
#   Open bug DS-172 already records the native confirm.
# - TC-005 expects one confirmation. This crawl saw two. Open bugs DS-30, DS-109, DS-156, and DS-218 already record that.
# - The confirmation warns that semesters and courses will be removed. Deletion was not blocked.
#   A program that already has semesters or courses was not set up, so that path was not exercised.
# - TC-010 needs the delete button focused and activated with Enter. ProgramsPage.deleteProgram only clicks.
# - Automation target: tests/ds4-delete-program.spec.ts
