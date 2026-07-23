import { create } from 'zustand'
import type { User } from '@/types'
import { authApi } from '@/api/client'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, name: string, phone?: string, email?: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true })
    try {
      const response = await authApi.login({ username, password })
      const { user, token } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, token, isLoading: false })
    } catch (error: any) {
      set({ isLoading: false })
      const errorMsg = error.response?.data?.message || error.message || '登录失败'
      throw new Error(errorMsg)
    }
  },

  register: async (username, password, name, phone, email) => {
    set({ isLoading: true })
    try {
      const response = await authApi.register({ username, password, name, phone, email })
      const { user, token } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, token, isLoading: false })
    } catch (error: any) {
      set({ isLoading: false })
      throw new Error(error.response?.data?.message || '注册失败')
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  fetchUser: async () => {
    try {
      const response = await authApi.getMe()
      const user = response.data
      localStorage.setItem('user', JSON.stringify(user))
      set({ user })
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ user: null, token: null })
    }
  },
}))