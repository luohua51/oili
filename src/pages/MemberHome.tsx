import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, ShoppingCart, ArrowRight, RefreshCw, User } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { transactionApi } from '@/api/client'
import type { Transaction } from '@/types'

export default function MemberHome() {
  const { user, logout, fetchUser } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const response = await transactionApi.getAll()
      setTransactions(response.data.slice(0, 3))
    } catch {
      setTransactions([])
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchUser()
    await loadTransactions()
    setIsRefreshing(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-purple-100">
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">会员中心</h1>
                <p className="text-white/70">{user?.name}</p>
              </div>
            </div>
            <button onClick={logout} className="text-white/70 hover:text-white transition-colors">
              退出登录
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card bg-gradient-to-br from-primary to-purple-700 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/70">当前余额</span>
                  <button onClick={handleRefresh} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{user?.balance.toFixed(2)}</span>
                  <span className="text-white/70">元</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => navigate('/transactions')}
                className="card flex items-center gap-4 hover:cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">消费记录</p>
                  <p className="text-sm text-gray-500">查看详细消费</p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 ml-auto" />
              </button>

              <div className="card flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">账户信息</p>
                  <p className="text-sm text-gray-500">查看个人资料</p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 ml-auto" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">最近消费</h2>
              <button onClick={() => navigate('/transactions')} className="text-sm text-primary hover:underline">
                查看全部
              </button>
            </div>
            
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-purple-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                    </div>
                    <span className="text-danger font-medium">-{transaction.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无消费记录</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}