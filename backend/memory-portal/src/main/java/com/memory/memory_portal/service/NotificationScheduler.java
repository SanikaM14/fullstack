package com.memory.memory_portal.service;

import com.memory.memory_portal.model.Memory;
import com.memory.memory_portal.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationScheduler {
    
    @Autowired
    private MemoryService memoryService;
    
    @Autowired
    private EmailService emailService;
    
    @Scheduled(cron = "0 0 9 * * ?")
    @Transactional
    public void sendScheduledNotifications() {
        List<Memory> memoriesToNotify = memoryService.getMemoriesReadyForNotification();
        
        if (memoriesToNotify.isEmpty()) {
            return;
        }
        
        Map<User, List<Memory>> memoriesByUser = memoriesToNotify.stream()
            .collect(Collectors.groupingBy(Memory::getUser));
        
        for (Map.Entry<User, List<Memory>> entry : memoriesByUser.entrySet()) {
            User user = entry.getKey();
            List<Memory> userMemories = entry.getValue();
            
            if (user.isEmailNotificationsEnabled()) {
                try {
                    emailService.sendMemoryNotification(user, userMemories);
                    
                    for (Memory memory : userMemories) {
                        memory.setLastNotificationDate(new Date());
                        memory.calculateNextNotificationDate();
                        memoryService.saveMemory(memory);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send notification to " + user.getEmail() + ": " + e.getMessage());
                }
            }
        }
    }
}

