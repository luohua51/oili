import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import Login from '@/pages/Login'
import MemberHome from '@/pages/MemberHome'
import Transactions from '@/pages/Transactions'
import AdminHome from '@/pages/AdminHome'
import AdminMembers from '@/pages/AdminMembers'
import AdminRecharge from '@/pages/AdminRecharge'
import AdminTransfer from '@/pages/AdminTransfer'
import AdminFlows from '@/pages/AdminFlows'

function ProtectedRoute({ children, requireAdmin }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, token, fetchUser } = useAuthStore()

  useEffect(() => {
    if (token && !user) {
      fetchUser()
    }
  }, [token, user, fetchUser])

  if (!token) {
    return <Navigate to="/login" />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" />
  }

  return <>{children}</>
}

function MemberRoute({ children }: { children: React.ReactNode }) {
  const { user, token, fetchUser } = useAuthStore()

  useEffect(() => {
    if (token && !user) {
      fetchUser()
    }
  }, [token, user, fetchUser])

  if (!token) {
    return <Navigate to="/login" />
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <MemberRoute>
            <MemberHome />
          </MemberRoute>
        } />
        
        <Route path="/transactions" element={
          <MemberRoute>
            <Transactions />
          </MemberRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminHome />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/members" element={
          <ProtectedRoute requireAdmin>
            <AdminMembers />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/recharge" element={
          <ProtectedRoute requireAdmin>
            <AdminRecharge />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/transfer" element={
          <ProtectedRoute requireAdmin>
            <AdminTransfer />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/flows" element={
          <ProtectedRoute requireAdmin>
            <AdminFlows />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}