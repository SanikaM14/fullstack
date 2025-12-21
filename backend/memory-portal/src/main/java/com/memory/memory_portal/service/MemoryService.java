package com.memory.memory_portal.service;

import com.memory.memory_portal.exception.ResourceNotFoundException;
import com.memory.memory_portal.model.Memory;
import com.memory.memory_portal.model.User;
import com.memory.memory_portal.repository.MemoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class MemoryService {
    
    @Autowired
    private MemoryRepository memoryRepository;
    
    @Autowired
    private MemoryAnalyzerService memoryAnalyzerService;
    
    @Value("${upload.dir}")
    private String uploadDir;
    
    public Memory createMemory(MultipartFile file, User user) throws IOException {
        try {
            System.out.println("=== Starting Memory Creation ===");
            System.out.println("Upload directory: " + uploadDir);
            
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                System.out.println("Creating upload directory");
                Files.createDirectories(uploadPath);
            } else {
                System.out.println("Upload directory already exists");
            }
            
            if (!Files.isWritable(uploadPath)) {
                throw new IOException("Upload directory is not writable: " + uploadPath.toAbsolutePath());
            }
            
            System.out.println("Analyzing image");
            var analysis = memoryAnalyzerService.analyzeImage(file);
            System.out.println("Image analysis completed");
            
            String originalFilename = file.getOriginalFilename();
            String safeFilename = originalFilename != null ? originalFilename : "memory.jpg";
            String fileName = UUID.randomUUID().toString() + "_" + safeFilename;
            Path filePath = uploadPath.resolve(fileName);
            
            System.out.println("Saving file to: " + filePath.toAbsolutePath());
            Files.copy(file.getInputStream(), filePath);
            System.out.println("File saved successfully");
            
            if (!Files.exists(filePath)) {
                throw new IOException("Failed to save file: " + filePath.toAbsolutePath());
            }
            
            Memory memory = new Memory();
            memory.setFileName(safeFilename);
            memory.setFilePath(fileName);
            memory.setYear(analysis.getYear());
            memory.setDominantColors(analysis.getDominantColors());
            memory.setTags(analysis.getTags());
            memory.setMood(analysis.getMood());
            memory.setUser(user);
            memory.setUploadDate(new Date());
            memory.setNotificationsEnabled(true);
            memory.calculateNextNotificationDate();
            
            System.out.println("Saving memory to database");
            Memory savedMemory = memoryRepository.save(memory);
            System.out.println("Memory saved with ID: " + savedMemory.getId());
            
            return savedMemory;
        } catch (IOException e) {
            System.err.println("IO Error during memory creation: " + e.getMessage());
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            System.err.println("Error during memory creation: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create memory: " + e.getMessage(), e);
        }
    }
    
    public List<Memory> getUserMemories(User user) {
        return memoryRepository.findByUserIdOrderByUploadDateDesc(user.getId());
    }
    
    public Memory getMemoryById(String id) {
        return memoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Memory", "id", id));
    }
    
    public void deleteMemory(String id, User user) {
        Memory memory = getMemoryById(id);
        
        if (!memory.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You don't have permission to delete this memory");
        }
        
        try {
            Path filePath = Paths.get(uploadDir, memory.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + e.getMessage());
        }
        
        memoryRepository.delete(memory);
    }
    
    public Memory updateNotificationSettings(String id, User user, boolean enabled) {
        Memory memory = getMemoryById(id);
        
        if (!memory.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You don't have permission to update this memory");
        }
        
        memory.setNotificationsEnabled(enabled);
        if (enabled) {
            memory.calculateNextNotificationDate();
        } else {
            memory.setNextNotificationDate(null);
        }
        
        return memoryRepository.save(memory);
    }
    
    public List<Memory> getMemoriesByYear(String userId, String year) {
        return memoryRepository.findByUserIdAndYear(userId, year);
    }
    
    public List<Memory> getMemoriesByMood(String userId, String mood) {
        return memoryRepository.findByUserIdAndMood(userId, mood);
    }
    
    public List<Memory> getMemoriesReadyForNotification() {
        return memoryRepository.findMemoriesReadyForNotification(new Date());
    }
    
    public Memory saveMemory(Memory memory) {
        return memoryRepository.save(memory);
    }
}