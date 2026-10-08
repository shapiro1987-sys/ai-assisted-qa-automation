@DS-3 @program-setup
Feature: DS-3 Program name validation and duplicate prevention
  As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.

  # Happy paths — Jira acceptance criteria

  Scenario: AC-002 Accept program name with special characters
    Given I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully

  # Negative — Jira acceptance criteria

  Scenario: AC-001 Reject program name with only whitespace
    Given I am on the program creation form
    When I enter "   " as the program name
    And I attempt to click Create
    Then the form is not submitted
    And the name is treated as empty after trim

  Scenario: AC-003 Reject duplicate program name
    Given a program "Web Development 2026" already exists
    When I try to create a new program with the name "Web Development 2026"
    Then I see an error indicating the name already exists

  # Happy paths — extended

  Scenario: TC-002 Program name with hyphens and numbers is accepted
    Given I am on the program creation form
    When I enter "Web-Dev 2026 v2" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully

  Scenario: TC-012 Unicode characters in program name are accepted
    Given I am on the program creation form
    When I enter "プログラム 2026" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully

  Scenario: TC-013 Renaming a program to its own current name succeeds
    Given a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I save without changing the name
    Then the edit completes successfully

  # Negative — extended

  Scenario: TC-006 Empty program name is rejected
    Given I am on the program creation form
    When I leave Program Name empty
    Then the Create button is disabled

  Scenario: TC-007 Duplicate name rejected on edit of a different program
    Given programs "Web Development 2026" and "Data Science 2026" exist
    And I am editing "Data Science 2026"
    When I rename it to "Web Development 2026"
    And I click Save
    Then I see a duplicate name error

  # Edge cases

  Scenario: TC-003 Duplicate check is case-sensitive
    Given a program "Web Development 2026" exists
    When I create a program named "web development 2026"
    Then the system either rejects or accepts based on case-sensitivity rules
    And behavior is documented consistently for create and edit

  Scenario: TC-008 Program name at exactly 100 characters is accepted
    Given I am on the program creation form
    When I enter a 100-character program name
    And I click Create
    Then the program is created successfully

  Scenario: TC-009 Program name exceeding 100 characters is rejected
    Given I am on the program creation form
    When I enter a 101-character program name
    And I click Create
    Then the program is not created
    And I see a validation error

  Scenario: TC-010 Leading and trailing spaces are trimmed before validation
    Given I am on the program creation form
    When I enter "  Trimmed Name  " as the program name
    And I click Create
    Then the program list shows "Trimmed Name"

  Scenario: TC-011 Duplicate detected after trimming whitespace
    Given a program "Web Development 2026" exists
    When I create a program named "  Web Development 2026  "
    Then I see a duplicate name error

# Ambiguities / gaps
# - Test environment may already contain many duplicate "Web Development 2026" rows; AC-003 may fail until data is cleaned or uniqueness is enforced.
# - Character limits may not be enforced in the live UI; reconcile with DS-1/DS-2 automation notes.
# - Automation: tests/ds3-name-validation.spec.ts
