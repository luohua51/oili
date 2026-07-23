import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Calendar, Plus, AlertCircle, CheckCircle, Wallet } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { transactionApi } from '@/api/client'
import type { Transaction } from '@/types'

export default function Transactions() {
  const { user, fetchUser } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const response = await transactionApi.getAll()
      setTransactions(response.data)
    } catch {
      setTransactions([])
    }
  }

  const handleAddTransaction = async () => {
    setError('')
    setSuccess('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('请输入有效的金额')
      return
    }

    if (parseFloat(amount) > (user?.balance || 0)) {
      setError('余额不足')
      return
    }

    try {
      await transactionApi.create({ amount: parseFloat(amount), description: description || '消费' })
      await fetchUser()
      await loadTransactions()
      setSuccess('消费成功')
      setAmount('')
      setDescription('')
      setTimeout(() => setShowAddModal(false), 1000)
    } catch (err: any) {
      setError(err.response?.data?.message || '消费失败')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-purple-100">
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">消费记录</h1>
              <p className="text-white/70">当前余额: {user?.balance.toFixed(2)} 元</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <span className="text-gray-600">全部消费记录</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-success flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增消费
          </button>
        </div>

        <div className="card">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-100">
                    <th className="text-left py-4 px-4 font-medium text-gray-600">时间</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">描述</th>
                    <th className="text-right py-4 px-4 font-medium text-gray-600">金额</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => {
                    const isFlow = (transaction as any).type === 'flow'
                    return (
                      <tr key={transaction.id} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                        <td className="py-4 px-4 text-gray-600">{formatDate(transaction.created_at)}</td>
                        <td className="py-4 px-4 font-medium text-gray-800">
                          <div className="flex items-center gap-2">
                            {isFlow ? (
                              <Wallet className="w-4 h-4 text-orange-500" />
                            ) : (
                              <ShoppingCart className="w-4 h-4 text-purple-500" />
                            )}
                            {transaction.description}
                            {isFlow && (
                              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">划账</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-danger font-medium">-{transaction.amount.toFixed(2)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-purple-300" />
              <p className="text-gray-500">暂无消费记录</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-lg font-bold gradient-text mb-4">新增消费</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">消费金额</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="请输入金额"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请输入备注（可选）"
                  className="input-field"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-danger bg-red-50 px-4 py-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-success bg-green-50 px-4 py-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span>{success}</span>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 btn-outline"
              >
                取消
              </button>
              <button
                onClick={handleAddTransaction}
                className="flex-1 btn-primary"
              >
                确认消费
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}