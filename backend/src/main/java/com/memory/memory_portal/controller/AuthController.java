package com.memory.memory_portal.controller;


import com.memory.memory_portal.service.UserService;
import com.memory.memory_portal.service.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final LoginAttemptService loginAttemptService;

    public AuthController(AuthenticationManager authenticationManager, UserService userService, LoginAttemptService loginAttemptService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.loginAttemptService = loginAttemptService;
    }

    @GetMapping("/csrf")
    public ResponseEntity<?> getCsrfToken(HttpServletRequest request) {
        org.springframework.security.web.csrf.CsrfToken csrfToken = (org.springframework.security.web.csrf.CsrfToken) request.getAttribute(org.springframework.security.web.csrf.CsrfToken.class.getName());
        return ResponseEntity.ok(Collections.singletonMap("token", csrfToken != null ? csrfToken.getToken() : ""));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            userService.registerUser(request.getName(), request.getEmail(), request.getPassword());
            return ResponseEntity.ok(Collections.singletonMap("message", "User registered successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() : e.toString();
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", errorMsg));
        }
    }



    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String email = request.getEmail().trim().toLowerCase();
        if (loginAttemptService.isBlocked(email)) {
            return ResponseEntity.status(429).body(Collections.singletonMap("error", "Account locked due to too many failed attempts. Try again in 15 minutes."));
        }
        
        try {
            UsernamePasswordAuthenticationToken authReq = new UsernamePasswordAuthenticationToken(email, request.getPassword());
            Authentication auth = authenticationManager.authenticate(authReq);
            
            SecurityContext sc = SecurityContextHolder.getContext();
            sc.setAuthentication(auth);
            httpRequest.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, sc);
            
            userService.updateLastLogin(email);
            loginAttemptService.loginSucceeded(email);
            
            return ResponseEntity.ok(Collections.singletonMap("message", "Login successful"));
        } catch (Exception e) {
            loginAttemptService.loginFailed(email);
            return ResponseEntity.status(401).body(Collections.singletonMap("error", "Invalid email or password"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        request.getSession().invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Collections.singletonMap("message", "Logout successful"));
    }

    static class RegisterRequest {
        @NotBlank
        @Size(max = 100)
        private String name;
        
        @NotBlank
        @Email
        @Size(max = 100)
        private String email;
        
        @NotBlank
        @Size(min = 8, max = 100)
        private String password;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    static class LoginRequest {
        @NotBlank
        @Email
        @Size(max = 100)
        private String email;
        
        @NotBlank
        @Size(max = 100)
        private String password;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
