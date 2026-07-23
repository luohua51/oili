import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, User, Plus, Edit, Trash2, AlertCircle, CheckCircle, Search, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { memberApi } from '@/api/client'
import type { User as UserType } from '@/types'

export default function AdminMembers() {
  const { logout } = useAuthStore()
  const [members, setMembers] = useState<UserType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMember, setEditingMember] = useState<UserType | null>(null)
  const [formData, setFormData] = useState({ username: '', password: '', name: '', phone: '', email: '' })
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

  const handleAddMember = async () => {
    setError('')
    setSuccess('')

    if (!formData.username || !formData.password || !formData.name) {
      setError('请填写必填字段')
      return
    }

    try {
      await memberApi.create({ ...formData })
      await loadMembers()
      setSuccess('添加成功')
      setFormData({ username: '', password: '', name: '', phone: '', email: '' })
      setTimeout(() => setShowAddModal(false), 1000)
    } catch (err: any) {
      setError(err.response?.data?.message || '添加失败')
    }
  }

  const handleEditMember = async () => {
    setError('')
    setSuccess('')

    if (!formData.name) {
      setError('请填写姓名')
      return
    }

    try {
      await memberApi.update(editingMember!.id, { name: formData.name, phone: formData.phone })
      await loadMembers()
      setSuccess('修改成功')
      setTimeout(() => setShowEditModal(false), 1000)
    } catch (err: any) {
      setError(err.response?.data?.message || '修改失败')
    }
  }

  const handleDeleteMember = async (id: number) => {
    if (!confirm('确定要删除该会员吗？')) return
    try {
      await memberApi.delete(id)
      await loadMembers()
    } catch {
      alert('删除失败')
    }
  }

  const openEditModal = (member: UserType) => {
    setEditingMember(member)
    setFormData({ username: member.username, password: '', name: member.name, phone: member.phone, email: member.email || '' })
    setShowEditModal(true)
  }

  const filteredMembers = members.filter(
    m => m.name.includes(searchTerm) || m.phone.includes(searchTerm) || m.username.includes(searchTerm) || (m.email && m.email.includes(searchTerm))
  )

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
            <div className="nav-item active" onClick={() => navigate('/admin/members')}>
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold gradient-text">会员管理</h1>
            <button onClick={() => setShowAddModal(true)} className="btn-success flex items-center gap-2">
              <Plus className="w-4 h-4" />
              新增会员
            </button>
          </div>

          <div className="card mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索会员姓名、手机号、用户名或邮箱"
                className="input-field pl-12"
              />
            </div>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-100">
                    <th className="text-left py-4 px-4 font-medium text-gray-600">姓名</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">用户名</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">手机号</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">邮箱</th>
                    <th className="text-right py-4 px-4 font-medium text-gray-600">余额</th>
                    <th className="text-center py-4 px-4 font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-gray-800">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{member.username}</td>
                      <td className="py-4 px-4 text-gray-600">{member.phone || '-'}</td>
                      <td className="py-4 px-4 text-gray-600">{member.email || '-'}</td>
                      <td className="py-4 px-4 text-right font-medium gradient-text">{member.balance.toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(member)} className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteMember(member.id)} className="p-2 text-gray-600 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                <p className="text-gray-500">暂无会员</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-lg font-bold gradient-text mb-4">新增会员</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">用户名 *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入用户名"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">密码 *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="请输入密码"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入姓名"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入手机号"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="请输入邮箱"
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
              <button onClick={() => setShowAddModal(false)} className="flex-1 btn-outline">
                取消
              </button>
              <button onClick={handleAddMember} className="flex-1 btn-primary">
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-lg font-bold gradient-text mb-4">编辑会员</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                <input
                  type="text"
                  value={formData.username}
                  disabled
                  className="input-field bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入姓名"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入手机号"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="请输入邮箱"
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
              <button onClick={() => setShowEditModal(false)} className="flex-1 btn-outline">
                取消
              </button>
              <button onClick={handleEditMember} className="flex-1 btn-primary">
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}