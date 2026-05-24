import api from './axiosInstance';
import type { Order, CreateOrderRequest } from '../types';

export const ordersApi = {
  create: (data: CreateOrderRequest) =>
    api.post<Order>('/api/orders', data).then((r) => r.data),

  getMyOrders: () =>
    api.get<Order[]>('/api/orders').then((r) => r.data),

  getById: (id: number) =>
    api.get<Order>(`/api/orders/${id}`).then((r) => r.data),

  updateStatus: (id: number, status: string) =>
    api.put<Order>(`/api/orders/${id}/status?status=${status}`).then((r) => r.data),
};
