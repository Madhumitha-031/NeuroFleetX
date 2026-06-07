package com.neurofleetx.backend.config;

import com.neurofleetx.backend.model.User;
import com.neurofleetx.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.neurofleetx.backend.service.VehicleService vehicleService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println(">>> DEBUG: DataSeeder starting...");

        // Seed Vehicles First (so they can be assigned if needed)
        vehicleService.seedFleet();
        // 1. Seed Static Superuser (Admin)
        System.out.println(">>> DEBUG: Checking for existing admin...");
        if (userRepository.findByEmail("admin").isEmpty()) {
            System.out.println(">>> DEBUG: Seeding static admin...");
            User admin = new User();
            admin.setEmail("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("SUPERUSER");
            admin.setEnabled(true);
            admin.setApproved(true);
            admin.setFullName("Platform Administrator");
            userRepository.save(admin);
            System.out.println(">>> Static Admin (Superuser) seeded: admin / admin123");
        }

        // 2. Seed Dummy Data for Verification if empty
        if (userRepository.count() <= 1) { // Only if just the admin exists or it's empty
            seedDummyUsers();
        }
    }

    private void seedDummyUsers() {
        // Dummy Manager
        createUser("manager1@neurofleetx.com", "manager123", "MANAGER", "Regional Manager - North");

        // Dummy Driver
        createUser("driver1@neurofleetx.com", "driver123", "DRIVER", "Logistics Unit Alpha");

        // Dummy Customer
        createUser("customer1@neurofleetx.com", "customer123", "CUSTOMER", "Fleet Partner Global");

        System.out.println(">>> Dummy operational data seeded for verification.");
    }

    private void createUser(String email, String password, String role, String fullName) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEnabled(true);
        user.setApproved(true);
        user.setFullName(fullName);
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
