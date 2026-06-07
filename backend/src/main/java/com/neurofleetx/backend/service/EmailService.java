package com.neurofleetx.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("guardianinsur@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            System.out.println("Email sent to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    public void sendBookingNotification(String agentEmail, String clientName, String date, String time) {
        String subject = "New Appointment Request";
        String text = "Hello,\n\nYou have a new appointment request from " + clientName + " on " + date + " at " + time
                + ".\nPlease log in to your dashboard to accept or reject this request.\n\nBest,\nGuardian Insurance";
        sendEmail(agentEmail, subject, text);
    }

    public void sendStatusUpdate(String clientEmail, String status, String date, String time) {
        String subject = "Appointment Update: " + status;
        String text = "Hello,\n\nYour appointment on " + date + " at " + time + " has been " + status
                + ".\n\nBest,\nGuardian Insurance";
        sendEmail(clientEmail, subject, text);
    }
}
