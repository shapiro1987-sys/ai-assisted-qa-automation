@DS-2 @program-setup
Feature: DS-2 Edit existing program details
  As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

  # Happy paths — Jira acceptance criteria

  Scenario: AC-001 Open program for editing
    Given I am on the Programs page
    And a program "Web Development 2026" exists
    When I click the edit control for "Web Development 2026"
    Then I see the edit form pre-populated with the program's current data

  Scenario: AC-002 Successfully edit a program name
    Given I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Updated"

  Scenario: AC-003 Edit preserves unchanged fields
    Given I am editing a program named "Web Development 2026"
    And the description is "Full-stack web development program"
    When I only change the Description to "Updated full-stack curriculum"
    And I click Save
    Then the modal closes
    And the program list still shows the name "Web Development 2026"
    And the description shows "Updated full-stack curriculum"

  # Happy paths — extended

  Scenario: TC-004 Description can be cleared during edit
    Given I am editing a program with a non-empty description
    When I clear the Description field
    And I click Save
    Then the modal closes
    And the program remains in the list with an empty description

  Scenario: TC-013 Special characters in edited name are preserved
    Given I am editing a program
    When I change the Name to "Informatique & IA - Niveau 2"
    And I click Save
    Then the program list shows "Informatique & IA - Niveau 2"

  # Negative

  Scenario: TC-005 Save button disabled when Program Name is cleared
    Given I am editing a program
    When I clear the Program Name field
    Then the Save button is disabled

  Scenario: TC-006 Duplicate name on edit is rejected
    Given programs "Web Development 2026" and "Data Science 2026" exist
    And I am editing "Data Science 2026"
    When I change the Name to "Web Development 2026"
    And I click Save
    Then the edit modal remains open
    And I see an error indicating the name already exists

  Scenario: TC-007 Cancel discards unsaved changes
    Given I am editing "Web Development 2026"
    When I change the Name to "Should Not Be Saved"
    And I click Cancel
    Then the edit modal closes
    And the program list still shows "Web Development 2026"

  # Edge cases

  Scenario: TC-008 Double-clicking Save does not apply changes twice
    Given I am editing a program
    When I change the Description to "Updated once"
    And I double-click Save
    Then the modal closes
    And the description "Updated once" appears exactly once in the list

  Scenario: TC-012 Whitespace-only Program Name is treated as empty on edit
    Given I am editing a program
    When I fill Program Name with "   "
    Then the Save button is disabled

  Scenario: TC-009 Program name with 100 characters is accepted on edit
    Given I am editing a program
    When I change the Name to a string of 100 "B" characters
    And I click Save
    Then the modal closes
    And the program list shows the 100-character name

  Scenario: TC-010 Program name with 101 characters
    Given I am editing a program
    When I change the Name to a string of 101 "B" characters
    And I click Save
    Then the program is saved with the 101-character name visible in the list

  Scenario: TC-014 AI Generation Config fields visible on edit form
    Given I am editing a program
    When I expand "Show AI Generation Config"
    Then I see Total Program Hours and related AI fields

# Ambiguities / gaps
# - Jira AC-003: known automation failure on test.didaxis.studio (see DS-241).
# - Live UI uses browser confirm for delete, not edit; edit uses in-app Save/Cancel modal.
# - 101-character name: live app may accept without client maxlength; align expected result with product.
# - Automation: tests/ds2-edit-program.spec.ts
