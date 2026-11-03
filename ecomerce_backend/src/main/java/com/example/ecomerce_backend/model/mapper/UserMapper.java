package com.example.ecomerce_backend.model.mapper;

import com.example.ecomerce_backend.model.dto.response.*;
import com.example.ecomerce_backend.model.entity.User;
import com.example.ecomerce_backend.model.entity.UserDelivery;
import com.example.ecomerce_backend.model.entity.UserInformation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(source = "role.name", target = "role")
    UserResponse toUserResponse(User user);

    UserInformationResponse toUserInformationResponse(UserInformation userInformation);

    @Mapping(source = "user", target = "user")
    @Mapping(source = "userInformation", target = "userInformation")
    UserRegisterResponse mapToUserRegisterResponse(User user, UserInformation userInformation);

    UserDeliveryResponse toUserDeliveryResponse(UserDelivery userDelivery);

    List<UserDeliveryResponse> toUserDeliveryResponseList(List<UserDelivery> userDeliveries);

    @Mapping(source = "user.id", target = "id")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.role.name", target = "role")
    @Mapping(source = "userInformation.fullName", target = "fullName")
    @Mapping(source = "userInformation.avatarUrl", target = "avatarUrl")
    @Mapping(source = "userInformation.dateOfBirth", target = "dateOfBirth")
    AuthenticatedUserResponse toAuthenticatedUserResponse(User user, UserInformation userInformation);
}