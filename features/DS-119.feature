@DS-119 @dashboard
Feature: DS-119 Dashboard displaying the right components
  As an admin user, I want to see the correct dashboard so that I can reach key modules quickly.

  # Happy paths — Jira acceptance criteria

  Scenario: AC-001 Navigate to the Dashboard
    Given I am logged in as admin
    When I navigate to the Dashboard page
    Then I see the Dashboard with the right blocks Programs, Calendar, Validation, and AI Assist

  Scenario: AC-002 Successfully navigate to Program Page
    Given I am on the Dashboard
    When I click on the Programs card
    Then I navigate to the Programs page

  Scenario: AC-003 Successfully navigate to Calendar Page
    Given I am on the Dashboard
    When I click on the Calendar card
    Then I navigate to the Calendar page

  Scenario: AC-004 Successfully navigate to Validation Page
    Given I am on the Dashboard
    When I click on the Validation card
    Then I navigate to the Validation page

  Scenario: AC-005 Successfully navigate to AI Assist Page
    Given I am on the Dashboard
    When I click on the AI Assist card
    Then I navigate to the AI Assist page

  # Happy paths — extended

  Scenario: TC-001 Dashboard shows primary heading and welcome copy
    Given I am logged in as admin
    When I navigate to the Dashboard page
    Then I see the heading "Dashboard"
    And I see welcome copy for Didaxis Studio

  Scenario: TC-002 Dashboard shows Connected status when backend is reachable
    Given I am logged in as admin
    When I navigate to the Dashboard page
    Then I see a Connected indicator on the dashboard

  Scenario: TC-003 Quick Start section lists onboarding steps
    Given I am on the Dashboard
    Then I see a Quick Start section with numbered steps

  Scenario: TC-004 Sidebar Dashboard link returns to home dashboard
    Given I am on the Programs page
    When I click Dashboard in the sidebar
    Then I am on the Dashboard page
    And I see the Programs, Calendar, Validation, and AI Assist cards

  # Negative

  Scenario: TC-005 Unauthenticated user cannot view Dashboard
    Given I am not logged in
    When I navigate to the Dashboard URL
    Then I am redirected to the login page

  # Edge cases

  Scenario: TC-006 Dashboard cards are keyboard focusable and activatable
    Given I am on the Dashboard
    When I move focus to the Programs card and activate it
    Then I navigate to the Programs page

  Scenario: TC-007 Browser back from a module returns to Dashboard
    Given I am on the Dashboard
    When I open the Calendar page from the Calendar card
    And I use the browser back control
    Then I am on the Dashboard page

  Scenario: TC-008 Programs card shows program count or summary when data exists
    Given programs exist in the system
    When I am on the Dashboard
    Then the Programs card reflects that programs exist

# Ambiguities / gaps
# - Jira AC uses typo "Dashboardx" in Given steps; scenarios above use "Dashboard".
# - AI Assist route is /cli on test.didaxis.studio; confirm card label vs page title "AI Assist".
# - Quick Start, Connected badge, and program counts are observed on live app but not in Jira AC.
# - No Playwright spec in repo yet; suggested: tests/ds119-dashboard.spec.ts
