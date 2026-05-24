package com.ecommerce.service;

import com.ecommerce.dto.request.CreateOrderRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.*;
import com.ecommerce.repository.*;
import com.ecommerce.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductRepository productRepository;
    @InjectMocks private OrderServiceImpl orderService;

    private User user;
    private Product product;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@test.com")
            .firstName("John").lastName("Doe").role(User.Role.CUSTOMER).build();

        product = Product.builder().id(10L).name("Widget")
            .price(new BigDecimal("29.99")).stockQuantity(100).active(true).build();
    }

    @Test
    @DisplayName("createOrder - success with sufficient stock")
    void createOrder_Success() {
        CreateOrderRequest req = buildOrderRequest(10L, 2);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenReturn(product);
        when(orderRepository.save(any())).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o = Order.builder().id(100L).user(user).status(Order.OrderStatus.CREATED)
                .totalAmount(new BigDecimal("59.98")).items(o.getItems()).build();
            return o;
        });

        OrderResponse response = orderService.createOrder(1L, req);

        assertThat(response.getStatus()).isEqualTo("CREATED");
        assertThat(response.getTotalAmount()).isEqualByComparingTo("59.98");
        assertThat(product.getStockQuantity()).isEqualTo(98); // decremented
    }

    @Test
    @DisplayName("createOrder - throws InsufficientStockException when stock is low")
    void createOrder_InsufficientStock() {
        product.setStockQuantity(1);
        CreateOrderRequest req = buildOrderRequest(10L, 5);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> orderService.createOrder(1L, req))
            .isInstanceOf(InsufficientStockException.class)
            .hasMessageContaining("Widget");
    }

    @Test
    @DisplayName("createOrder - throws UserNotFoundException for unknown user")
    void createOrder_UserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        CreateOrderRequest req = buildOrderRequest(10L, 1);

        assertThatThrownBy(() -> orderService.createOrder(99L, req))
            .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    @DisplayName("createOrder - throws ProductNotFoundException for unknown product")
    void createOrder_ProductNotFound() {
        CreateOrderRequest req = buildOrderRequest(999L, 1);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(1L, req))
            .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    @DisplayName("getOrdersByUser - returns orders sorted by creation date desc")
    void getOrdersByUser_ReturnsList() {
        Order order = Order.builder().id(1L).user(user).status(Order.OrderStatus.CONFIRMED)
            .totalAmount(new BigDecimal("100.00")).items(List.of()).build();

        when(orderRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(order));

        List<OrderResponse> orders = orderService.getOrdersByUser(1L);

        assertThat(orders).hasSize(1);
        assertThat(orders.get(0).getStatus()).isEqualTo("CONFIRMED");
    }

    @Test
    @DisplayName("updateOrderStatus - admin can change order status")
    void updateOrderStatus_Success() {
        Order order = Order.builder().id(1L).user(user).status(Order.OrderStatus.CREATED)
            .totalAmount(BigDecimal.TEN).items(List.of()).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse result = orderService.updateOrderStatus(1L, Order.OrderStatus.SHIPPED);

        assertThat(result.getStatus()).isEqualTo("SHIPPED");
    }

    private CreateOrderRequest buildOrderRequest(Long productId, int qty) {
        CreateOrderRequest.OrderItemRequest item = new CreateOrderRequest.OrderItemRequest();
        item.setProductId(productId);
        item.setQuantity(qty);
        CreateOrderRequest req = new CreateOrderRequest();
        req.setItems(List.of(item));
        req.setShippingAddress("123 Main St");
        return req;
    }
}
