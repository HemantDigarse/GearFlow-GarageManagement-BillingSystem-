package com.gearflow.service;

import com.gearflow.dto.request.LoginRequest;
import com.gearflow.dto.request.RegisterRequest;
import com.gearflow.dto.response.AuthResponse;
import com.gearflow.dto.response.UserResponse;
import com.gearflow.entity.Garage;
import com.gearflow.entity.User;
import com.gearflow.enums.GarageStatus;
import com.gearflow.enums.Role;
import com.gearflow.exception.BadRequestException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.GarageRepository;
import com.gearflow.repository.UserRepository;
import com.gearflow.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final GarageRepository garageRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, GarageRepository garageRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.garageRepository = garageRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isActive()) {
            throw new BadRequestException("Account is deactivated. Contact administrator.");
        }

        if (user.getRole() == Role.GARAGE_OWNER) {
            Garage garage = garageRepository.findByOwnerId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Garage not found for this account"));
            if (garage.getStatus() == GarageStatus.PENDING) {
                throw new BadRequestException("Your garage registration is waiting for admin approval.");
            }
            if (garage.getStatus() == GarageStatus.INACTIVE) {
                throw new BadRequestException("Your garage is inactive. Contact the administrator.");
            }
        }

        String token = jwtUtil.generateToken(user.getUsername());

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());

        if (user.getRole() == Role.GARAGE_OWNER) {
            garageRepository.findByOwnerId(user.getId()).ifPresent(garage -> {
                response.setGarageId(garage.getId());
                response.setGarageName(garage.getName());
            });
        }

        return response;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Role.GARAGE_OWNER);
        user.setActive(true);
        userRepository.save(user);

        Garage garage = new Garage();
        garage.setName(request.getGarageName() != null ? request.getGarageName() : request.getFullName() + "'s Garage");
        garage.setOwner(user);
        garage.setEmail(request.getGarageEmail() != null ? request.getGarageEmail() : request.getEmail());
        garage.setPhone(request.getGaragePhone() != null ? request.getGaragePhone() : request.getPhone());
        garage.setAddress(request.getGarageAddress());
        garage.setCity(request.getGarageCity());
        garage.setState(request.getGarageState());
        garage.setStatus(GarageStatus.PENDING);
        garageRepository.save(garage);
    }

    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().name());
        response.setActive(user.isActive());

        if (user.getRole() == Role.GARAGE_OWNER) {
            garageRepository.findByOwnerId(user.getId()).ifPresent(garage -> {
                response.setGarageName(garage.getName());
                response.setGarageId(garage.getId());
            });
        }

        return response;
    }

    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public Garage getGarageForCurrentUser() {
        User user = getAuthenticatedUser();
        return garageRepository.findByOwnerId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Garage not found for current user"));
    }
}

