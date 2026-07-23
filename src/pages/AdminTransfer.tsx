import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, User, Wallet, AlertCircle, CheckCircle, LogOut, MinusCircle } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { memberApi, flowApi } from '@/api/client'
import type { User as UserType } from '@/types'

export default function AdminTransfer() {
  const { logout } = useAuthStore()
  const [members, setMembers] = useState<UserType[]>([])
  const [userId, setUserId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      const response = await memberApi.getAll()
      setMembers(response.data)
    } catch {
      setMembers([])
    }
  }

  const handleDeduct = async () => {
    setError('')
    setSuccess('')

    if (!userId) {
      setError('请选择要扣除的会员')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('请输入有效的金额')
      return
    }

    const member = members.find(m => m.id === userId)
    if (member && member.balance < parseFloat(amount)) {
      setError('会员余额不足')
      return
    }

    try {
      await flowApi.deduct({ userId, amount: parseFloat(amount), description: description || '划账扣除' })
      setSuccess('划账扣除成功')
      setAmount('')
      setDescription('')
      setUserId(null)
      await loadMembers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || '划账扣除失败')
    }
  }

  const getMemberName = (id: number | null) => {
    const member = members.find(m => m.id === id)
    return member?.name || ''
  }

  const getMemberBalance = (id: number | null) => {
    const member = members.find(m => m.id === id)
    return member?.balance || 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-purple-100">
      <div className="flex">
        <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-purple-100 min-h-screen fixed left-0 top-0 shadow-sm">
          <div className="p-6 border-b border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                <User className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold gradient-text">管理后台</span>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <div className="nav-item" onClick={() => navigate('/admin')}>
              <Users className="w-5 h-5" />
              <span>数据概览</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/admin/members')}>
              <Users className="w-5 h-5" />
              <span>会员管理</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/admin/recharge')}>
              <Users className="w-5 h-5" />
              <span>会员充值</span>
            </div>
            <div className="nav-item active" onClick={() => navigate('/admin/transfer')}>
              <Wallet className="w-5 h-5" />
              <span>划账管理</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/admin/flows')}>
              <Users className="w-5 h-5" />
              <span>流水记录</span>
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-100">
            <button onClick={logout} className="nav-item hover:bg-red-50 hover:text-danger w-full justify-start">
              <LogOut className="w-5 h-5" />
              <span>退出登录</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-64 p-8">
          <h1 className="text-2xl font-bold gradient-text mb-8">划账管理</h1>

          <div className="max-w-2xl mx-auto">
            <div className="card">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择会员 *</label>
                  <select
                    value={userId || ''}
                    onChange={(e) => setUserId(e.target.value ? parseInt(e.target.value) : null)}
                    className="input-field"
                  >
                    <option value="">请选择要扣除的会员</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - 当前余额: {member.balance.toFixed(2)} 元
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-200 rounded-full flex items-center justify-center shadow-lg">
                    <MinusCircle className="w-6 h-6 text-red-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">扣除金额 *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="请输入扣除金额"
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

                {userId && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">会员姓名：</p>
                      <span className="font-medium text-gray-800">{getMemberName(userId)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">扣除前余额：</p>
                      <span className="font-medium text-gray-800">{getMemberBalance(userId).toFixed(2)} 元</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">扣除金额：</p>
                      <span className="font-medium text-danger">-{amount || 0} 元</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">扣除后余额：</p>
                      <span className="font-bold gradient-text">
                        {(getMemberBalance(userId) - parseFloat(amount || '0')).toFixed(2)} 元
                      </span>
                    </div>
                  </div>
                )}

                <button onClick={handleDeduct} className="btn-primary w-full">
                  确认扣除
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
