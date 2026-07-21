package com.memory.memory_portal.service;

import com.memory.memory_portal.model.User;
import com.memory.memory_portal.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.Optional;

@Service
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Transactional
    public User registerUser(String name, String email, String password) {
        String sanitizedEmail = email.trim().toLowerCase();
        if (userRepository.findByEmail(sanitizedEmail).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        
        User user = new User();
        user.setName(name.trim());
        user.setEmail(sanitizedEmail);
        user.setPassword(passwordEncoder.encode(password));
        user.setLastLoginAt(new Date());
        
        return userRepository.save(user);
    }
    
    public Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        return userRepository.findByEmail(email.trim().toLowerCase());
    }
    
    @Transactional
    public void updateLastLogin(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setLastLoginAt(new Date());
            userRepository.save(user);
        });
    }
    
    @Transactional
    public User updateNotificationSettings(String userId, boolean enabled) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        try {
            Optional<User> optionalUser = userRepository.findById(userId);
            if (optionalUser.isPresent()) {
                User user = optionalUser.get();
                user.setEmailNotificationsEnabled(enabled);
                user = userRepository.save(user);
                logger.info("Updated notification settings for user {}: {}", userId, enabled);
                return user;
            } else {
                logger.error("User not found with ID: {}", userId);
                throw new RuntimeException("User not found");
            }
        } catch (RuntimeException e) {
            logger.error("Error updating notification settings: ", e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error updating notification settings: ", e);
            throw new RuntimeException("Failed to update notification settings", e);
        }
    }
    
    public User getUserById(String userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @Transactional
    public User updateUserProfile(String userId, String name, String profilePictureUrl) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        User user = getUserById(userId);
        if (name != null) {
            user.setName(name);
        }
        if (profilePictureUrl != null) {
            user.setProfilePictureUrl(profilePictureUrl);
        }
        return userRepository.save(user);
    }
}