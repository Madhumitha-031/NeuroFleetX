package com.neurofleetx.backend.service;

import com.neurofleetx.backend.dto.RegisterRequest;
import com.neurofleetx.backend.model.User;
import com.neurofleetx.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.neurofleetx.backend.repository.AppointmentRepository appointmentRepository;

    @Autowired
    private com.neurofleetx.backend.repository.AgentAvailabilityRepository availabilityRepository;

    @Autowired
    private com.neurofleetx.backend.repository.UserDocumentRepository documentRepository;

    @Autowired
    private JavaMailSender mailSender;

    public void register(RegisterRequest request, String siteURL) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        String role = request.getRole().toUpperCase();
        user.setRole(role);
        user.setVerificationCode(UUID.randomUUID().toString());
        user.setEnabled(false);

        // Logic: DRIVER and MANAGER need approval. CUSTOMER and SUPERUSER do not.
        if ("DRIVER".equals(role) || "MANAGER".equals(role)) {
            user.setApproved(false); // Drivers & Managers need approval
        } else {
            user.setApproved(true); // Customers are auto-approved for login
        }

        userRepository.save(user);

        sendVerificationEmail(user, siteURL);
    }

    private void sendVerificationEmail(User user, String siteURL) {
        String verifyURL = siteURL + "/verify?code=" + user.getVerificationCode();

        System.out.println("------------------------------------------------");
        System.out.println("Sending Email to: " + user.getEmail());
        System.out.println("Verification Link: " + verifyURL);
        System.out.println("------------------------------------------------");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ops@neurofleetx.com");
            message.setTo(user.getEmail());
            message.setSubject("NeuroFleetX - Verify your Fleet Identity");
            message.setText(
                    "Welcome to NeuroFleetX! \n\nPlease click the link to verify your operator account: \n"
                            + verifyURL);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Could not send email: " + e.getMessage());
        }
    }

    public boolean verify(String verificationCode) {
        User user = userRepository.findByVerificationCode(verificationCode).orElse(null);

        if (user == null || user.isEnabled()) {
            return false;
        } else {
            user.setVerificationCode(null);
            user.setEnabled(true);
            userRepository.save(user);
            return true;
        }
    }

    // Helper methods for System Administration
    public java.util.List<User> findAllCustomers() {
        return userRepository.findAll().stream()
                .filter(u -> "CUSTOMER".equals(u.getRole()))
                .toList();
    }

    public java.util.List<User> findAllDrivers() {
        return userRepository.findAll().stream()
                .filter(u -> "DRIVER".equals(u.getRole()))
                .toList();
    }

    public java.util.List<User> findAllManagers() {
        return userRepository.findAll().stream()
                .filter(u -> "MANAGER".equals(u.getRole()))
                .toList();
    }

    @SuppressWarnings("null")
    public void approveUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setApproved(true);
        userRepository.save(user);
    }

    public java.util.Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerificationCode(UUID.randomUUID().toString());
        userRepository.save(user);

        String resetURL = "http://localhost:3000/reset-password?token=" + user.getVerificationCode();

        System.out.println("--- PASSWORD RESET ---");
        System.out.println("Email: " + email);
        System.out.println("Reset Link: " + resetURL);
        System.out.println("----------------------");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ops@neurofleetx.com");
            message.setTo(user.getEmail());
            message.setSubject("NeuroFleetX - Password Rotation Request");
            message.setText("Click the link to rotate your fleet password: \n" + resetURL);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Could not send reset email: " + e.getMessage());
        }
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByVerificationCode(token)
                .orElseThrow(() -> new RuntimeException("Invalid Token"));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerificationCode(null);
        userRepository.save(user);
    }

    @SuppressWarnings("null")
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        java.util.List<com.neurofleetx.backend.model.UserDocument> docs = documentRepository
                .findByUser_Id(user.getId());
        documentRepository.deleteAll(docs);

        if ("CUSTOMER".equals(user.getRole())) {
            java.util.List<com.neurofleetx.backend.model.Appointment> clientAppts = appointmentRepository
                    .findByClient_Id(user.getId());
            appointmentRepository.deleteAll(clientAppts);
        } else if ("DRIVER".equals(user.getRole())) {
            java.util.List<com.neurofleetx.backend.model.Appointment> agentAppts = appointmentRepository
                    .findByAgent(user);
            appointmentRepository.deleteAll(agentAppts);

            java.util.List<com.neurofleetx.backend.model.AgentAvailability> slots = availabilityRepository
                    .findByAgent_Id(user.getId());
            availabilityRepository.deleteAll(slots);
        }
        userRepository.delete(user);
    }

    @SuppressWarnings("null")
    public void updateEmail(Long userId, String newEmail) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (userRepository.findByEmail(newEmail).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        user.setEmail(newEmail);
        userRepository.save(user);
    }

    @SuppressWarnings("null")
    public void updateProfile(Long userId, String fullName, String specialization) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (fullName != null && !fullName.isEmpty()) {
            user.setFullName(fullName);
        }
        if ("DRIVER".equals(user.getRole()) && specialization != null) {
            user.setSpecialization(specialization);
        }
        userRepository.save(user);
    }
}
