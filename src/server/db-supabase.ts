import { supabase } from './supabase'
import type { User, Transaction, Flow } from './types'

export const dbGet = async <T>(table: string, query: { [key: string]: any }): Promise<T | null> => {
  const { data, error } = await supabase.from(table).select('*').match(query).single()
  if (error) return null
  return data as T | null
}

export const dbAll = async <T>(table: string, query?: { [key: string]: any }, options?: { orderBy?: string; order?: 'asc' | 'desc' }): Promise<T[]> => {
  let queryBuilder = supabase.from(table).select('*')
  
  if (query) {
    queryBuilder = queryBuilder.match(query)
  }
  
  if (options?.orderBy) {
    queryBuilder = queryBuilder.order(options.orderBy, { ascending: options.order === 'asc' })
  }
  
  const { data, error } = await queryBuilder
  if (error) return []
  return data as T[]
}

export const dbInsert = async <T>(table: string, data: Partial<T>): Promise<T | null> => {
  const { data: result, error } = await supabase.from(table).insert(data as any).select().single()
  if (error) return null
  return result as T | null
}

export const dbUpdate = async <T>(table: string, id: number, data: Partial<T>): Promise<T | null> => {
  const { data: result, error } = await supabase.from(table).update(data as any).eq('id', id).select().single()
  if (error) return null
  return result as T | null
}

export const dbDelete = async (table: string, id: number): Promise<boolean> => {
  const { error } = await supabase.from(table).delete().eq('id', id)
  return !error
}

export const dbExecute = async (sql: string, params?: any[]): Promise<any> => {
  const { data, error } = await supabase.rpc('execute_sql', { sql, params })
  if (error) throw error
  return data
}

export const getUserByUsername = async (username: string): Promise<User | null> => {
  return dbGet<User>('users', { username })
}

export const getUserById = async (id: number): Promise<User | null> => {
  return dbGet<User>('users', { id })
}

export const getAllMembers = async (): Promise<User[]> => {
  return dbAll<User>('users', { role: 'member' }, { orderBy: 'created_at', order: 'desc' })
}

export const createUser = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> => {
  return dbInsert<User>('users', user)
}

export const updateUser = async (id: number, data: Partial<User>): Promise<User | null> => {
  return dbUpdate<User>('users', id, data)
}

export const deleteUser = async (id: number): Promise<boolean> => {
  return dbDelete('users', id)
}

export const getAllTransactions = async (userId?: number): Promise<Transaction[]> => {
  if (userId) {
    return dbAll<Transaction>('transactions', { user_id: userId }, { orderBy: 'created_at', order: 'desc' })
  }
  return dbAll<Transaction>('transactions', undefined, { orderBy: 'created_at', order: 'desc' })
}

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> => {
  return dbInsert<Transaction>('transactions', transaction)
}

export const getAllFlows = async (): Promise<Flow[]> => {
  const { data, error } = await supabase
    .from('flows')
    .select(`
      *,
      from_user:from_user_id(id, name),
      to_user:to_user_id(id, name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) return []
  
  return data.map((flow: any) => ({
    ...flow,
    from_user_name: flow.from_user?.name,
    to_user_name: flow.to_user?.name,
  })) as Flow[]
}

export const createFlow = async (flow: Omit<Flow, 'id' | 'created_at'>): Promise<Flow | null> => {
  return dbInsert<Flow>('flows', flow)
}

export const updateBalance = async (userId: number, amount: number): Promise<User | null> => {
  const { data, error } = await supabase.rpc('update_balance', { user_id: userId, amount })
  if (error) return null
  return data as User | null
}