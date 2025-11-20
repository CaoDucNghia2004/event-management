import { useState, useEffect, useMemo } from 'react'
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
  Home,
  UserCircle,
  GraduationCap,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Swal from 'sweetalert2'
import authApiRequests from '../../apiRequests/auth'

interface Props {
  children?: React.ReactNode
}

export default function MainLayoutAdmin({ children }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const isAdmin = user?.roles?.includes('ADMIN')

  const menuItems = useMemo(() => {
    const allItems = [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
      { path: '/admin/locations', label: 'Quản lý địa điểm', icon: MapPin },
      { path: '/admin/events', label: 'Quản lý sự kiện', icon: Calendar },
      { path: '/admin/papers', label: 'Quản lý bài báo', icon: FileText },
      { path: '/admin/users', label: 'Quản lý người dùng', icon: Users, adminOnly: true },
      { path: '/admin/feedbacks', label: 'Quản lý Feedback', icon: MessageSquare },
      { path: '/admin/notifications', label: 'Quản lý Thông báo', icon: Bell }
    ]

    // Lọc menu items dựa trên role
    return allItems.filter((item) => !item.adminOnly || isAdmin)
  }, [isAdmin])

  // Redirect ORGANIZER từ /admin/dashboard về trang đầu tiên họ có quyền
  useEffect(() => {
    if (!isAdmin && location.pathname === '/admin/dashboard') {
      // Lấy trang đầu tiên ORGANIZER có quyền truy cập
      const firstAvailablePath = menuItems[0]?.path
      if (firstAvailablePath) {
        navigate(firstAvailablePath, { replace: true })
      }
    }
  }, [location.pathname, isAdmin, menuItems, navigate])

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children) {
        const match = item.children.some((sub) => location.pathname.startsWith(sub.path))
        if (match) setOpenMenu(item.label)
      }
    })
  }, [location.pathname, menuItems])

  const handleLogout = async () => {
    try {
      const res = await authApiRequests.logout()
      if (res.data.status === 200) {
        logout()
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đăng xuất thành công!',
          timer: 1500,
          showConfirmButton: false
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
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
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

        <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
          {menuItems.map((item) => {
            const Icon = item.icon

            if (item.children) {
              const isOpen = openMenu === item.label
              const isParentActive = item.children.some((sub) => location.pathname.startsWith(sub.path))

              return (
                <div key={item.label}>
                  <button
                    onClick={() => setOpenMenu(isOpen ? null : item.label)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                      isParentActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className='flex items-center gap-3'>
                      <Icon className='w-5 h-5' />
                      {isSidebarOpen && <span className='text-sm font-medium'>{item.label}</span>}
                    </span>

                    {isSidebarOpen &&
                      (isOpen ? (
                        <ChevronUp className='w-4 h-4 text-gray-200' />
                      ) : (
                        <ChevronDown className='w-4 h-4 text-gray-400' />
                      ))}
                  </button>

                  {/* SUBMENU */}
                  {isOpen && isSidebarOpen && (
                    <div className='ml-10 mt-2 space-y-1'>
                      {item.children.map((sub) => {
                        const SubIcon = sub.icon
                        const isActive = location.pathname.startsWith(sub.path)
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                              isActive ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <SubIcon className='w-4 h-4' />
                            {sub.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className='w-5 h-5' />
                {isSidebarOpen && <span className='text-sm font-medium'>{item.label}</span>}
              </Link>
            )
          })}

          <div className='border-t border-gray-800 my-4'></div>

          <Link
            to='/'
            className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors'
          >
            <Home className='w-5 h-5' />
            {isSidebarOpen && <span className='text-sm font-medium'>Về trang chính</span>}
          </Link>
        </nav>

        <div className='p-4 border-t border-gray-800'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold'>
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
            <LogOut className='w-5 h-5' />
            {isSidebarOpen && <span className='text-sm font-medium'>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className='flex-1 flex flex-col overflow-hidden'>
        <main className='flex-1 overflow-y-auto bg-gray-100'>{children}</main>
      </div>
    </div>
  )
}
