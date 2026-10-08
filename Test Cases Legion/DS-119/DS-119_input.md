# Prompt Template "Test Plan" from a Jira Ticket

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the Dashboard displaying the right components (DS-119).

## Acceptance Criteria

Scenario: Navigate to the Dashboard
  Given I am logged in as admin
  When I navigate to the Dashboard page
  Then I see the Dashboard with the right blocks: Programs, Calendar, Validation, AI Assist

Scenario: Successfully navigate to Program Page
  Given I am on Dashboard
  When I click on Programs card
  Then I navigate to the Programs page

Scenario: Successfully navigate to Calendar Page
  Given I am on Dashboard
  When I click on Calendar card
  Then I navigate to the Calendar page

Scenario: Successfully navigate to Validation Page
  Given I am on Dashboard
  When I click on Validation card
  Then I navigate to the Validation page

Scenario: Successfully navigate to AI Assist Page
  Given I am on Dashboard
  When I click on AI Assist card
  Then I navigate to the AI Assist page

## Requirements for the test plan

- All test cases must be in Gherkin
- Cover every AC with at least one test case
- Add edge cases the ACs don't mention
- Output: `Test Cases Legion/DS-119/DS-119_output.md` and `features/DS-119.feature`
