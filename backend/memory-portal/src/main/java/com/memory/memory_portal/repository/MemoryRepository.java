package com.memory.memory_portal.repository;

import com.memory.memory_portal.model.Memory;
import com.memory.memory_portal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface MemoryRepository extends JpaRepository<Memory, String> {
    
    List<Memory> findByUser(User user);
    
    List<Memory> findByUserAndNotificationsEnabledTrue(User user);
    
    @Query("SELECT m FROM Memory m JOIN m.user u WHERE m.nextNotificationDate <= :now AND m.notificationsEnabled = true AND u.emailNotificationsEnabled = true")
    List<Memory> findMemoriesReadyForNotification(Date now);

    List<Memory> findByUserIdOrderByUploadDateDesc(String userId);
    
    List<Memory> findByUserIdAndYear(String userId, String year);
    
    List<Memory> findByUserIdAndMood(String userId, String mood);
}

