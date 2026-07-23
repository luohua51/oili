export interface User {
  id: number
  username: string
  name: string
  phone: string
  email: string
  balance: number
  role: 'member' | 'admin'
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  user_id: number
  amount: number
  description: string
  created_at: string
}

export interface Flow {
  id: number
  from_user_id: number | null
  to_user_id: number | null
  amount: number
  type: 'recharge' | 'transfer' | 'consume'
  description: string
  created_at: string
  from_user_name?: string
  to_user_name?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RechargeRequest {
  userId: number
  amount: number
  description?: string
}

export interface TransferRequest {
  fromUserId: number
  toUserId: number
  amount: number
  description?: string
}

export interface DeductRequest {
  userId: number
  amount: number
  description?: string
}