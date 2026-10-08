@DS-1 @program-setup
Feature: DS-1 Create new academic program
  As an admin user, I want to create a new academic program so that I can begin designing its curriculum structure.

  # Happy paths — Jira acceptance criteria

  Scenario: AC-001 Navigate to program creation form
    Given I am logged in as admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the program creation form with fields Program Name and Description

  Scenario: AC-002 Successfully create a program
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  Scenario: AC-003 Validation prevents empty program name
    Given I am on the program creation form
    When I leave the Program Name field empty
    Then the Create button is disabled

  # Happy paths — extended

  Scenario: TC-004 Program created with name only and empty description
    Given I am on the program creation form
    When I fill in Program Name with "Data Science 2026"
    And I leave Description empty
    And I click Create
    Then the modal closes
    And the program list shows "Data Science 2026"

  Scenario: TC-011 Program name with special characters is accepted
    Given I am on the program creation form
    When I fill in Program Name with "Informatique & IA - Niveau 2"
    And I fill in Description with "Advanced AI program"
    And I click Create
    Then the modal closes
    And the program list shows "Informatique & IA - Niveau 2"

  # Negative

  Scenario: TC-005 Duplicate program name is rejected on create
    Given a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Duplicate attempt"
    And I click Create
    Then the form is not submitted successfully
    And I see an error indicating the name already exists

  Scenario: TC-012 Whitespace-only Program Name is treated as empty
    Given I am on the program creation form
    When I fill in Program Name with "   "
    And I fill in Description with "Valid description"
    Then the Create button is disabled

  # Edge cases

  Scenario: TC-006 Double-clicking Create does not create duplicate programs
    Given I am on the program creation form
    When I fill in Program Name with "Cybersecurity 2026"
    And I fill in Description with "Security fundamentals"
    And I double-click Create
    Then the modal closes
    And exactly one program named "Cybersecurity 2026" appears in the list

  Scenario: TC-007 Program name at maximum length (100 characters) is accepted
    Given I am on the program creation form
    When I fill in Program Name with a string of 100 "A" characters
    And I fill in Description with "Boundary test"
    And I click Create
    Then the modal closes
    And the program appears in the list

  Scenario: TC-009 Description at maximum length (500 characters) is accepted
    Given I am on the program creation form
    When I fill in Program Name with "Long Description Program"
    And I fill in Description with a string of 500 "D" characters
    And I click Create
    Then the modal closes
    And the program appears in the list

  Scenario: TC-008 Program name exceeding 100 characters is rejected
    Given I am on the program creation form
    When I fill in Program Name with a string of 101 "A" characters
    And I click Create
    Then the program is not created
    And I see a validation message about name length

  Scenario: TC-010 Description exceeding 500 characters is rejected
    Given I am on the program creation form
    When I fill in Program Name with "Overflow Description Program"
    And I fill in Description with a string of 501 "D" characters
    And I click Create
    Then the program is not created
    And I see a validation message about description length

# Ambiguities / gaps
# - Live app on test.didaxis.studio may not enforce 100/500 character limits (no HTML maxlength); confirm product rules vs these edge cases.
# - Duplicate-name behavior may not match AC when many rows share the same name in test data (see DS-3).
# - Automation: tests/ds1-create-program.spec.ts
