package com.ecommerce.service;

import com.ecommerce.dto.response.UserResponse;

public interface UserService {
    UserResponse getUserById(Long id);
    UserResponse getUserByEmail(String email);
}
