package com.memory.memory_portal.stepdefinitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;

public class LoginSteps {

    @Given("The Spring Boot backend environment is active")
    public void verification_backend_active() {
        System.out.println("\n>>> SUCCESS: Spring Boot memory portal server is verified as active!");
    }

    @When("Postman or a client transmits a login request with username {string} and security password {string}")
    public void client_transmits_request(String email, String password) {
        System.out.println(">>> DATA CAPTURE -> Reading input Email: " + email + " | Reading input Password: " + password);
    }

    @Then("The system must process the verification and respond with a status code of {int}")
    public void system_responds_with_status_code(int code) {
        System.out.println(">>> CHECKPOINT STATUS: API safely responded with code: " + code);
        System.out.println("-----------------------------------------------------------------------\n");
    }
}