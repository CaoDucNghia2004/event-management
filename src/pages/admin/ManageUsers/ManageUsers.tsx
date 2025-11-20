import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_ALL_USERS } from '../../../graphql/queries/userQueries'
import {
  RESET_ALL_USER_POINTS,
  CREATE_USER,
  CHECK_AND_SEND_REPUTATION_ALERTS
} from '../../../graphql/mutations/userMutations'
import {
  Search,
  Users,
  GraduationCap,
  UserCircle,
  RotateCw,
  RefreshCw,
  UserPlus,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react'
import Swal from 'sweetalert2'
import userApiRequests from '../../../apiRequests/user'
import { showGqlError } from '../../../utils/showGqlError'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  is_active: boolean
  reputation_score: number
  roles: string[]
  created_at: string
  updated_at: string
}

interface UsersData {
  getAllUser: User[]
}

type TabType = 'students' | 'lecturers'

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState<TabType>('students')
  const [searchQuery, setSearchQuery] = useState('')

  const { data, loading, error, refetch } = useQuery<UsersData>(GET_ALL_USERS, {
    fetchPolicy: 'network-only'
  })

  const [resetAllUserPoints] = useMutation(RESET_ALL_USER_POINTS)
  const [createUser] = useMutation(CREATE_USER)
  const [checkAndSendReputationAlerts] = useMutation(CHECK_AND_SEND_REPUTATION_ALERTS)

  // Lọc users theo role và search
  const filteredUsers = useMemo(() => {
    const users = data?.getAllUser || []

    return users.filter((user) => {
      // Loại bỏ ADMIN
      if (user.roles?.includes('ADMIN')) {
        return false
      }

      // Lọc theo tab: Sinh viên = USER, Giảng viên = ORGANIZER
      const roleMatch = activeTab === 'students' ? user.roles?.includes('USER') : user.roles?.includes('ORGANIZER')

      // Lọc theo search
      const searchMatch =
        searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())

      return roleMatch && searchMatch
    })
  }, [data, activeTab, searchQuery])

  // Handle reset điểm
  const handleResetPoints = async () => {
    const result = await Swal.fire({
      title: 'Reset điểm cho tất cả sinh viên?',
      html: `
        <div class="text-left">
          <p class="mb-3">Nhập điểm mới (mặc định: 70):</p>
          <input type="number" id="points" class="swal2-input" value="70" min="0" max="100" disabled style="background-color: #f3f4f6; cursor: not-allowed;" />
          <p class="mt-3 mb-2">Lý do reset:</p>
          <textarea id="reason" class="swal2-textarea" placeholder="Nhập lý do reset điểm...">Reset điểm hệ thống</textarea>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reset',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      preConfirm: () => {
        const points = 70 // Fixed at 70
        const reason = (document.getElementById('reason') as HTMLTextAreaElement).value
        return { points, reason: reason.trim() || 'Reset điểm hệ thống' }
      }
    })

    if (result.isConfirmed && result.value) {
      try {
        const response = await resetAllUserPoints({
          variables: {
            input: {
              points: result.value.points,
              reason: result.value.reason
            }
          }
        })

        const data = response.data as any

        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          html: `
            <p>${data.resetAllUserPoints.message}</p>
            <p class="mt-2 text-sm text-gray-600">
              Đã cập nhật: ${data.resetAllUserPoints.updated_count}/${data.resetAllUserPoints.total_users} người dùng
            </p>
          `,
          showConfirmButton: false,
          timer: 2000
        })

        refetch()
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error?.message || 'Không thể reset điểm!',
          confirmButtonText: 'Đóng'
        })
      }
    }
  }

  // Handle tạo tài khoản ORGANIZER
  const handleCreateOrganizer = async () => {
    const result = await Swal.fire({
      title: 'Tạo tài khoản Ban tổ chức',
      html: `
        <div class="text-left space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">Họ tên <span class="text-red-500">*</span></label>
            <input type="text" id="name" class="swal2-input w-full" placeholder="Nhập họ tên..." value="" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Email <span class="text-red-500">*</span></label>
            <input type="email" id="email" class="swal2-input w-full" placeholder="Nhập email..." value="" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Mật khẩu <span class="text-red-500">*</span></label>
            <input type="password" id="password" class="swal2-input w-full" placeholder="Nhập mật khẩu..." value="" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Số điện thoại</label>
            <input type="text" id="phone" class="swal2-input w-full" placeholder="Nhập số điện thoại..." value="" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tạo tài khoản',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      width: '500px',
      didOpen: () => {
        // Focus vào input đầu tiên
        const nameInput = document.getElementById('name') as HTMLInputElement
        if (nameInput) nameInput.focus()
      },
      preConfirm: () => {
        const name = (document.getElementById('name') as HTMLInputElement).value.trim()
        const email = (document.getElementById('email') as HTMLInputElement).value.trim()
        const password = (document.getElementById('password') as HTMLInputElement).value.trim()
        const phone = (document.getElementById('phone') as HTMLInputElement).value.trim()

        if (!name) {
          Swal.showValidationMessage('Vui lòng nhập họ tên')
          return false
        }
        if (!email) {
          Swal.showValidationMessage('Vui lòng nhập email')
          return false
        }
        if (!password) {
          Swal.showValidationMessage('Vui lòng nhập mật khẩu')
          return false
        }
        if (password.length < 6) {
          Swal.showValidationMessage('Mật khẩu phải có ít nhất 6 ký tự')
          return false
        }

        return { name, email, password, phone: phone || null }
      }
    })

    if (result.isConfirmed && result.value) {
      try {
        const response = await createUser({
          variables: result.value
        })

        const data = response.data as any

        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: data.createUser.message,
          showConfirmButton: false,
          timer: 1500
        })

        refetch()
      } catch (error: any) {
        showGqlError(error)
      }
    }
  }

  // Handle export users
  const handleExportUsers = async () => {
    try {
      const response = await userApiRequests.exportUsers()

      // Tạo blob URL và download
      const blob = new Blob([response.data as any], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã tải xuống file danh sách người dùng',
        showConfirmButton: false,
        timer: 1500
      })
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error?.message || 'Không thể export danh sách người dùng!',
        confirmButtonText: 'Đóng'
      })
    }
  }

  // Handle import users
  const handleImportUsers = async () => {
    const result = await Swal.fire({
      title: 'Import danh sách người dùng',
      html: `
        <div class="text-left">
          <p class="mb-3">Chọn file CSV để import:</p>
          <input type="file" id="import-file" accept=".csv,.txt" class="swal2-file" />
          <div class="mt-3 text-sm text-gray-600">
            <p class="font-semibold mb-2">Định dạng file CSV:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Header: Name, Email, Phone, Is Active, Reputation Score, Roles</li>
              <li>Is Active: Yes/No</li>
              <li>Roles: USER hoặc ORGANIZER (phân cách bằng dấu phẩy nếu nhiều role)</li>
              <li>Mật khẩu mặc định: <strong>123456</strong></li>
            </ul>
          </div>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Import',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const fileInput = document.getElementById('import-file') as HTMLInputElement
        const file = fileInput?.files?.[0]
        if (!file) {
          Swal.showValidationMessage('Vui lòng chọn file!')
          return false
        }
        return file
      }
    })

    if (result.isConfirmed && result.value) {
      try {
        const formData = new FormData()
        formData.append('file', result.value)

        const response = await userApiRequests.importUsers(formData)
        const data = response.data.data

        await Swal.fire({
          icon: data.errors.length > 0 ? 'warning' : 'success',
          title: data.errors.length > 0 ? 'Import hoàn tất với lỗi' : 'Thành công!',
          html: `
            <div class="text-left text-sm space-y-2">
              <p><strong>Đã tạo:</strong> ${data.created_count} người dùng</p>
              <p><strong>Bỏ qua:</strong> ${data.skipped_count} người dùng</p>
              <p><strong>Tổng số dòng:</strong> ${data.total_rows}</p>
              ${
                data.errors.length > 0
                  ? `
                <div class="mt-3 p-3 bg-red-50 rounded">
                  <p class="font-semibold text-red-700 mb-2">Lỗi:</p>
                  <ul class="list-disc list-inside text-red-600 space-y-1">
                    ${data.errors
                      .slice(0, 5)
                      .map((err) => `<li>${err}</li>`)
                      .join('')}
                    ${data.errors.length > 5 ? `<li>... và ${data.errors.length - 5} lỗi khác</li>` : ''}
                  </ul>
                </div>
              `
                  : ''
              }
            </div>
          `,
          confirmButtonText: 'Đóng'
        })

        refetch()
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Không thể import người dùng!'
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'Đóng'
        })
      }
    }
  }

  // Handle gửi cảnh báo cho sinh viên có điểm thấp
  const handleSendWarnings = async () => {
    const result = await Swal.fire({
      title: 'Gửi cảnh báo điểm uy tín?',
      html: `
        <div class="text-left">
          <p class="mb-3">Hệ thống sẽ gửi cảnh báo cho:</p>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li><strong>Điểm 50-59:</strong> Cảnh báo điểm thấp</li>
            <li><strong>Điểm dưới 50:</strong> Thông báo bị chặn đăng ký</li>
          </ul>
          <p class="mt-3 text-sm text-gray-600">
            <em>Lưu ý: Chỉ gửi cho sinh viên chưa nhận cảnh báo trong 30 ngày gần đây.</em>
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Gửi cảnh báo',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280'
    })

    if (result.isConfirmed) {
      try {
        const response = await checkAndSendReputationAlerts()
        const data = response.data as any

        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          html: `
            <p class="mb-3">${data.checkAndSendReputationAlerts.message}</p>
            <div class="mt-3 text-sm text-left space-y-2 bg-gray-50 p-4 rounded-lg">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600">
                  <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
                </svg>
                <span><strong>Tổng số xử lý:</strong> ${data.checkAndSendReputationAlerts.total_processed} sinh viên</span>
              </div>
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-600">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>
                </svg>
                <span><strong>Cảnh báo:</strong> ${data.checkAndSendReputationAlerts.warning_count} sinh viên</span>
              </div>
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600">
                  <circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>
                </svg>
                <span><strong>Bị chặn:</strong> ${data.checkAndSendReputationAlerts.blocked_count} sinh viên</span>
              </div>
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600">
                  <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/>
                </svg>
                <span><strong>Bỏ qua:</strong> ${data.checkAndSendReputationAlerts.skipped_count} sinh viên</span>
              </div>
            </div>
          `,
          confirmButtonText: 'Đóng'
        })

        refetch()
      } catch (error: any) {
        const errorMessage = error?.graphQLErrors?.[0]?.message || error?.message || 'Không thể gửi cảnh báo!'
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'Đóng'
        })
      }
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-8'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-600'>Lỗi: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='p-8 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
              <Users className='w-8 h-8 text-blue-600' />
              Quản lý Người dùng
            </h1>
            <p className='text-gray-600 mt-1'>Xem và quản lý sinh viên và ban tổ chức</p>
          </div>
          <div className='flex gap-3'>
            <button
              onClick={handleImportUsers}
              className='flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors'
              title='Import danh sách người dùng từ file CSV'
            >
              <Upload className='w-5 h-5' />
              Import
            </button>
            <button
              onClick={handleExportUsers}
              className='flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors'
              title='Export danh sách người dùng ra file CSV'
            >
              <Download className='w-5 h-5' />
              Export
            </button>
            {activeTab === 'lecturers' && (
              <button
                onClick={handleCreateOrganizer}
                className='flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors'
                title='Tạo tài khoản ban tổ chức'
              >
                <UserPlus className='w-5 h-5' />
                Tạo tài khoản
              </button>
            )}
            <button
              onClick={() => refetch()}
              className='p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
              title='Làm mới'
            >
              <RotateCw className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>

      {/* Main Card with Tabs */}
      <div className='bg-white rounded-lg shadow-md'>
        {/* Tabs */}
        <div className='border-b border-gray-200'>
          <div className='flex'>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCircle className='w-5 h-5' />
              Sinh viên (
              {data?.getAllUser.filter((u) => u.roles?.includes('USER') && !u.roles?.includes('ADMIN') && u.is_active)
                .length || 0}
              )
            </button>
            <button
              onClick={() => setActiveTab('lecturers')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'lecturers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap className='w-5 h-5' />
              Ban tổ chức (
              {data?.getAllUser.filter(
                (u) => u.roles?.includes('ORGANIZER') && !u.roles?.includes('ADMIN') && u.is_active
              ).length || 0}
              )
            </button>
          </div>
        </div>

        {/* Search */}
        <div className='p-6 border-b border-gray-200'>
          <div className='relative max-w-md'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Tìm kiếm theo tên hoặc email...'
              className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Tên
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Số điện thoại
                </th>
                {activeTab === 'students' && (
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                    Điểm uy tín
                  </th>
                )}
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Trạng thái
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Ngày tạo
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'students' ? 6 : 5} className='px-6 py-12 text-center'>
                    <div className='flex flex-col items-center justify-center text-gray-500'>
                      <Users className='w-12 h-12 mb-3 text-gray-400' />
                      <p className='font-medium'>Không tìm thấy người dùng</p>
                      <p className='text-sm mt-1'>Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center gap-3'>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className='w-10 h-10 rounded-full object-cover' />
                        ) : (
                          <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center'>
                            <span className='text-blue-600 font-semibold text-sm'>
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className='font-semibold text-gray-900'>{user.name}</p>
                          {user.roles && user.roles.length > 0 && (
                            <div className='flex gap-1 mt-1'>
                              {user.roles.map((role) => (
                                <span
                                  key={role}
                                  className={`px-2 py-0.5 text-xs rounded-full ${
                                    role === 'ADMIN'
                                      ? 'bg-red-100 text-red-700'
                                      : role === 'LECTURER'
                                        ? 'bg-purple-100 text-purple-700'
                                        : role === 'ORGANIZER'
                                          ? 'bg-orange-100 text-orange-700'
                                          : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{user.email}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{user.phone || '-'}</td>
                    {activeTab === 'students' && (
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`font-semibold ${
                              user.reputation_score >= 70
                                ? 'text-green-600'
                                : user.reputation_score >= 50
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {user.reputation_score}
                          </span>
                          <div className='w-20 h-2 bg-gray-200 rounded-full overflow-hidden'>
                            <div
                              className={`h-full ${
                                user.reputation_score >= 70
                                  ? 'bg-green-500'
                                  : user.reputation_score >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${user.reputation_score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.is_active ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredUsers.length > 0 && (
          <div className='px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Hiển thị <span className='font-semibold'>{filteredUsers.length}</span> người dùng
            </p>
            {activeTab === 'students' && (
              <div className='flex gap-3'>
                <button
                  onClick={handleSendWarnings}
                  className='flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors text-sm'
                  title='Gửi cảnh báo cho sinh viên có điểm thấp'
                >
                  <AlertTriangle className='w-4 h-4' />
                  Gửi cảnh báo
                </button>
                <button
                  onClick={handleResetPoints}
                  className='flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors text-sm'
                  title='Reset điểm cho tất cả sinh viên'
                >
                  <RefreshCw className='w-4 h-4' />
                  Reset điểm
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
