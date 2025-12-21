package com.memory.memory_portal.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Collections;
import java.util.Map;

@Controller
public class WebController {
    
    @GetMapping("/user")
    @ResponseBody
    public Map<String, Object> user(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return Collections.singletonMap("error", "Not authenticated");
        }
        return Collections.singletonMap("name", principal.getAttribute("name"));
    }
    
    @GetMapping("/login")
    public String login() {
        return "redirect:/oauth2/authorization/google";
    }
}