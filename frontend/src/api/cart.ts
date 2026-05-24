import api from './axiosInstance';
import type { Cart } from '../types';

export const cartApi = {
  getCart: () =>
    api.get<Cart>('/api/cart').then((r) => r.data),

  addItem: (productId: number, quantity: number) =>
    api.post<Cart>('/api/cart/items', { productId, quantity }).then((r) => r.data),

  updateItem: (itemId: number, quantity: number) =>
    api.put<Cart>(`/api/cart/items/${itemId}?quantity=${quantity}`).then((r) => r.data),

  removeItem: (itemId: number) =>
    api.delete<Cart>(`/api/cart/items/${itemId}`).then((r) => r.data),

  clearCart: () =>
    api.delete('/api/cart'),
};
