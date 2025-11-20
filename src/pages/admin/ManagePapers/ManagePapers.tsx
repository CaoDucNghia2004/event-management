import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_PAPERS } from '../../../graphql/queries/paperQueries'
import { DELETE_PAPER } from '../../../graphql/mutations/paperMutations'
import type { PapersResponse, Paper } from '../../../types/paper.types'
import { Edit2, Trash2, Plus, Eye, FileText, Download } from 'lucide-react'
import PaperModal from './PaperModal'
import PaperDetailModal from './PaperDetailModal'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../../store/useAuthStore'

const ManagePapers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null)
  const [viewingPaper, setViewingPaper] = useState<Paper | null>(null)
  const [searchTitle, setSearchTitle] = useState('')
  const [filterEvent, setFilterEvent] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Lấy thông tin user để kiểm tra role
  const { user } = useAuthStore()
  const isAdmin = user?.roles?.includes('ADMIN')
  const userEmail = user?.email

  const { loading, error, data, refetch } = useQuery<PapersResponse>(GET_PAPERS)

  const [deletePaper] = useMutation(DELETE_PAPER, {
    onCompleted: async () => {
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Xóa bài báo thành công!',
        showConfirmButton: false,
        timer: 1500
      })
      refetch()
    }
  })

  const handleDelete = async (_id: string, title: string) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      html: `Bạn có chắc chắn muốn xóa bài báo:<br/><strong>${title}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    })

    if (result.isConfirmed) {
      try {
        await deletePaper({ variables: { _id } })
        // onCompleted callback sẽ xử lý success message
      } catch (err) {
        // Xử lý lỗi thật sự
        const error = err as { graphQLErrors?: Array<{ details?: { message?: string } }>; message?: string }
        const errorMsg = error.graphQLErrors?.[0]?.details?.message || error.message || ''

        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMsg || 'Không thể xóa bài báo. Vui lòng thử lại.',
          confirmButtonText: 'Đóng'
        })
      }
    }
  }

  const handleEdit = (paper: Paper) => {
    setEditingPaper(paper)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPaper(null)
    refetch()
  }

  // Filter and sort papers
  const filteredPapers = data?.papers
    .filter((paper) => {
      // Lọc theo role: ADMIN xem tất cả, ORGANIZER chỉ xem papers của events họ tạo
      const matchRole = isAdmin || paper.event?.created_by === userEmail

      const matchesTitle = paper.title.toLowerCase().includes(searchTitle.toLowerCase())
      const matchesEvent = filterEvent === '' || paper.event_id === filterEvent
      return matchRole && matchesTitle && matchesEvent
    })
    .sort((a, b) => {
      // Sắp xếp theo ngày tạo từ mới đến cũ (mới nhất trước)
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA // Giảm dần (mới nhất trước)
    })

  // Pagination
  const totalPages = Math.ceil((filteredPapers?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPapers = filteredPapers?.slice(startIndex, startIndex + itemsPerPage)

  // Get unique events for filter - loại bỏ duplicate bằng cách dùng Map với event_id làm key
  const eventsMap = new Map()
  data?.papers.forEach((paper) => {
    if (paper.event && !eventsMap.has(paper.event_id)) {
      eventsMap.set(paper.event_id, paper.event)
    }
  })
  const events = Array.from(eventsMap.values())

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>Lỗi: {error.message}</div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
            <FileText className='w-8 h-8 text-blue-600' />
            Quản lý Bài Báo
          </h1>
          <p className='text-gray-600 mt-1'>Quản lý bài báo khoa học của các sự kiện</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className='flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md'
        >
          <Plus className='w-5 h-5' />
          Thêm Bài Báo
        </button>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Tìm kiếm theo tiêu đề</label>
            <input
              type='text'
              value={searchTitle}
              onChange={(e) => {
                setSearchTitle(e.target.value)
                setCurrentPage(1)
              }}
              placeholder='Nhập tiêu đề bài báo...'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Lọc theo sự kiện</label>
            <select
              value={filterEvent}
              onChange={(e) => {
                setFilterEvent(e.target.value)
                setCurrentPage(1)
              }}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value=''>Tất cả sự kiện</option>
              {events.map((event) => {
                // Tìm paper đầu tiên có event này để lấy event_id
                const paperWithEvent = data?.papers.find((p) => p.event?.id === event?.id)
                return (
                  <option key={event?.id} value={paperWithEvent?.event_id || event?.id}>
                    {event?.title}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <FileText className='w-5 h-5 text-blue-600' />
            <span className='text-gray-700 font-medium'>
              Tổng số bài báo: <span className='text-blue-600 font-bold'>{filteredPapers?.length || 0}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-blue-600 text-white'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider'>Tiêu đề</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider'>Tác giả</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider'>Sự kiện</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider'>Thống kê</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider'>Ngày tạo</th>
                <th className='px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider'>Thao tác</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {paginatedPapers?.map((paper) => (
                <tr key={paper._id} className='hover:bg-gray-50 transition-colors'>
                  <td className='px-6 py-4'>
                    <div className='flex items-start gap-2'>
                      <FileText className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                      <div>
                        <div className='text-sm font-medium text-gray-900'>{paper.title}</div>
                        {paper.category && (
                          <span className='inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded'>
                            {paper.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {paper.author.slice(0, 2).join(', ')}
                      {paper.author.length > 2 && ` +${paper.author.length - 2}`}
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='text-sm text-gray-900'>{paper.event?.title || 'N/A'}</div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-1 text-xs text-gray-600'>
                        <Eye className='w-3.5 h-3.5' />
                        <span>{paper.view} lượt xem</span>
                      </div>
                      <div className='flex items-center gap-1 text-xs text-gray-600'>
                        <Download className='w-3.5 h-3.5' />
                        <span>{paper.download} lượt tải</span>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-500'>
                    {new Date(paper.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <button
                        onClick={() => setViewingPaper(paper)}
                        className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors'
                        title='Xem chi tiết'
                      >
                        <Eye className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleEdit(paper)}
                        className='p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors'
                        title='Sửa'
                      >
                        <Edit2 className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleDelete(paper._id, paper.title)}
                        className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors'
                        title='Xóa'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {paginatedPapers?.length === 0 && (
          <div className='text-center py-12'>
            <FileText className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500 text-lg'>Không tìm thấy bài báo nào</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredPapers?.length || 0)} trong tổng{' '}
              {filteredPapers?.length || 0} bài báo
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Trước
              </button>
              <span className='px-4 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-600 font-medium'>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && <PaperModal paper={editingPaper} onClose={handleCloseModal} />}
      {viewingPaper && <PaperDetailModal paper={viewingPaper} onClose={() => setViewingPaper(null)} />}
    </div>
  )
}

export default ManagePapers
