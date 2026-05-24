package com.ecommerce.controller;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.exception.ProductNotFoundException;
import com.ecommerce.exception.handler.GlobalExceptionHandler;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtService;
import com.ecommerce.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@Import(GlobalExceptionHandler.class)
class ProductControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private ProductService productService;
    @MockBean private JwtService jwtService;
    @MockBean private UserRepository userRepository;

    private ProductResponse sampleProductResponse() {
        return ProductResponse.builder()
            .id(1L).name("Test Product").price(new BigDecimal("99.99"))
            .stockQuantity(10).category("Electronics").active(true).build();
    }

    @Test
    @DisplayName("GET /api/products - returns paginated product list (public)")
    @WithMockUser
    void getAllProducts_ReturnsPage() throws Exception {
        PageImpl<ProductResponse> page = new PageImpl<>(
            List.of(sampleProductResponse()), PageRequest.of(0, 20), 1);
        when(productService.getAllProducts(any())).thenReturn(page);

        mockMvc.perform(get("/api/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].name").value("Test Product"))
            .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/products/{id} - returns product by ID")
    @WithMockUser
    void getProductById_Success() throws Exception {
        when(productService.getProductById(1L)).thenReturn(sampleProductResponse());

        mockMvc.perform(get("/api/products/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.price").value(99.99));
    }

    @Test
    @DisplayName("GET /api/products/{id} - returns 404 when not found")
    @WithMockUser
    void getProductById_NotFound() throws Exception {
        when(productService.getProductById(999L)).thenThrow(new ProductNotFoundException(999L));

        mockMvc.perform(get("/api/products/999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("POST /api/products - ADMIN can create product")
    @WithMockUser(roles = "ADMIN")
    void createProduct_AsAdmin_Success() throws Exception {
        ProductRequest req = new ProductRequest();
        req.setName("New Widget"); req.setPrice(new BigDecimal("49.99")); req.setStockQuantity(100);
        when(productService.createProduct(any())).thenReturn(sampleProductResponse());

        mockMvc.perform(post("/api/products").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("POST /api/products - CUSTOMER gets 403 Forbidden")
    @WithMockUser(roles = "CUSTOMER")
    void createProduct_AsCustomer_Forbidden() throws Exception {
        ProductRequest req = new ProductRequest();
        req.setName("Widget"); req.setPrice(new BigDecimal("9.99")); req.setStockQuantity(5);

        mockMvc.perform(post("/api/products").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/products - validation fails for missing fields")
    @WithMockUser(roles = "ADMIN")
    void createProduct_ValidationFails() throws Exception {
        ProductRequest req = new ProductRequest(); // missing required fields

        mockMvc.perform(post("/api/products").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.fieldErrors").exists());
    }
}
