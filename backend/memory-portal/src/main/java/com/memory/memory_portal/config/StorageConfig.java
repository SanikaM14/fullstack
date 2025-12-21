package com.memory.memory_portal.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class StorageConfig implements WebMvcConfigurer {
    
    @Value("${upload.dir}")
    private String uploadDir;
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            System.out.println("Upload directory created: " + created + " at " + directory.getAbsolutePath());
        } else {
            System.out.println("Upload directory already exists at: " + directory.getAbsolutePath());
        }
        
        String location = uploadDir;
        if (!location.endsWith("/")) {
            location += "/";
        }
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + location);
    }
}