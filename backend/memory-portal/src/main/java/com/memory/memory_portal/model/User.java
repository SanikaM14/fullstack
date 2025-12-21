package com.memory.memory_portal.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String name;
    
    private String profilePictureUrl;
    
    @Column(nullable = false)
    private String provider; 
    
    @Column(nullable = false, unique = true)
    private String providerId; 
    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date createdAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastLoginAt;
    
    @Column(nullable = false)
    private boolean emailNotificationsEnabled = true;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Memory> memories;
    
    public User() {
        this.createdAt = new Date();
    }
    
    public User(String email, String name, String provider, String providerId) {
        this();
        this.email = email;
        this.name = name;
        this.provider = provider;
        this.providerId = providerId;
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    
    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }
    
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    
    public Date getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(Date lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    
    public boolean isEmailNotificationsEnabled() { return emailNotificationsEnabled; }
    public void setEmailNotificationsEnabled(boolean emailNotificationsEnabled) { this.emailNotificationsEnabled = emailNotificationsEnabled; }
    
    public List<Memory> getMemories() { return memories; }
    public void setMemories(List<Memory> memories) { this.memories = memories; }
}

