package com.ecommerce.service.impl;

import com.ecommerce.dto.request.CreateOrderRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.*;
import com.ecommerce.repository.*;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        Order order = Order.builder()
            .user(user)
            .shippingAddress(request.getShippingAddress())
            .status(Order.OrderStatus.CREATED)
            .totalAmount(BigDecimal.ZERO)
            .build();

        BigDecimal total = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(itemReq.getProductId()));

            if (!product.hasStock(itemReq.getQuantity())) {
                throw new InsufficientStockException(product.getName(), itemReq.getQuantity(), product.getStockQuantity());
            }

            OrderItem item = OrderItem.builder()
                .product(product)
                .quantity(itemReq.getQuantity())
                .unitPrice(product.getPrice())
                .build();

            order.addItem(item);
            product.decrementStock(itemReq.getQuantity());
            productRepository.save(product);

            total = total.add(item.getSubtotal());
        }

        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);
        log.info("Order created: id={}, user={}, total={}", saved.getId(), userId, total);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        return toResponse(order);
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
            .map(item -> OrderResponse.OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build())
            .collect(Collectors.toList());

        return OrderResponse.builder()
            .id(order.getId())
            .userId(order.getUser().getId())
            .status(order.getStatus().name())
            .totalAmount(order.getTotalAmount())
            .shippingAddress(order.getShippingAddress())
            .items(items)
            .createdAt(order.getCreatedAt() != null ? order.getCreatedAt().toString() : null)
            .updatedAt(order.getUpdatedAt() != null ? order.getUpdatedAt().toString() : null)
            .build();
    }
}
