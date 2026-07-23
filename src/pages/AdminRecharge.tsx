import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, User, TrendingUp, AlertCircle, CheckCircle, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { memberApi, flowApi } from '@/api/client'
import type { User as UserType } from '@/types'

export default function AdminRecharge() {
  const { logout } = useAuthStore()
  const [members, setMembers] = useState<UserType[]>([])
  const [selectedMember, setSelectedMember] = useState<number | null>(null)
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

  const handleRecharge = async () => {
    setError('')
    setSuccess('')

    if (!selectedMember) {
      setError('请选择会员')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('请输入有效的金额')
      return
    }

    try {
      await flowApi.recharge({ userId: selectedMember, amount: parseFloat(amount), description: description || '充值' })
      setSuccess('充值成功')
      setAmount('')
      setDescription('')
      await loadMembers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || '充值失败')
    }
  }

  const getSelectedMemberName = () => {
    const member = members.find(m => m.id === selectedMember)
    return member?.name || ''
  }

  const quickAmounts = [100, 500, 1000, 2000]

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
            <div className="nav-item active" onClick={() => navigate('/admin/recharge')}>
              <TrendingUp className="w-5 h-5" />
              <span>会员充值</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/admin/transfer')}>
              <Users className="w-5 h-5" />
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
          <h1 className="text-2xl font-bold gradient-text mb-8">会员充值</h1>

          <div className="max-w-2xl mx-auto">
            <div className="card">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择会员 *</label>
                  <select
                    value={selectedMember || ''}
                    onChange={(e) => setSelectedMember(e.target.value ? parseInt(e.target.value) : null)}
                    className="input-field"
                  >
                    <option value="">请选择会员</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - 当前余额: {member.balance.toFixed(2)} 元
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">充值金额 *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="请输入充值金额"
                    className="input-field"
                  />
                  <div className="flex gap-2 mt-3">
                    {quickAmounts.map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmount(val.toString())}
                        className="px-4 py-2 text-sm border-2 border-purple-100 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all"
                      >
                        {val}元
                      </button>
                    ))}
                  </div>
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

                {selectedMember && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                    <p className="text-sm text-gray-600">
                      充值会员：<span className="font-medium text-gray-800">{getSelectedMemberName()}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      当前余额：<span className="font-medium text-gray-800">{members.find(m => m.id === selectedMember)?.balance.toFixed(2)} 元</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      充值金额：<span className="font-medium text-success">+{amount || 0} 元</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      充值后余额：<span className="font-bold gradient-text">
                        {((members.find(m => m.id === selectedMember)?.balance || 0) + parseFloat(amount || '0')).toFixed(2)} 元
                      </span>
                    </p>
                  </div>
                )}

                <button onClick={handleRecharge} className="btn-primary w-full">
                  确认充值
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}