package com.memory.memory_portal.repository;

import com.memory.memory_portal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    
    Optional<User> findByEmail(String email);
    
}

