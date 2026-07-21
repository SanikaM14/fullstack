package com.memory.memory_portal.controller;


import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.memory.memory_portal.service.MemoryService;
import com.memory.memory_portal.service.UserService;
import com.memory.memory_portal.model.Memory;
import com.memory.memory_portal.model.MemoryAnalysis;
import com.memory.memory_portal.model.User;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UploadController {
    
    private final MemoryService memoryService;
    private final UserService userService;

    public UploadController(MemoryService memoryService, UserService userService) {
        this.memoryService = memoryService;
        this.userService = userService;
    }
    
    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) return null;
        return userService.findByEmail(principal.getName()).orElse(null);
    }
    
    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfo(Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            if (user == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("name", user.getName());
            userInfo.put("email", user.getEmail());
            userInfo.put("profilePictureUrl", user.getProfilePictureUrl());
            userInfo.put("emailNotificationsEnabled", user.isEmailNotificationsEnabled());
            
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get user info: " + e.getMessage());
        }
    }
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            if (user == null) {
                return ResponseEntity.status(401).body("Please login to upload memories");
            }
            
            Memory memory = memoryService.createMemory(file, user);
            MemoryAnalysis analysis = convertToMemoryAnalysis(memory);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/test-upload")
    public ResponseEntity<?> testUpload(@RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok("File received successfully: " + file.getOriginalFilename());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/memories")
    public ResponseEntity<?> getMemories(Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            if (user == null) {
                return ResponseEntity.status(401).body("Please login to view memories");
            }
            
            List<Memory> memories = memoryService.getUserMemories(user);
            
            List<MemoryAnalysis> analyses = memories.stream()
                .map(this::convertToMemoryAnalysis)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(analyses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch memories: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/memories/{id}")
    public ResponseEntity<?> deleteMemory(
            @PathVariable String id,
            Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            if (user == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            memoryService.deleteMemory(id, user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete memory: " + e.getMessage());
        }
    }
    
    @PutMapping("/memories/{id}/notifications")
    public ResponseEntity<?> updateNotificationSettings(
            @PathVariable String id,
            @RequestParam boolean enabled,
            Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            if (user == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            Memory memory = memoryService.updateNotificationSettings(id, user, enabled);
            return ResponseEntity.ok(convertToMemoryAnalysis(memory));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update settings: " + e.getMessage());
        }
    }
    
    @PutMapping("/user/notifications")
    public ResponseEntity<?> updateUserNotificationSettings(
            @RequestParam boolean enabled,
            Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            if (user == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            userService.updateNotificationSettings(user.getId(), enabled);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update settings: " + e.getMessage());
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Memory Flashback Portal is running!");
    }
    
    private MemoryAnalysis convertToMemoryAnalysis(Memory memory) {
        MemoryAnalysis analysis = new MemoryAnalysis();
        analysis.setId(memory.getId());
        analysis.setFileName(memory.getFileName());
        analysis.setYear(memory.getYear());
        analysis.setDominantColors(memory.getDominantColors());
        analysis.setTags(memory.getTags());
        analysis.setMood(memory.getMood());
        analysis.setUploadDate(memory.getUploadDate());
        return analysis;
    }
}