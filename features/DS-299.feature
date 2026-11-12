@DS-299 @DS-2 @program-setup
Feature: DS-299 Over-limit Program Name on edit keeps the original program
  As an admin, I want an over-limit Program Name to be rejected on Edit Program so that the original program stays in the list unchanged.

  # Happy paths

  Scenario: A normal rename still saves
    Given I am on the Programs page
    And a program "Web Development 2026" exists
    When I open Edit Program for "Web Development 2026"
    And I change Program Name to "Web Development 2026 - Updated"
    And I click Save
    Then the Edit Program dialog closes
    And the list shows "Web Development 2026 - Updated"
    And the list does not show "Web Development 2026"

  # Negative

  Scenario: A 256-character Program Name is not saved
    Given I am on the Programs page
    And a program "Web Development 2026" exists
    When I open Edit Program for "Web Development 2026"
    And I set Program Name to 256 "a" characters
    And I click Save
    Then the Edit Program dialog stays open
    And the list still shows "Web Development 2026"
    And the list does not show the 256-character name

  # Edge cases

  Scenario: Saving the over-limit name does not remove the original row
    Given I am editing "Web Development 2026"
    When I set Program Name to 256 "a" characters
    And I click Save
    Then exactly one "Web Development 2026" row remains
    And no row appears for the 256-character name

# Ambiguities / gaps
# - DS-299 expected result: validation that Program Name exceeds the maximum, or the save is blocked. It does not name the error text or the numeric maximum.
# - The recorded failure used 256 characters. DS-2 TC-009 treats 100 characters as accepted and TC-010 expects a 101-character name to be saved. This plan asserts the DS-299 expected result for 256 characters.
# - Live UI recon on https://test.didaxis.studio was not completed this run; the browser session did not open. Steps and labels come from DS-299 and the Edit Program dialog already used by tests/ds2-edit-program.spec.ts (Program Name, Save, dialog "Edit Program", list control "Edit <name>").
# - Source bug: DS-15. Failing spec named in the ticket: tests/ds2-edit-program.spec.ts TC-007, which in the current tree is "Cancel discards unsaved changes", not the over-limit case.
