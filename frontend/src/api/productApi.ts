import api from './axiosInstance';
import { Product, Page } from '../types';

export const getProducts = (page = 0, size = 20) =>
  api.get<Page<Product>>(`/products?page=${page}&size=${size}`);

export const getProductById = (id: number) =>
  api.get<Product>(`/products/${id}`);

export const searchProducts = (keyword: string, page = 0) =>
  api.get<Page<Product>>(`/products/search?keyword=${keyword}&page=${page}`);

export const createProduct = (data: Partial<Product>) =>
  api.post<Product>('/products', data);

export const updateProduct = (id: number, data: Partial<Product>) =>
  api.put<Product>(`/products/${id}`, data);

export const deleteProduct = (id: number) =>
  api.delete(`/products/${id}`);
