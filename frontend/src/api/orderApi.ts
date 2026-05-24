import api from './axiosInstance';
import { Order } from '../types';

export const createOrder = (data: {
  items: { productId: number; quantity: number }[];
  shippingAddress: string;
}) => api.post<Order>('/orders', data);

export const getMyOrders = () => api.get<Order[]>('/orders');

export const getOrderById = (id: number) => api.get<Order>(`/orders/${id}`);

export const updateOrderStatus = (id: number, status: string) =>
  api.put<Order>(`/orders/${id}/status?status=${status}`);
