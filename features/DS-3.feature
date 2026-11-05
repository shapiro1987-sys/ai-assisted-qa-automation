@DS-3 @program-setup
Feature: DS-3 Program name validation and duplicate prevention
  As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.

  # Happy paths — Jira acceptance criteria

  Scenario: AC-002 Accept program name with special characters
    Given I am on the New Program form
    When I enter "Informatique & IA - Niveau 2" as the Program Name
    And I click Create
    Then the program is created
    And the New Program form closes

  # Negative — Jira acceptance criteria

  Scenario: AC-001 Reject program name with only whitespace
    Given I am on the New Program form
    When I enter "   " as the Program Name
    Then Create is disabled
    And the form is not submitted

  Scenario: AC-003 Reject duplicate program name
    Given a program "Web Development 2026" already exists
    When I try to create a new program with the name "Web Development 2026"
    Then I see an error indicating the name already exists
    And a second program with that name is not created

  # Happy paths — extended

  Scenario: TC-002 Program name with hyphens and numbers is accepted
    Given I am on the New Program form
    When I enter "Web-Dev 2026 v2" as the Program Name
    And I click Create
    Then the program is created

  Scenario: TC-012 Unicode characters in program name are accepted
    Given I am on the New Program form
    When I enter "プログラム 2026" as the Program Name
    And I click Create
    Then the program is created

  Scenario: TC-013 Renaming a program to its own current name succeeds
    Given a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I save without changing the name
    Then the edit completes
    And the program remains in the list

  # Negative — extended

  Scenario: TC-006 Empty program name is rejected
    Given I am on the New Program form
    When Program Name is empty
    Then Create is disabled

  Scenario: TC-007 Duplicate name rejected on edit of a different program
    Given programs "Web Development 2026" and "Data Science 2026" exist
    And I am editing "Data Science 2026"
    When I rename it to "Web Development 2026"
    And I click Save
    Then I see an error indicating the name already exists
    And "Data Science 2026" remains in the list

  # Edge cases

  Scenario: TC-008 Program name at exactly 100 characters can be submitted
    Given I am on the New Program form
    When I enter a 100-character Program Name
    Then the field contains 100 characters
    And Create is enabled

  Scenario: TC-009 Program name of 101 characters is not blocked in the field
    Given I am on the New Program form
    When I enter a 101-character Program Name
    Then the field contains 101 characters
    And Create stays enabled

# Crawl 2026-10-29 on https://test.didaxis.studio/programs (signed-in admin)
# New Program form fields that resolved: label "Program Name" (required), label "Description" (not required),
# button "Create", button "Cancel". Description is optional, so "other required fields" in the ticket does not match this form.
# Empty Program Name: Create disabled.
# Program Name "   ": Create disabled, and the field value stayed "   ". No separate error string was shown.
# No maxlength attribute. A 100-character value and a 101-character value both left Create enabled. 101 was not submitted.
# Creating "Informatique & IA - Niveau 2 {timestamp}" returned HTTP 201 and the form closed.
# Creating that same name again also returned HTTP 201 and the form closed. No error text. Both programs were deleted after the crawl.
# Edit-duplicate and save-own-name were not exercised.
# Playwright MCP could not launch (Google Chrome is not installed). Crawl used project Chromium.
# Open bug DS-13 already records that duplicate program names are allowed.

# Ambiguities / gaps
# - AC-003 requires an error and no second row. The live create path did the opposite on this crawl.
# - No character limit is enforced in the field. TC-009 records that; it does not invent a rejection message.
# - Case sensitivity and trim-before-save were not observed. They are not separate scenarios.
# - Automation target: tests/ds3-name-validation.spec.ts
