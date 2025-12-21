package com.memory.memory_portal.service;

import com.memory.memory_portal.model.User;
import com.memory.memory_portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.Optional;

@Service
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public User findOrCreateUser(OAuth2User oauth2User) {
        try {
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            String providerId = oauth2User.getAttribute("sub");
            String picture = oauth2User.getAttribute("picture");
            
            logger.info("Looking for user with email: {}", email);
            
            User user = userRepository.findByProviderAndProviderId("google", providerId)
                .orElse(null);
            
            if (user == null && email != null) {
                user = userRepository.findByEmail(email).orElse(null);
            }
            
            if (user == null) {
                logger.info("User not found, creating new user...");
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setProfilePictureUrl(picture);
                user.setProvider("google");
                user.setProviderId(providerId);
                user.setLastLoginAt(new Date());
                
                user = userRepository.save(user);
                logger.info("Created new user with ID: {}", user.getId());
            } else {
                logger.info("Found existing user with ID: {}", user.getId());
                user.setLastLoginAt(new Date());
                user = userRepository.save(user);
            }
            
            return user;
        } catch (Exception e) {
            logger.error("Error in findOrCreateUser: ", e);
            throw e;
        }
    }
    
    @Transactional
    public User updateNotificationSettings(String userId, boolean enabled) {
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
        } catch (Exception e) {
            logger.error("Error updating notification settings: ", e);
            throw e;
        }
    }
    
    public User getUserById(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @Transactional
    public User updateUserProfile(String userId, String name, String profilePictureUrl) {
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