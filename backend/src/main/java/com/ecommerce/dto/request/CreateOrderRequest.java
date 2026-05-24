package com.ecommerce.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequest> items;

    private String shippingAddress;

    @Data
    public static class OrderItemRequest {
        @NotNull private Long productId;
        @Min(1) private Integer quantity;
    }
}
