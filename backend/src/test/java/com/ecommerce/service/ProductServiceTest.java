package com.ecommerce.service;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.ProductNotFoundException;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @InjectMocks private ProductServiceImpl productService;

    private Product sampleProduct;
    private ProductRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleProduct = Product.builder()
            .id(1L).name("Laptop Pro").description("High-end laptop")
            .price(new BigDecimal("1299.99")).stockQuantity(50)
            .category("Electronics").active(true).build();

        sampleRequest = new ProductRequest();
        sampleRequest.setName("Laptop Pro");
        sampleRequest.setDescription("High-end laptop");
        sampleRequest.setPrice(new BigDecimal("1299.99"));
        sampleRequest.setStockQuantity(50);
        sampleRequest.setCategory("Electronics");
    }

    @Test
    @DisplayName("createProduct - should save and return product")
    void createProduct_Success() {
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.createProduct(sampleRequest);

        assertThat(response.getName()).isEqualTo("Laptop Pro");
        assertThat(response.getPrice()).isEqualByComparingTo("1299.99");
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("getProductById - should return product when found")
    void getProductById_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        ProductResponse response = productService.getProductById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Laptop Pro");
    }

    @Test
    @DisplayName("getProductById - should throw ProductNotFoundException when not found")
    void getProductById_NotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(99L))
            .isInstanceOf(ProductNotFoundException.class)
            .hasMessageContaining("99");
    }

    @Test
    @DisplayName("updateProduct - should update and return modified product")
    void updateProduct_Success() {
        ProductRequest updateRequest = new ProductRequest();
        updateRequest.setName("Laptop Pro 2");
        updateRequest.setPrice(new BigDecimal("1499.99"));
        updateRequest.setStockQuantity(30);

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse response = productService.updateProduct(1L, updateRequest);

        assertThat(response.getName()).isEqualTo("Laptop Pro 2");
        assertThat(response.getPrice()).isEqualByComparingTo("1499.99");
    }

    @Test
    @DisplayName("deleteProduct - should soft-delete by setting active=false")
    void deleteProduct_SoftDelete() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any())).thenReturn(sampleProduct);

        productService.deleteProduct(1L);

        assertThat(sampleProduct.isActive()).isFalse();
        verify(productRepository).save(sampleProduct);
    }

    @Test
    @DisplayName("deleteProduct - should throw when product not found")
    void deleteProduct_NotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.deleteProduct(999L))
            .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    @DisplayName("getAllProducts - should return paginated active products")
    void getAllProducts_Paginated() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Product> page = new PageImpl<>(List.of(sampleProduct), pageable, 1);
        when(productRepository.findByActiveTrue(pageable)).thenReturn(page);

        Page<ProductResponse> result = productService.getAllProducts(pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Laptop Pro");
    }

    @Test
    @DisplayName("hasStock - product correctly reports stock availability")
    void productHasStock() {
        assertThat(sampleProduct.hasStock(50)).isTrue();
        assertThat(sampleProduct.hasStock(51)).isFalse();
    }
}
