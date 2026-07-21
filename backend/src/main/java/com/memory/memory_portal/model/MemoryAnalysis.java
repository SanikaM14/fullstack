package com.memory.memory_portal.model;

import java.util.Date;
import java.util.List;

public class MemoryAnalysis {
    private String id;
    private String fileName;
    private String year;
    private List<String> dominantColors;
    private List<String> tags;
    private String mood;
    private Date uploadDate;
    
    public MemoryAnalysis() {}
    
    public MemoryAnalysis(String fileName, String year, List<String> dominantColors, 
                         List<String> tags, String mood) {
        this.fileName = fileName;
        this.year = year;
        this.dominantColors = dominantColors;
        this.tags = tags;
        this.mood = mood;
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
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
}

