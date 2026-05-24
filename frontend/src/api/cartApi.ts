import api from './axiosInstance';
import { Cart } from '../types';

export const getCart = () => api.get<Cart>('/cart');

export const addToCart = (productId: number, quantity: number) =>
  api.post<Cart>('/cart/items', { productId, quantity });

export const updateCartItem = (itemId: number, quantity: number) =>
  api.put<Cart>(`/cart/items/${itemId}?quantity=${quantity}`);

export const removeCartItem = (itemId: number) =>
  api.delete<Cart>(`/cart/items/${itemId}`);

export const clearCart = () => api.delete('/cart');
