import axios from 'axios'
import type { User, Transaction, Flow, LoginRequest, RechargeRequest, TransferRequest, DeductRequest } from '@/types'

const client = axios.create({
  baseURL: '/api',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (data: LoginRequest) => client.post('/auth/login', data),
  register: (data: { username: string; password: string; name: string; phone?: string; email?: string }) =>
    client.post<LoginResponse>('/auth/register', data),
  getMe: () => client.get<User>('/auth/me'),
}

export const memberApi = {
  getAll: () => client.get<User[]>('/members'),
  getById: (id: number) => client.get<User>(`/members/${id}`),
  create: (data: { username: string; password: string; name: string; phone?: string }) =>
    client.post<User>('/members', data),
  update: (id: number, data: { name: string; phone?: string }) =>
    client.put<User>(`/members/${id}`, data),
  delete: (id: number) => client.delete(`/members/${id}`),
}

export const transactionApi = {
  getAll: (userId?: number) =>
    client.get<Transaction[]>('/transactions', { params: userId ? { userId } : {} }),
  create: (data: { amount: number; description?: string }) =>
    client.post<Transaction>('/transactions', data),
}

export const flowApi = {
  getAll: () => client.get<Flow[]>('/flows'),
  recharge: (data: RechargeRequest) => client.post<Flow>('/flows/recharge', data),
  transfer: (data: TransferRequest) => client.post<Flow>('/flows/transfer', data),
  deduct: (data: DeductRequest) => client.post<Flow>('/flows/deduct', data),
}