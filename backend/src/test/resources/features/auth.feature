Feature: Memories Portal Authentication Backend

  Scenario Outline: Validate Login API responses for incoming payloads
    Given The Spring Boot backend environment is active
    When Postman or a client transmits a login request with username "<userEmail>" and security password "<userPassword>"
    Then The system must process the verification and respond with a status code of <statusCode>

    Examples: 

      | userEmail         | userPassword | statusCode |
      | sanika@gmail.com  | securePass123| 200        |
      | hacker@invalid.com| fakePassword | 401        |

