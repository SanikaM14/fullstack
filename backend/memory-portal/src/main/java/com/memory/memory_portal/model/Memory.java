package com.memory.memory_portal.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "memories")
public class Memory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String fileName;
    
    private String filePath; 
    
    private String year;
    
    @ElementCollection
    @CollectionTable(name = "memory_colors", joinColumns = @JoinColumn(name = "memory_id"))
    @Column(name = "color")
    private List<String> dominantColors;
    
    @ElementCollection
    @CollectionTable(name = "memory_tags", joinColumns = @JoinColumn(name = "memory_id"))
    @Column(name = "tag")
    private List<String> tags;
    
    private String mood;
    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date uploadDate;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastNotificationDate;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date nextNotificationDate;
    
    @Column(nullable = false)
    private boolean notificationsEnabled = true;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    public Memory() {
        this.uploadDate = new Date();
    }
    
    public Memory(String fileName, String filePath, String year, List<String> dominantColors, 
                 List<String> tags, String mood, User user) {
        this();
        this.fileName = fileName;
        this.filePath = filePath;
        this.year = year;
        this.dominantColors = dominantColors;
        this.tags = tags;
        this.mood = mood;
        this.user = user;
        calculateNextNotificationDate();
    }
    
    public void calculateNextNotificationDate() {
        Date baseDate = lastNotificationDate != null ? lastNotificationDate : uploadDate;
        long threeMonthsInMillis = 90L * 24 * 60 * 60 * 1000; 
        this.nextNotificationDate = new Date(baseDate.getTime() + threeMonthsInMillis);
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    
    public List<String> getDominantColors() { return dominantColors; }
    public void setDominantColors(List<String> dominantColors) { this.dominantColors = dominantColors; }
    
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    
    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }
    
    public Date getUploadDate() { return uploadDate; }
    public void setUploadDate(Date uploadDate) { this.uploadDate = uploadDate; }
    
    public Date getLastNotificationDate() { return lastNotificationDate; }
    public void setLastNotificationDate(Date lastNotificationDate) { this.lastNotificationDate = lastNotificationDate; }
    
    public Date getNextNotificationDate() { return nextNotificationDate; }
    public void setNextNotificationDate(Date nextNotificationDate) { this.nextNotificationDate = nextNotificationDate; }
    
    public boolean isNotificationsEnabled() { return notificationsEnabled; }
    public void setNotificationsEnabled(boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}