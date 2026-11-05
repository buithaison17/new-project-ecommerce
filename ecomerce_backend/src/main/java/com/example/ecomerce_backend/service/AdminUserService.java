package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.exception.ResourceExistedException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.CreateAdminRequest;
import com.example.ecomerce_backend.model.dto.response.AdminUserResponse;
import com.example.ecomerce_backend.model.dto.response.PageResponse;
import com.example.ecomerce_backend.model.entity.Role;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.repository.RoleRepository;
import com.example.ecomerce_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public PageResponse<AdminUserResponse> getUsers(String keyword, String roleName, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<User> userPage = userRepository.searchUsers(keyword, roleName, pageable);

        return PageResponse.from(userPage, this::toAdminUserResponse);
    }

    @Transactional
    public AdminUserResponse createAdmin(CreateAdminRequest request) {
        if (userRepository.existsByEmailOrUsername(request.email(), request.username())) {
            throw new ResourceExistedException("Email hoặc username đã tồn tại");
        }

        Role role = roleRepository.findByName(request.role())
                .orElseThrow(() -> new ResourceNotFoundException("Role không tồn tại: " + request.role()));

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(role)
                .isEnabled(true)
                .build();

        user = userRepository.save(user);
        return toAdminUserResponse(user);
    }

    @Transactional
    public void blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setIsEnabled(false);
        userRepository.save(user);
    }

    @Transactional
    public void unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setIsEnabled(true);
        userRepository.save(user);
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().getName(),
                user.getIsEnabled(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}