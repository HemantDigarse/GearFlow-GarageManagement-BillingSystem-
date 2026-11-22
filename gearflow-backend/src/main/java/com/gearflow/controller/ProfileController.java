package com.gearflow.controller;

import com.gearflow.dto.request.ChangePasswordRequest;
import com.gearflow.dto.request.GarageRequest;
import com.gearflow.dto.response.ApiResponse;
import com.gearflow.dto.response.UserResponse;
import com.gearflow.entity.Garage;
import com.gearflow.entity.User;
import com.gearflow.exception.BadRequestException;
import com.gearflow.repository.GarageRepository;
import com.gearflow.repository.UserRepository;
import com.gearflow.service.AuthService;
import com.gearflow.service.GarageDashboardService;
import com.gearflow.dto.response.GarageDashboardResponse;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final GarageRepository garageRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileController(AuthService authService, UserRepository userRepository,
                             GarageRepository garageRepository, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.garageRepository = garageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile() {
        User user = authService.getAuthenticatedUser();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("fullName", user.getFullName());
        profile.put("phone", user.getPhone());
        profile.put("role", user.getRole().name());

        garageRepository.findByOwnerId(user.getId()).ifPresent(garage -> {
            profile.put("garageId", garage.getId());
            profile.put("garageName", garage.getName());
            profile.put("garageEmail", garage.getEmail());
            profile.put("garagePhone", garage.getPhone());
            profile.put("garageAddress", garage.getAddress());
            profile.put("garageCity", garage.getCity());
            profile.put("garageState", garage.getState());
            profile.put("garageLogoUrl", garage.getLogoUrl());
        });

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<Void>> updateProfile(@RequestBody Map<String, String> body) {
        User user = authService.getAuthenticatedUser();
        if (body.containsKey("fullName")) user.setFullName(body.get("fullName"));
        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        if (body.containsKey("email")) user.setEmail(body.get("email"));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", null));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        User user = authService.getAuthenticatedUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PutMapping("/garage")
    public ResponseEntity<ApiResponse<Void>> updateGarageProfile(@RequestBody GarageRequest request) {
        Garage garage = authService.getGarageForCurrentUser();
        if (request.getName() != null) garage.setName(request.getName());
        if (request.getEmail() != null) garage.setEmail(request.getEmail());
        if (request.getPhone() != null) garage.setPhone(request.getPhone());
        if (request.getAddress() != null) garage.setAddress(request.getAddress());
        if (request.getCity() != null) garage.setCity(request.getCity());
        if (request.getState() != null) garage.setState(request.getState());
        if (request.getLogoUrl() != null) garage.setLogoUrl(request.getLogoUrl());
        garageRepository.save(garage);
        return ResponseEntity.ok(ApiResponse.success("Garage profile updated", null));
    }
}

