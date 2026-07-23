import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, User, TrendingDown, Calendar, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { flowApi } from '@/api/client'
import type { Flow } from '@/types'

export default function AdminFlows() {
  const { logout } = useAuthStore()
  const [flows, setFlows] = useState<Flow[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    loadFlows()
  }, [])

  const loadFlows = async () => {
    try {
      const response = await flowApi.getAll()
      setFlows(response.data)
    } catch {
      setFlows([])
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
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
      case 'recharge': return 'text-success bg-green-50'
      case 'transfer': return 'text-primary bg-purple-50'
      case 'consume': return 'text-danger bg-red-50'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getFlowAmountColor = (type: string) => {
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
            <div className="nav-item" onClick={() => navigate('/admin/transfer')}>
              <Users className="w-5 h-5" />
              <span>划账管理</span>
            </div>
            <div className="nav-item active" onClick={() => navigate('/admin/flows')}>
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold gradient-text">流水记录</h1>
            <div className="flex items-center gap-2 text-purple-500">
              <Calendar className="w-5 h-5" />
              <span>共 {flows.length} 条记录</span>
            </div>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-100">
                    <th className="text-left py-4 px-4 font-medium text-gray-600">时间</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">类型</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">描述</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">转出会员</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">转入会员</th>
                    <th className="text-right py-4 px-4 font-medium text-gray-600">金额</th>
                  </tr>
                </thead>
                <tbody>
                  {flows.map((flow) => (
                    <tr key={flow.id} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                      <td className="py-4 px-4 text-gray-600">{formatDate(flow.created_at)}</td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getFlowTypeColor(flow.type)}`}>
                          {getFlowTypeLabel(flow.type)}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-800">{flow.description}</td>
                      <td className="py-4 px-4 text-gray-600">{flow.from_user_name || '-'}</td>
                      <td className="py-4 px-4 text-gray-600">{flow.to_user_name || '-'}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-medium ${getFlowAmountColor(flow.type)}`}>
                          {flow.type === 'recharge' ? '+' : flow.type === 'consume' ? '-' : ''}{flow.amount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {flows.length === 0 && (
              <div className="text-center py-12">
                <TrendingDown className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                <p className="text-gray-500">暂无流水记录</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}