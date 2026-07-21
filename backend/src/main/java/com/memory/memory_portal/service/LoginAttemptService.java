package com.memory.memory_portal.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private final int MAX_ATTEMPT = 5;
    private final long LOCK_TIME_DURATION = 15 * 60 * 1000; // 15 minutes

    private ConcurrentHashMap<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    private ConcurrentHashMap<String, Long> lockoutCache = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        attemptsCache.remove(key);
        lockoutCache.remove(key);
    }

    public void loginFailed(String key) {
        int attempts = attemptsCache.getOrDefault(key, 0);
        attempts++;
        attemptsCache.put(key, attempts);
        if (attempts >= MAX_ATTEMPT) {
            lockoutCache.put(key, System.currentTimeMillis());
        }
    }

    public boolean isBlocked(String key) {
        if (!lockoutCache.containsKey(key)) {
            return false;
        }
        long lockoutTime = lockoutCache.get(key);
        if (System.currentTimeMillis() - lockoutTime > LOCK_TIME_DURATION) {
            lockoutCache.remove(key);
            attemptsCache.remove(key);
            return false;
        }
        return true;
    }
}
