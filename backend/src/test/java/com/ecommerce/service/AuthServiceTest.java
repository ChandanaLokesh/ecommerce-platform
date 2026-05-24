package com.ecommerce.service;

import com.ecommerce.dto.request.LoginRequest;
import com.ecommerce.dto.request.RegisterRequest;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.entity.User;
import com.ecommerce.exception.InvalidCredentialsException;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtService;
import com.ecommerce.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserDetailsService userDetailsService;
    @InjectMocks private AuthServiceImpl authService;

    private RegisterRequest registerRequest;
    private User savedUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("john@test.com");
        registerRequest.setPassword("secret123");
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");

        savedUser = User.builder()
            .id(1L).email("john@test.com").firstName("John")
            .lastName("Doe").role(User.Role.CUSTOMER).enabled(true).build();
    }

    @Test
    @DisplayName("register - success for new user")
    void register_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        UserDetails ud = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(ud);
        when(jwtService.generateToken(ud)).thenReturn("jwt.token.here");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response.getToken()).isEqualTo("jwt.token.here");
        assertThat(response.getEmail()).isEqualTo("john@test.com");
        assertThat(response.getRole()).isEqualTo("CUSTOMER");
    }

    @Test
    @DisplayName("register - throws when email already taken")
    void register_EmailTaken() {
        when(userRepository.existsByEmail("john@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Email already registered");
    }

    @Test
    @DisplayName("login - success with valid credentials")
    void login_Success() {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("john@test.com");
        loginReq.setPassword("secret123");

        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(savedUser));
        UserDetails ud = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername("john@test.com")).thenReturn(ud);
        when(jwtService.generateToken(ud)).thenReturn("valid.jwt");

        AuthResponse response = authService.login(loginReq);

        assertThat(response.getToken()).isEqualTo("valid.jwt");
    }

    @Test
    @DisplayName("login - throws InvalidCredentialsException for bad credentials")
    void login_InvalidCredentials() {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("john@test.com");
        loginReq.setPassword("wrong");

        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginReq))
            .isInstanceOf(InvalidCredentialsException.class);
    }
}
