import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuthStore } from '../../store/useAuthStore'
import { User, LogOut, Calendar, Home, MessageSquare, FileText, LogIn, UserPlus } from 'lucide-react'
import authApiRequests from '../../apiRequests/auth'
import { toast } from 'react-toastify'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const { user, logout } = useAuthStore()

  const menuItems = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/events', label: 'Sự kiện & Hội thảo', icon: Calendar },
    { path: '/messages', label: 'Tin nhắn', icon: MessageSquare },
    { path: '/papers', label: 'Bài báo', icon: FileText }
  ]

  const handleLogout = async () => {
    try {
      const res = await authApiRequests.logout()

      if (res.data.status === 200) {
        logout() // Xóa state + localStorage
        toast.success('Đăng xuất thành công!')
        navigate('/login')
      } else {
        toast.error(res.data.message || 'Đăng xuất thất bại!')
      }
    } catch (error: any) {
      console.error('Logout error:', error)
      toast.error(error?.response?.data?.message || 'Lỗi khi đăng xuất!')
    }
  }
  const getInitial = (name?: string) => (name ? name.charAt(0).toUpperCase() : '?')

  return (
    <header className='w-full bg-gray-900 shadow-lg'>
      <div className='max-w-7xl mx-auto px-8 py-5'>
        <div className='flex items-center justify-between gap-8'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-3 group'>
            <Calendar className='w-8 h-8 text-white group-hover:scale-110 transition-transform' />
            <div className='flex flex-col'>
              <span className='text-white font-bold text-xl'>HUIT Events</span>
              <span className='text-gray-400 text-xs'>Quản lý sự kiện</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className='hidden md:flex items-center gap-2'>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className='relative flex items-center gap-2 px-4 py-2 text-white font-bold transition-all hover:bg-gray-800 rounded'
                >
                  <Icon className='w-5 h-5' />
                  <span>{item.label}</span>
                  {isActive && <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-white'></div>}
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          {user ? (
            <div className='relative ml-4'>
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
                className='flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-all'
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className='w-8 h-8 rounded-full object-cover border-2 border-white'
                  />
                ) : (
                  <div className='w-8 h-8 flex items-center justify-center bg-gray-700 text-white font-bold rounded-full border-2 border-white'>
                    {getInitial(user.name)}
                  </div>
                )}
                <span className='text-white font-bold text-sm hidden md:block'>{user.name}</span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className={`w-4 h-4 text-white transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
                </svg>
              </button>

              {isMenuOpen && (
                <div className='absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50'>
                  <Link
                    to='/profile'
                    className='flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition'
                  >
                    <User className='w-4 h-4 text-gray-700' />
                    <span className='text-sm font-semibold'>Thông tin cá nhân</span>
                  </Link>

                  <Link
                    to='/my-events'
                    className='flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition'
                  >
                    <Calendar className='w-4 h-4 text-gray-700' />
                    <span className='text-sm font-semibold'>Sự kiện của tôi</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className='flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition text-left border-t border-gray-100'
                  >
                    <LogOut className='w-4 h-4' />
                    <span className='text-sm font-semibold'>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='flex items-center gap-3 ml-4'>
              <Link
                to='/login'
                className='flex items-center gap-2 px-4 py-2 text-white font-bold hover:bg-gray-800 rounded-lg transition-all'
              >
                <LogIn className='w-4 h-4' />
                <span>Đăng nhập</span>
              </Link>
              <Link
                to='/register'
                className='flex items-center gap-2 px-4 py-2 text-white font-bold hover:bg-gray-800 rounded-lg transition-all'
              >
                <UserPlus className='w-4 h-4' />
                <span>Đăng ký</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
