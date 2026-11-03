package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.UserDeliveryRequest;
import com.example.ecomerce_backend.model.dto.response.UserDeliveryResponse;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.model.entity.UserDelivery;
import com.example.ecomerce_backend.model.mapper.UserMapper;
import com.example.ecomerce_backend.repository.UserDeliveryRepository;
import com.example.ecomerce_backend.security.principal.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDeliveryService {
    private final UserDeliveryRepository userDeliveryRepository;
    private final UserMapper userMapper;

    public List<UserDeliveryResponse> findAll(Integer currentPage, Integer pageSize) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(currentPage - 1, pageSize, sort);
        Page<UserDelivery> userDeliveryResponses = userDeliveryRepository.findByUser(user, pageable);
        return userDeliveryResponses.map(userMapper::toUserDeliveryResponse).toList();
    }

    public UserDeliveryResponse createUserDelivery(UserDeliveryRequest request) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipal.getUser();
        UserDelivery userDelivery = UserDelivery.builder()
                .user(user)
                .address(request.address())
                .phoneNumber(request.phoneNumber())
                .build();
        userDelivery = userDeliveryRepository.save(userDelivery);
        return userMapper.toUserDeliveryResponse(userDelivery);
    }

    public UserDeliveryResponse updateUserDelivery(Long id, UserDeliveryRequest request) {
        UserDelivery userDelivery = userDeliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ nhận hàng không tồn tại"));
        userDelivery.setAddress(request.address());
        userDelivery.setPhoneNumber(request.phoneNumber());
        userDelivery = userDeliveryRepository.save(userDelivery);
        return userMapper.toUserDeliveryResponse(userDelivery);
    }

    public void deleteUserDelivery(Long id) {
        UserDelivery userDelivery = userDeliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ nhận hàng không tồn tại"));
        userDelivery.setIsDeleted(true);
        userDeliveryRepository.save(userDelivery);
    }
}