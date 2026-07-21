package com.memory.memory_portal.service;

import com.memory.memory_portal.model.Memory;
import com.memory.memory_portal.model.User;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.text.SimpleDateFormat;
import java.util.List;

@Service
public class EmailService {
    
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    public void sendMemoryNotification(User user, List<Memory> memories) {
        if (memories.isEmpty()) {
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            String from = fromEmail != null ? fromEmail : "noreply@memoryportal.com";
            String userEmail = user.getEmail();
            String to = userEmail != null ? userEmail : "";
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject("💫 Time to Revisit Your Memories!");
            
            String htmlContent = buildEmailContent(user, memories);
            helper.setText(htmlContent != null ? htmlContent : "", true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email notification", e);
        }
    }
    
    private String buildEmailContent(User user, List<Memory> memories) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("MMMM yyyy");
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html><head><meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background: linear-gradient(135deg, #f9a8d4, #db2777); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
        html.append(".content { background: #fdf2f8; padding: 30px; border-radius: 0 0 10px 10px; }");
        html.append(".memory-card { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; border-left: 5px solid #ec4899; }");
        html.append(".memory-title { font-size: 18px; font-weight: bold; color: #9d174d; margin-bottom: 10px; }");
        html.append(".memory-details { color: #666; font-size: 14px; }");
        html.append(".tag { display: inline-block; background: #fce7f3; color: #831843; padding: 5px 10px; border-radius: 15px; margin: 5px 5px 5px 0; font-size: 12px; }");
        html.append(".footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }");
        html.append(".button { display: inline-block; background: #db2777; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px; }");
        html.append("</style></head><body>");
        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>💫 Memory Flashback Portal</h1>");
        html.append("<p>Hello ").append(user.getName()).append("!</p>");
        html.append("</div>");
        html.append("<div class='content'>");
        html.append("<p>It's been 3 months since you uploaded some memories. Time to take a trip down memory lane! 🕰️</p>");
        
        for (Memory memory : memories) {
            html.append("<div class='memory-card'>");
            html.append("<div class='memory-title'>📸 ").append(memory.getFileName()).append("</div>");
            html.append("<div class='memory-details'>");
            html.append("<p><strong>Year:</strong> ").append(memory.getYear()).append("</p>");
            html.append("<p><strong>Mood:</strong> ").append(memory.getMood()).append("</p>");
            if (memory.getTags() != null && !memory.getTags().isEmpty()) {
                html.append("<p><strong>Tags:</strong> ");
                for (String tag : memory.getTags()) {
                    html.append("<span class='tag'>").append(tag).append("</span>");
                }
                html.append("</p>");
            }
            html.append("<p><strong>Uploaded:</strong> ").append(dateFormat.format(memory.getUploadDate())).append("</p>");
            html.append("</div></div>");
        }
        
        html.append("<div style='text-align: center;'>");
        html.append("<a href='").append(frontendUrl).append("' class='button'>View All Memories</a>");
        html.append("</div>");
        html.append("</div>");
        html.append("<div class='footer'>");
        html.append("<p>You're receiving this because you have email notifications enabled.</p>");
        html.append("<p>You can manage your notification settings in the app.</p>");
        html.append("</div>");
        html.append("</div></body></html>");
        
        return html.toString();
    }
}

