package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.dto.RegisterRequest;
import com.neurofleetx.backend.dto.LoginRequest;
import com.neurofleetx.backend.service.UserService;
import com.neurofleetx.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend access
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private com.neurofleetx.backend.repository.ActivityLogRepository activityLogRepository;

    @Autowired
    private org.springframework.security.authentication.AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.neurofleetx.backend.service.AvailabilityService availabilityService;

    @Autowired
    private com.neurofleetx.backend.repository.UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            // Hardcoded frontend URL for email verification link
            String siteURL = "http://localhost:3000";
            String role = request.getRole().toUpperCase();
            if ("SUPERUSER".equals(role) || "ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Global Admin role cannot be registered.");
            }
            userService.register(request, siteURL);
            // Log activity
            activityLogRepository.save(new com.neurofleetx.backend.model.ActivityLog(
                    request.getEmail(), "REGISTER", "User registered as: " + role,
                    java.time.LocalDateTime.now()));
            return ResponseEntity.ok("Registration successful! Please check your email to verify.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        System.out.println(">>> DEBUG: Login request received for user: " + request.getUsername());
        try {
            authenticationManager.authenticate(
                    new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));

            com.neurofleetx.backend.model.User user = userService.findByEmail(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            // Log activity
            activityLogRepository.save(new com.neurofleetx.backend.model.ActivityLog(
                    user.getEmail(), "LOGIN", "User logged in", java.time.LocalDateTime.now()));

            String token = jwtUtil.generateToken(user.getEmail());

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("user", user);
            response.put("token", token);

            return ResponseEntity.ok(response);
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    // Changing verify to return JSON for the frontend to consume
    @GetMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestParam("code") String code) {
        if (userService.verify(code)) {
            // Log activity (email not known directly from code without fetching, but we can
            // just log success)
            activityLogRepository.save(new com.neurofleetx.backend.model.ActivityLog(
                    "PENDING", "VERIFY_EMAIL", "Email verification successful", java.time.LocalDateTime.now()));
            return ResponseEntity.ok("Verification successful! You can now login.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Verification failed or already verified.");
        }
    }

    // --- Administration Endpoints ---

    @GetMapping("/admin/customers")
    public ResponseEntity<?> getAllCustomers() {
        return ResponseEntity.ok(userService.findAllCustomers());
    }

    @GetMapping("/admin/drivers")
    public ResponseEntity<?> getAllDrivers() {
        return ResponseEntity.ok(userService.findAllDrivers());
    }

    @GetMapping("/admin/managers")
    public ResponseEntity<?> getAllManagers() {
        return ResponseEntity.ok(userService.findAllManagers());
    }

    @GetMapping("/admin/pending-approval")
    public ResponseEntity<?> getPendingApproval() {
        // Return Drivers and Managers who are not yet approved
        java.util.List<com.neurofleetx.backend.model.User> pending = new java.util.ArrayList<>();
        pending.addAll(userService.findAllDrivers().stream().filter(u -> !u.isApproved()).toList());
        pending.addAll(userService.findAllManagers().stream().filter(u -> !u.isApproved()).toList());
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/approve-user/{id}")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        try {
            userService.approveUser(id);
            activityLogRepository.save(new com.neurofleetx.backend.model.ActivityLog(
                    "SYSTEM", "APPROVE_USER", "Approved user with ID: " + id, java.time.LocalDateTime.now()));
            return ResponseEntity.ok("User approved successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/admin/update-user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        try {
            @SuppressWarnings("null")
            com.neurofleetx.backend.model.User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            user.setFullName(body.get("fullName"));
            user.setSpecialization(body.get("specialization"));
            userRepository.save(user);

            activityLogRepository.save(new com.neurofleetx.backend.model.ActivityLog(
                    "SYSTEM", "UPDATE_USER", "Updated user details for: " + user.getEmail(),
                    java.time.LocalDateTime.now()));

            return ResponseEntity.ok("User updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // --- Password Management ---

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            userService.forgotPassword(email);
            activityLogRepository.save(new com.neurofleetx.backend.model.ActivityLog(
                    email, "FORGOT_PASSWORD", "Password reset link requested", java.time.LocalDateTime.now()));
            return ResponseEntity.ok("Password reset link sent successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token,
            @RequestBody java.util.Map<String, String> body) {
        try {
            userService.resetPassword(token, body.get("newPassword"));
            return ResponseEntity.ok("Password reset successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin/appointments")
    public ResponseEntity<?> getAllAppointments() {
        return ResponseEntity.ok(availabilityService.getAllAppointments());
    }

    @PostMapping("/admin/appointments/{id}/status")
    public ResponseEntity<?> superuserOverrideStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(availabilityService.updateAppointmentStatus(id, status, "SUPERUSER"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/admin/appointments/{id}/reassign")
    public ResponseEntity<?> superuserReassign(@PathVariable Long id, @RequestParam String newAgentEmail) {
        try {
            return ResponseEntity.ok(availabilityService.reassignClient(id, newAgentEmail));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractEmail(token.substring(7));
        return ResponseEntity
                .ok(userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found")));
    }

    @PutMapping("/update-email")
    public ResponseEntity<?> updateEmail(@RequestHeader("Authorization") String token,
            @RequestBody java.util.Map<String, String> body) {
        try {
            String email = jwtUtil.extractEmail(token.substring(7));
            com.neurofleetx.backend.model.User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            userService.updateEmail(user.getId(), body.get("newEmail"));
            return ResponseEntity.ok("Email updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String token,
            @RequestBody java.util.Map<String, String> body) {
        try {
            String email = jwtUtil.extractEmail(token.substring(7));
            com.neurofleetx.backend.model.User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            userService.updateProfile(user.getId(), body.get("fullName"), body.get("specialization"));
            return ResponseEntity.ok("Profile updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteMyAccount(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractEmail(token.substring(7));
            com.neurofleetx.backend.model.User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            userService.deleteUser(user.getId()); // Changed to pass Long ID
            return ResponseEntity.ok("Account deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/admin/user/{id}")
    public ResponseEntity<?> superuserDeleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            activityLogRepository.save(new com.neurofleetx.backend.model.ActivityLog(
                    "SUPERUSER", "DELETE_USER", "Deleted user with ID: " + id, java.time.LocalDateTime.now()));
            return ResponseEntity.ok("User deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
