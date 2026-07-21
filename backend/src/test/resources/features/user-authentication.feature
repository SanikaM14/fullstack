Feature: User Authentication

  Scenario Outline: Verify user login with various roles
    Given the user opens the browser and navigates to login page
    When the user logs in using username "<user>" and password "<pass>"
    Then the user should be redirected to the "<page>" page

    Examples:
      | user          | pass        | page      |
      | admin_user    | admin123    | Dashboard |
      | customer_user | customer123 | Home      |
