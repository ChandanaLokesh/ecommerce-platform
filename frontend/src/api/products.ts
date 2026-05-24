import api from './axiosInstance';
import type { Product, PageResponse } from '../types';

export const productsApi = {
  getAll: (page = 0, size = 20) =>
    api.get<PageResponse<Product>>(`/api/products?page=${page}&size=${size}`).then((r) => r.data),

  getById: (id: number) =>
    api.get<Product>(`/api/products/${id}`).then((r) => r.data),

  search: (keyword: string, page = 0) =>
    api.get<PageResponse<Product>>(`/api/products/search?keyword=${keyword}&page=${page}`).then((r) => r.data),

  create: (data: Omit<Product, 'id' | 'active' | 'createdAt'>) =>
    api.post<Product>('/api/products', data).then((r) => r.data),

  update: (id: number, data: Partial<Product>) =>
    api.put<Product>(`/api/products/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/api/products/${id}`),
};
