import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuthStore } from '../../store/useAuthStore'
import {
  LayoutDashboard,
  Calendar,
  Users,
  MapPin,
  FileText,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react'
import Swal from 'sweetalert2'
import authApiRequests from '../../apiRequests/auth'

interface Props {
  children?: React.ReactNode
}

export default function MainLayoutAdmin({ children }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/locations', label: 'Quản lý địa điểm', icon: MapPin },
    { path: '/admin/events', label: 'Quản lý sự kiện', icon: Calendar },
    { path: '/admin/papers', label: 'Quản lý bài báo', icon: FileText },
    { path: '/admin/users', label: 'Quản lý người dùng', icon: Users },
    { path: '/admin/feedbacks', label: 'Quản lý Feedback', icon: MessageSquare },
    { path: '/admin/notifications', label: 'Quản lý Thông báo', icon: Bell }
  ]

  const handleLogout = async () => {
    try {
      const res = await authApiRequests.logout()
      if (res.data.status === 200) {
        logout()
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đăng xuất thành công!',
          showConfirmButton: false,
          timer: 1500
        })
        navigate('/login')
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error?.response?.data?.message || 'Lỗi khi đăng xuất!',
        confirmButtonText: 'Đóng'
      })
    }
  }

  const getInitial = (name?: string) => (name ? name.charAt(0).toUpperCase() : 'A')

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo & Toggle */}
        <div className='p-4 flex items-center justify-between border-b border-gray-800'>
          {isSidebarOpen ? (
            <>
              <h1 className='text-xl font-bold'>Admin Panel</h1>
              <button onClick={() => setIsSidebarOpen(false)} className='p-1 hover:bg-gray-800 rounded'>
                <X className='w-5 h-5' />
              </button>
            </>
          ) : (
            <button onClick={() => setIsSidebarOpen(true)} className='p-1 hover:bg-gray-800 rounded mx-auto'>
              <Menu className='w-5 h-5' />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className='w-5 h-5 flex-shrink-0' />
                {isSidebarOpen && <span className='text-sm font-medium'>{item.label}</span>}
              </Link>
            )
          })}

          <div className='border-t border-gray-800 my-4'></div>

          {/* Back to User Site */}
          <Link
            to='/'
            className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors'
          >
            <Home className='w-5 h-5 flex-shrink-0' />
            {isSidebarOpen && <span className='text-sm font-medium'>Về trang chính</span>}
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div className='p-4 border-t border-gray-800'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold flex-shrink-0'>
              {getInitial(user?.name)}
            </div>
            {isSidebarOpen && (
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold truncate'>{user?.name}</p>
                <p className='text-xs text-gray-400 truncate'>{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className='flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-gray-800 transition-colors'
          >
            <LogOut className='w-5 h-5 flex-shrink-0' />
            {isSidebarOpen && <span className='text-sm font-medium'>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Page Content */}
        <main className='flex-1 overflow-y-auto bg-gray-100'>{children}</main>
      </div>
    </div>
  )
}
