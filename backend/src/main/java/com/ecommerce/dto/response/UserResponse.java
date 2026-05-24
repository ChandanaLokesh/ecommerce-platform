package com.ecommerce.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    private String createdAt;
}
