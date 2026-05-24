import api from './axiosInstance';
import { AuthResponse } from '../types';

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password });

export const register = (data: {
  firstName: string; lastName: string;
  email: string; password: string; phone?: string;
}) => api.post<AuthResponse>('/auth/register', data);
