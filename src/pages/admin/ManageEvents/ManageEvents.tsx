import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_ALL_EVENTS } from '../../../graphql/queries/eventQueries'
import { DELETE_EVENT, APPROVE_EVENT, CANCEL_EVENT, ADVANCE_STATUS } from '../../../graphql/mutations/eventMutations'
import type { Event } from '../../../types/event.types'
import { Edit2, Trash2, Plus, RotateCw, CheckCircle, XCircle, PlayCircle, Ban, Eye, ClipboardCheck } from 'lucide-react'
import EventModal from './EventModal'
import EventDetailModal from './EventDetailModal'
import AttendanceModal from './AttendanceModal'
import Swal from 'sweetalert2'

// Helper function để dịch status sang tiếng Việt
const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    UPCOMING: 'Sắp diễn ra',
    OPEN: 'Đang mở',
    ONGOING: 'Đang diễn ra',
    ENDED: 'Đã kết thúc',
    CANCELLED: 'Đã hủy'
  }
  return statusMap[status] || status
}

// Helper function để dịch approval status sang tiếng Việt
const translateApprovalStatus = (status: string): string => {
  const approvalMap: Record<string, string> = {
    WAITING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối'
  }
  return approvalMap[status] || status
}

const ManageEvents = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null)
  const [attendanceEvent, setAttendanceEvent] = useState<Event | null>(null)
  const [searchTitle, setSearchTitle] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterApproval, setFilterApproval] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const { loading, error, data, refetch } = useQuery(GET_ALL_EVENTS)

  const [deleteEvent] = useMutation(DELETE_EVENT, {
    onCompleted: async () => {
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Xóa sự kiện thành công!',
        showConfirmButton: false,
        timer: 1500
      })
      refetch()
    }
  })

  const [approveEvent] = useMutation(APPROVE_EVENT, {
    onCompleted: async () => {
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật trạng thái phê duyệt thành công!',
        showConfirmButton: false,
        timer: 1500
      })
      refetch()
    }
  })

  const [advanceStatus] = useMutation(ADVANCE_STATUS, {
    onCompleted: async () => {
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Chuyển trạng thái thành công!',
        showConfirmButton: false,
        timer: 1500
      })
      refetch()
    }
  })

  const [cancelEvent] = useMutation(CANCEL_EVENT, {
    onCompleted: async () => {
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Hủy sự kiện thành công!',
        showConfirmButton: false,
        timer: 1500
      })
      refetch()
    }
  })

  // Filter và sắp xếp với useMemo để đảm bảo re-render
  const filteredEvents = useMemo(() => {
    const events: Event[] = (data as { events: Event[] })?.events || []

    return events
      .filter((event) => {
        const matchTitle = event.title.toLowerCase().includes(searchTitle.toLowerCase())
        const matchStatus = !filterStatus || event.current_status === filterStatus
        const matchApproval = !filterApproval || event.current_approval_status === filterApproval
        return matchTitle && matchStatus && matchApproval
      })
      .sort((a, b) => {
        // Sắp xếp theo ngày sự kiện từ lớn đến nhỏ (xa nhất trước)
        const dateA = new Date(a.start_date).getTime()
        const dateB = new Date(b.start_date).getTime()

        return dateB - dateA // Giảm dần (ngày lớn trước, ngày nhỏ sau)
      })
  }, [data, searchTitle, filterStatus, filterApproval])

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage)

  const handleSearch = () => {
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa sự kiện này?',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    })

    if (result.isConfirmed) {
      try {
        await deleteEvent({ variables: { id } })
      } catch (err: unknown) {
        const errorMessage = (err as any)?.errors?.[0]?.details?.message || 'Không thể xóa sự kiện. Vui lòng thử lại.'
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'Đóng'
        })
      }
    }
  }

  const handleApprove = async (id: string, status: string) => {
    const isApprove = status === 'APPROVED'
    const result = await Swal.fire({
      icon: 'question',
      title: 'Xác nhận',
      text: isApprove ? 'Bạn có chắc chắn muốn phê duyệt sự kiện này?' : 'Bạn có chắc chắn muốn từ chối sự kiện này?',
      showCancelButton: true,
      confirmButtonText: isApprove ? 'Phê duyệt' : 'Từ chối',
      cancelButtonText: 'Hủy',
      confirmButtonColor: isApprove ? '#16a34a' : '#dc2626',
      cancelButtonColor: '#6b7280'
    })

    if (result.isConfirmed) {
      try {
        await approveEvent({ variables: { id, status } })
      } catch (err: unknown) {
        const errorMessage = (err as any)?.errors?.[0]?.details?.message || 'Không thể cập nhật trạng thái phê duyệt.'
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'Đóng'
        })
      }
    }
  }

  const handleAdvanceStatus = async (id: string) => {
    const result = await Swal.fire({
      icon: 'info',
      title: 'Xác nhận',
      text: 'Chuyển sang trạng thái tiếp theo?',
      showCancelButton: true,
      confirmButtonText: 'Chuyển',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280'
    })

    if (result.isConfirmed) {
      try {
        await advanceStatus({ variables: { id } })
      } catch (err: unknown) {
        const errorMessage = (err as any)?.errors?.[0]?.details?.message || 'Không thể chuyển trạng thái.'
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'Đóng'
        })
      }
    }
  }

  const handleCancelEvent = async (id: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Xác nhận hủy sự kiện',
      text: 'Bạn có chắc chắn muốn hủy sự kiện này?',
      showCancelButton: true,
      confirmButtonText: 'Hủy sự kiện',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#6b7280'
    })

    if (result.isConfirmed) {
      try {
        await cancelEvent({ variables: { id } })
      } catch (err: unknown) {
        const errorMessage = (err as any)?.errors?.[0]?.details?.message || 'Không thể hủy sự kiện.'
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'Đóng'
        })
      }
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEvent(null)
    refetch()
  }

  if (loading) return <div className='p-8'>Đang tải...</div>
  if (error) return <div className='p-8 text-red-500'>Lỗi: {error.message}</div>

  return (
    <div className='p-8 bg-gray-50 min-h-screen'>
      {/* Search Section */}
      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <h2 className='text-xl font-bold text-gray-800 mb-4'>Tìm kiếm sự kiện</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Tên sự kiện</label>
            <input
              type='text'
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder='Nhập tên sự kiện...'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Tất cả</option>
              <option value='UPCOMING'>Sắp diễn ra</option>
              <option value='OPEN'>Đang mở</option>
              <option value='ONGOING'>Đang diễn ra</option>
              <option value='ENDED'>Đã kết thúc</option>
              <option value='CANCELLED'>Đã hủy</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Phê duyệt</label>
            <select
              value={filterApproval}
              onChange={(e) => setFilterApproval(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Tất cả</option>
              <option value='WAITING'>Chờ duyệt</option>
              <option value='APPROVED'>Đã duyệt</option>
              <option value='REJECTED'>Từ chối</option>
            </select>
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <button
            onClick={handleSearch}
            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2'
          >
            <RotateCw className='w-5 h-5' />
            Làm mới
          </button>
          <button
            onClick={handleAddNew}
            className='px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2'
          >
            <Plus className='w-5 h-5' />
            Thêm sự kiện mới
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-blue-600 text-white'>
              <tr>
                <th className='px-6 py-4 text-left text-sm font-semibold'>STT</th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>Tên sự kiện</th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>Địa điểm</th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>Thời gian</th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>Trạng thái</th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>Phê duyệt</th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>Hành động</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {paginatedEvents.map((event, index) => (
                <tr key={event.id} className='hover:bg-gray-50 transition-colors'>
                  <td className='px-6 py-4 text-sm text-gray-800'>{startIndex + index + 1}</td>
                  <td className='px-6 py-4 text-sm font-medium text-gray-900'>{event.title}</td>
                  <td className='px-6 py-4 text-sm text-gray-800'>{event.location?.name || 'N/A'}</td>
                  <td className='px-6 py-4 text-sm text-gray-800'>
                    {new Date(event.start_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.current_status === 'COMPLETED' || event.current_status === 'ENDED'
                          ? 'bg-green-100 text-green-700'
                          : event.current_status === 'ONGOING'
                            ? 'bg-blue-100 text-blue-700'
                            : event.current_status === 'CANCELLED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {translateStatus(event.current_status)}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.current_approval_status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : event.current_approval_status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {translateApprovalStatus(event.current_approval_status)}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex gap-2 flex-wrap'>
                      {/* Xem chi tiết - luôn có */}
                      <button
                        onClick={() => setViewingEvent(event)}
                        className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                        title='Xem chi tiết'
                      >
                        <Eye className='w-5 h-5' />
                      </button>

                      {/* Điểm danh - chỉ hiện khi sự kiện đang diễn ra */}
                      {event.current_status === 'ONGOING' && (
                        <button
                          onClick={() => setAttendanceEvent(event)}
                          className='p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors'
                          title='Điểm danh'
                        >
                          <ClipboardCheck className='w-5 h-5' />
                        </button>
                      )}

                      {/* Phê duyệt/Từ chối - chỉ hiện khi WAITING (backend dùng WAITING chứ không phải PENDING) */}
                      {event.current_approval_status === 'WAITING' && (
                        <>
                          <button
                            onClick={() => handleApprove(event.id, 'APPROVED')}
                            className='p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors'
                            title='Phê duyệt'
                          >
                            <CheckCircle className='w-5 h-5' />
                          </button>
                          <button
                            onClick={() => handleApprove(event.id, 'REJECTED')}
                            className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors'
                            title='Từ chối'
                          >
                            <XCircle className='w-5 h-5' />
                          </button>
                        </>
                      )}

                      {/* Chuyển trạng thái - chỉ khi APPROVED và chưa ENDED/CANCELLED */}
                      {event.current_approval_status === 'APPROVED' &&
                        event.current_status !== 'ENDED' &&
                        event.current_status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleAdvanceStatus(event.id)}
                            className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors'
                            title='Chuyển trạng thái'
                          >
                            <PlayCircle className='w-5 h-5' />
                          </button>
                        )}

                      {/* Hủy sự kiện - chỉ khi APPROVED và chưa CANCELLED/ENDED (có thể hủy ngay cả khi ONGOING vì sự cố khẩn cấp) */}
                      {event.current_approval_status === 'APPROVED' &&
                        event.current_status !== 'CANCELLED' &&
                        event.current_status !== 'ENDED' && (
                          <button
                            onClick={() => handleCancelEvent(event.id)}
                            className='p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors'
                            title='Hủy sự kiện'
                          >
                            <Ban className='w-5 h-5' />
                          </button>
                        )}

                      {/* Sửa - chỉ khi chưa diễn ra (WAITING hoặc APPROVED nhưng chưa ONGOING/ENDED/CANCELLED) */}
                      {(event.current_approval_status === 'WAITING' ||
                        (event.current_approval_status === 'APPROVED' &&
                          event.current_status !== 'ONGOING' &&
                          event.current_status !== 'ENDED' &&
                          event.current_status !== 'CANCELLED')) && (
                        <button
                          onClick={() => handleEdit(event)}
                          className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors'
                          title='Sửa'
                        >
                          <Edit2 className='w-5 h-5' />
                        </button>
                      )}

                      {/* Xóa - chỉ khi chưa phê duyệt */}
                      {event.current_approval_status !== 'APPROVED' && (
                        <button
                          onClick={() => handleDelete(event.id)}
                          className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors'
                          title='Xóa'
                        >
                          <Trash2 className='w-5 h-5' />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center'>
          <div className='text-sm text-gray-600'>
            Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredEvents.length)} trong tổng số{' '}
            {filteredEvents.length} sự kiện
          </div>
          <div className='flex gap-2'>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold'
            >
              Trước
            </button>
            <span className='px-4 py-2 text-gray-700 font-semibold'>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold'
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && <EventModal event={editingEvent} onClose={handleCloseModal} />}
      {viewingEvent && <EventDetailModal event={viewingEvent} onClose={() => setViewingEvent(null)} />}
      {attendanceEvent && <AttendanceModal event={attendanceEvent} onClose={() => setAttendanceEvent(null)} />}
    </div>
  )
}

export default ManageEvents
