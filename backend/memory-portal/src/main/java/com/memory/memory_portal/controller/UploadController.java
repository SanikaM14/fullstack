package com.memory.memory_portal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.memory.memory_portal.service.MemoryService;
import com.memory.memory_portal.service.UserService;
import com.memory.memory_portal.model.Memory;
import com.memory.memory_portal.model.MemoryAnalysis;
import com.memory.memory_portal.model.User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UploadController {
    
    @Autowired
    private MemoryService memoryService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfo(@AuthenticationPrincipal OAuth2User oauth2User) {
        try {
            if (oauth2User == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }
            
            User user = userService.findOrCreateUser(oauth2User);
            
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
            @AuthenticationPrincipal OAuth2User oauth2User) {
        try {
            System.out.println("=== Upload Request Started ===");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize() + " bytes");
            System.out.println("Content type: " + file.getContentType());
            System.out.println("User authenticated: " + (oauth2User != null));
            
            if (oauth2User == null) {
                return ResponseEntity.status(401).body("Please login to upload memories");
            }
            
            User user = userService.findOrCreateUser(oauth2User);
            System.out.println("User found/created: " + user.getId());
            
            Memory memory = memoryService.createMemory(file, user);
            System.out.println("Memory created successfully: " + memory.getId());
            
            MemoryAnalysis analysis = convertToMemoryAnalysis(memory);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            System.err.println("=== Upload Error ===");
            e.printStackTrace();
            
            String errorMessage = "Upload failed: " + e.getMessage();
            if (e.getCause() != null) {
                errorMessage += " (Cause: " + e.getCause().getMessage() + ")";
            }
            
            return ResponseEntity.badRequest().body(errorMessage);
        }
    }
    
    @PostMapping("/test-upload")
    public ResponseEntity<?> testUpload(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("=== Test Upload Request ===");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize() + " bytes");
            System.out.println("Content type: " + file.getContentType());
            
            return ResponseEntity.ok("File received successfully: " + file.getOriginalFilename() + 
                                  ", Size: " + file.getSize() + 
                                  ", Type: " + file.getContentType());
        } catch (Exception e) {
            System.err.println("=== Test Upload Error ===");
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/memories")
    public ResponseEntity<?> getMemories(@AuthenticationPrincipal OAuth2User oauth2User) {
        try {
            if (oauth2User == null) {
                return ResponseEntity.status(401).body("Please login to view memories");
            }
            
            User user = userService.findOrCreateUser(oauth2User);
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
            @AuthenticationPrincipal OAuth2User oauth2User) {
        try {
            if (oauth2User == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            User user = userService.findOrCreateUser(oauth2User);
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
            @AuthenticationPrincipal OAuth2User oauth2User) {
        try {
            if (oauth2User == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            User user = userService.findOrCreateUser(oauth2User);
            Memory memory = memoryService.updateNotificationSettings(id, user, enabled);
            return ResponseEntity.ok(convertToMemoryAnalysis(memory));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update settings: " + e.getMessage());
        }
    }
    
    @PutMapping("/user/notifications")
    public ResponseEntity<?> updateUserNotificationSettings(
            @RequestParam boolean enabled,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        try {
            if (oauth2User == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            User user = userService.findOrCreateUser(oauth2User);
            user = userService.updateNotificationSettings(user.getId(), enabled);
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