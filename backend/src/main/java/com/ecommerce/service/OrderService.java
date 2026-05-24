package com.ecommerce.service;

import com.ecommerce.dto.request.CreateOrderRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.Order;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(Long userId, CreateOrderRequest request);
    List<OrderResponse> getOrdersByUser(Long userId);
    OrderResponse getOrderById(Long orderId, Long userId);
    OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus status);
}
