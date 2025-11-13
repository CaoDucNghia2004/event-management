import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../store/useAuthStore'

export function PrivateRoute() {
  const { user } = useAuthStore()
  return user ? <Outlet /> : <Navigate to='/login' replace />
}

export function PublicOnlyRoute() {
  const { user } = useAuthStore()
  return user ? <Navigate to='/' replace /> : <Outlet />
}
