package com.memory.memory_portal.repository;

import com.memory.memory_portal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByProviderId(String providerId);
    
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}

