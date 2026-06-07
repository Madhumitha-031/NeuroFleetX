package com.neurofleetx.backend.repository;

import com.neurofleetx.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);

    List<Notification> findByRecipientEmailAndIsReadFalse(String recipientEmail);
}
