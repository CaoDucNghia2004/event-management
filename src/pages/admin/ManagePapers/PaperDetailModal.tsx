import type { Paper } from '../../../types/paper.types'
import { X, FileText, Eye, Download, Calendar, User, Tag, Globe } from 'lucide-react'
import config from '../../../constants/config'
import { useMutation } from '@apollo/client/react'
import { UPDATE_PAPER } from '../../../graphql/mutations/paperMutations'

interface PaperDetailModalProps {
  paper: Paper
  onClose: () => void
}

export default function PaperDetailModal({ paper, onClose }: PaperDetailModalProps) {
  const [updatePaper] = useMutation(UPDATE_PAPER)

  const handlePreview = async () => {
    if (!paper.file_url) return

    // Admin xem trước không tăng view count
    // Mở PDF trong tab mới
    const fileUrl = paper.file_url.startsWith('http') ? paper.file_url : `${config.baseUrl}${paper.file_url}`
    window.open(fileUrl, '_blank')
  }

  const handleDownload = async () => {
    if (!paper.file_url) return

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${config.baseUrl}/api/v1/download/paper/${paper._id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${paper.title}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Không thể tải file. Vui lòng thử lại.')
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn'>
      <div className='absolute inset-0 bg-gray-900/30 backdrop-blur-sm' onClick={onClose}></div>
      <div className='relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            <FileText className='w-6 h-6 text-blue-600' />
            Chi tiết Bài Báo
          </h2>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <X className='w-6 h-6 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Title */}
          <div>
            <h3 className='text-2xl font-bold text-gray-900'>{paper.title}</h3>
            {paper.category && (
              <span className='inline-block mt-2 px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full'>
                {paper.category}
              </span>
            )}
          </div>

          {/* Abstract */}
          {paper.abstract && (
            <div className='bg-gray-50 rounded-lg p-4'>
              <h4 className='font-semibold text-gray-900 mb-2'>Tóm tắt</h4>
              <p className='text-gray-700 leading-relaxed'>{paper.abstract}</p>
            </div>
          )}

          {/* Authors */}
          <div className='flex items-start gap-3'>
            <User className='w-5 h-5 text-gray-500 mt-0.5' />
            <div>
              <h4 className='font-semibold text-gray-900 mb-1'>Tác giả</h4>
              <div className='flex flex-wrap gap-2'>
                {paper.author.map((author, index) => (
                  <span key={index} className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm'>
                    {author}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Event */}
          {paper.event && (
            <div className='flex items-start gap-3'>
              <Calendar className='w-5 h-5 text-gray-500 mt-0.5' />
              <div>
                <h4 className='font-semibold text-gray-900 mb-1'>Sự kiện</h4>
                <p className='text-gray-700'>{paper.event.title}</p>
              </div>
            </div>
          )}

          {/* Language */}
          {paper.language && (
            <div className='flex items-start gap-3'>
              <Globe className='w-5 h-5 text-gray-500 mt-0.5' />
              <div>
                <h4 className='font-semibold text-gray-900 mb-1'>Ngôn ngữ</h4>
                <p className='text-gray-700'>{paper.language}</p>
              </div>
            </div>
          )}

          {/* Keywords */}
          {paper.keywords && paper.keywords.length > 0 && (
            <div className='flex items-start gap-3'>
              <Tag className='w-5 h-5 text-gray-500 mt-0.5' />
              <div>
                <h4 className='font-semibold text-gray-900 mb-1'>Từ khóa</h4>
                <div className='flex flex-wrap gap-2'>
                  {paper.keywords.map((keyword, index) => (
                    <span key={index} className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'>
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-blue-50 rounded-lg p-4'>
              <div className='flex items-center gap-2 text-blue-600 mb-1'>
                <Eye className='w-5 h-5' />
                <span className='font-semibold'>Lượt xem</span>
              </div>
              <p className='text-2xl font-bold text-blue-700'>{paper.view}</p>
            </div>
            <div className='bg-green-50 rounded-lg p-4'>
              <div className='flex items-center gap-2 text-green-600 mb-1'>
                <Download className='w-5 h-5' />
                <span className='font-semibold'>Lượt tải</span>
              </div>
              <p className='text-2xl font-bold text-green-700'>{paper.download}</p>
            </div>
          </div>

          {/* PDF Actions */}
          {paper.file_url && (
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100'>
              <h4 className='font-semibold text-gray-900 mb-4 text-center'>File PDF</h4>
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <button
                  onClick={handlePreview}
                  className='flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md'
                >
                  <Eye className='w-5 h-5' />
                  Xem trước PDF
                </button>
                <button
                  onClick={handleDownload}
                  className='flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md'
                >
                  <Download className='w-5 h-5' />
                  Tải xuống
                </button>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className='text-sm text-gray-500 border-t border-gray-200 pt-4'>
            <p>Ngày tạo: {new Date(paper.created_at).toLocaleString('vi-VN')}</p>
            <p>Cập nhật: {new Date(paper.updated_at).toLocaleString('vi-VN')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className='sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4'>
          <button
            onClick={onClose}
            className='w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
