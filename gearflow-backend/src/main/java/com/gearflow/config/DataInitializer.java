package com.gearflow.config;

import com.gearflow.entity.User;
import com.gearflow.enums.Role;
import com.gearflow.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@gearflow.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFullName("GearFlow Admin");
                admin.setPhone("9999999999");
                admin.setRole(Role.ADMIN);
                admin.setActive(true);
                userRepository.save(admin);
                System.out.println("✅ Default admin user created - username: admin, password: admin123");
            }
        };
    }
}

