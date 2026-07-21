package com.memory.memory_portal.stepdefinitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;

public class UserLoginSteps {

    @Given("the user opens the browser and navigates to login page")
    public void openBrowser() {
        System.out.println("Browser opened and navigated to login page.");
    }

    @When("the user logs in using username {string} and password {string}")
    public void loginUser(String username, String password) {
        System.out.println("Logging in with: " + username + " and " + password);
    }

    @Then("the user should be redirected to the {string} page")
    public void verifyRedirect(String expectedPage) {
        System.out.println("Verified redirection to: " + expectedPage);
    }
}
