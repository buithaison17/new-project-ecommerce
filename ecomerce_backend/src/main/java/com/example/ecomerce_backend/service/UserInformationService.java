package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.constants.Gender;
import com.example.ecomerce_backend.exception.ResourceExistedException;
import com.example.ecomerce_backend.model.dto.request.UserChangeInformationRequest;
import com.example.ecomerce_backend.model.dto.response.UserRegisterResponse;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.model.entity.UserInformation;
import com.example.ecomerce_backend.model.mapper.UserMapper;
import com.example.ecomerce_backend.repository.UserInformationRepository;
import com.example.ecomerce_backend.repository.UserRepository;
import com.example.ecomerce_backend.security.principal.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UserInformationService {
    private final UserInformationRepository userInformationRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final UserMapper userMapper;

    @Transactional
    public UserRegisterResponse changeInformation(UserChangeInformationRequest request) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        UserInformation userInformation = userInformationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NoSuchElementException("User information not found"));
        if (userRepository.existsByEmailAndIdNot(request.email(), user.getId())) {
            throw new ResourceExistedException("Email đã tồn tại");
        }
        if (request.email() != null && !request.email().isBlank()) {
            user.setEmail(request.email());
        }
        if (request.fullName() != null && !request.fullName().isBlank()) {
            userInformation.setFullName(request.fullName());
        }
        if (request.avatarUrl() != null) {
            String avatar = fileStorageService.storeImage(request.avatarUrl());
            userInformation.setAvatarUrl(avatar);
        }
        if (request.dateOfBirth() != null) {
            userInformation.setDateOfBirth(request.dateOfBirth());
        }
        if (request.gender() != null) {
            userInformation.setGender(Gender.valueOf(request.gender()));
        }

        user = userRepository.save(user);
        userInformation = userInformationRepository.save(userInformation);
        return userMapper.mapToUserRegisterResponse(user, userInformation);
    }
}