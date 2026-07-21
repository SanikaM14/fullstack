package com.memory.memory_portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MemoryPortalApplication {

	public static void main(String[] args) {
		SpringApplication.run(MemoryPortalApplication.class, args);
	}

}
