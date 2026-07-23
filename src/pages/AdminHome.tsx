import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Wallet, TrendingUp, TrendingDown, User, LogOut, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { memberApi, flowApi } from '@/api/client'
import type { User as UserType, Flow } from '@/types'

export default function AdminHome() {
  const { logout } = useAuthStore()
  const [members, setMembers] = useState<UserType[]>([])
  const [flows, setFlows] = useState<Flow[]>([])
  const [stats, setStats] = useState({ totalMembers: 0, totalBalance: 0, todayRecharge: 0, todayConsume: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const membersResponse = await memberApi.getAll()
      setMembers(membersResponse.data)

      const flowsResponse = await flowApi.getAll()
      setFlows(flowsResponse.data.slice(0, 5))

      const totalMembers = membersResponse.data.length
      const totalBalance = membersResponse.data.reduce((sum, m) => sum + m.balance, 0)
      
      const today = new Date().toDateString()
      const todayRecharge = flowsResponse.data
        .filter(f => f.type === 'recharge' && new Date(f.created_at).toDateString() === today)
        .reduce((sum, f) => sum + f.amount, 0)
      const todayConsume = flowsResponse.data
        .filter(f => f.type === 'consume' && new Date(f.created_at).toDateString() === today)
        .reduce((sum, f) => sum + f.amount, 0)

      setStats({ totalMembers, totalBalance, todayRecharge, todayConsume })
    } catch {
      setMembers([])
      setFlows([])
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getFlowTypeLabel = (type: string) => {
    switch (type) {
      case 'recharge': return '充值'
      case 'transfer': return '划账'
      case 'consume': return '消费'
      default: return type
    }
  }

  const getFlowTypeColor = (type: string) => {
    switch (type) {
      case 'recharge': return 'text-success'
      case 'transfer': return 'text-primary'
      case 'consume': return 'text-danger'
      default: return 'text-gray-600'
    }
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
            <div className="nav-item active" onClick={() => navigate('/admin')}>
              <Users className="w-5 h-5" />
              <span>数据概览</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/admin/members')}>
              <Users className="w-5 h-5" />
              <span>会员管理</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/admin/recharge')}>
              <TrendingUp className="w-5 h-5" />
              <span>会员充值</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/admin/transfer')}>
              <Wallet className="w-5 h-5" />
              <span>划账管理</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/admin/flows')}>
              <TrendingDown className="w-5 h-5" />
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
          <h1 className="text-2xl font-bold gradient-text mb-8">数据概览</h1>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">总会员数</p>
                  <p className="text-3xl font-bold gradient-text mt-2">{stats.totalMembers}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">总余额</p>
                  <p className="text-3xl font-bold gradient-text mt-2">{stats.totalBalance.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">今日充值</p>
                  <p className="text-3xl font-bold text-success mt-2">+{stats.todayRecharge.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">今日消费</p>
                  <p className="text-3xl font-bold text-danger mt-2">-{stats.todayConsume.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-danger" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">会员列表</h2>
                <button onClick={() => navigate('/admin/members')} className="text-sm text-primary hover:underline flex items-center gap-1">
                  查看全部
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {members.length > 0 ? (
                <div className="space-y-4">
                  {members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-3 border-b border-purple-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.phone}</p>
                        </div>
                      </div>
                      <span className="font-medium gradient-text">{member.balance.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400">暂无会员</p>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">最近流水</h2>
                <button onClick={() => navigate('/admin/flows')} className="text-sm text-primary hover:underline flex items-center gap-1">
                  查看全部
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {flows.length > 0 ? (
                <div className="space-y-4">
                  {flows.map((flow) => (
                    <div key={flow.id} className="flex items-center justify-between py-3 border-b border-purple-100 last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            flow.type === 'recharge' ? 'bg-green-50 text-success' :
                            flow.type === 'transfer' ? 'bg-purple-50 text-primary' :
                            'bg-red-50 text-danger'
                          }`}>
                            {getFlowTypeLabel(flow.type)}
                          </span>
                          <span className="text-sm text-gray-600">{flow.description}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(flow.created_at)}</p>
                      </div>
                      <span className={`font-medium ${getFlowTypeColor(flow.type)}`}>
                        {flow.type === 'recharge' ? '+' : '-'}{flow.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400">暂无流水</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}