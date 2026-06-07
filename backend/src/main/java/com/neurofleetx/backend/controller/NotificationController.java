package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.model.Notification;
import com.neurofleetx.backend.repository.NotificationRepository;
import com.neurofleetx.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractEmail(token.substring(7));
        return ResponseEntity.ok(notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email));
    }

    @PutMapping("/{id}/read")
    @SuppressWarnings("null")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllRead(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractEmail(token.substring(7));
        List<Notification> notifs = notificationRepository.findByRecipientEmailAndIsReadFalse(email);
        notifs.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifs);
        return ResponseEntity.ok().build();
    }
}
