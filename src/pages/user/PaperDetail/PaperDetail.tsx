import { useQuery, useMutation } from '@apollo/client/react'
import { useParams, Link, useNavigate } from 'react-router'
import { ArrowLeft, Calendar, Download, Eye, FileText, Users } from 'lucide-react'
import { GET_PAPER_BY_ID } from '../../../graphql/queries/paperQueries'
import { UPDATE_PAPER } from '../../../graphql/mutations/paperMutations'
import type { PaperResponse } from '../../../types/paper.types'
import config from '../../../constants/config'

export default function PaperDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, loading, error } = useQuery<PaperResponse>(GET_PAPER_BY_ID, {
    variables: { _id: id }
  })
  const [updatePaper] = useMutation(UPDATE_PAPER)

  // Xem trước PDF trong tab mới
  const handlePreview = async () => {
    if (!data?.paper?.file_url || !data?.paper?._id) return

    // Tăng view count bằng GraphQL mutation (async, không chờ response)
    const currentView = data.paper.view || 0
    updatePaper({
      variables: {
        input: {
          _id: data.paper._id,
          view: currentView + 1
        }
      }
    }).catch((err) => {
      console.error('❌ Failed to increment view count:', err)
    })

    // Mở PDF trong tab mới
    const fileUrl = data.paper.file_url.startsWith('http')
      ? data.paper.file_url
      : `${config.baseUrl}${data.paper.file_url}`
    window.open(fileUrl, '_blank')
  }

  // Tải xuống PDF (tăng download count)
  const handleDownload = async () => {
    if (!data?.paper?._id) return

    try {
      // Gọi API download - tự động tăng download count
      const downloadUrl = `${config.baseUrl}/api/v1/download/paper/${data.paper._id}`
      console.log('📥 Downloading from:', downloadUrl)

      // Tạo link ẩn để download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', '') // Trigger download

      // Thêm token vào header nếu cần authentication
      const token = localStorage.getItem('access_token')
      if (token) {
        console.log('🔑 Using token for download')
        // Sử dụng fetch để download với authentication
        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        console.log('📡 Download response status:', response.status)
        console.log('📡 Download response headers:', response.headers)
        console.log('📡 Download response content-type:', response.headers.get('content-type'))

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Download failed - Response:', errorText)
          throw new Error('Download failed')
        }

        // Lấy blob từ response
        const blob = await response.blob()
        console.log('✅ Download successful, blob size:', blob.size)

        // Tạo URL từ blob
        const blobUrl = window.URL.createObjectURL(blob)

        // Download file
        link.href = blobUrl
        link.download = `${data.paper.title}.pdf`
        document.body.appendChild(link)
        link.click()

        // Cleanup
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      } else {
        console.log('⚠️ No token, opening directly')
        // Nếu không có token, mở trực tiếp
        window.open(downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('❌ Download error:', error)
      alert('Không thể tải xuống bài báo. Vui lòng thử lại!')
    }
  }

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex justify-center items-center min-h-[400px]'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      </div>
    )
  }

  if (error || !data?.paper) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {error ? `Lỗi: ${error.message}` : 'Không tìm thấy bài báo'}
        </div>
        <button
          onClick={() => navigate('/papers')}
          className='mt-4 text-blue-600 hover:text-blue-700 flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Quay lại danh sách
        </button>
      </div>
    )
  }

  const paper = data.paper

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8 max-w-5xl'>
        {/* Back Button */}
        <button
          onClick={() => navigate('/papers')}
          className='mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors group'
        >
          <ArrowLeft className='h-4 w-4 group-hover:-translate-x-1 transition-transform' />
          <span className='text-sm font-medium'>Quay lại danh sách bài báo</span>
        </button>

        {/* Header Card */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6'>
          <div className='p-6 md:p-8'>
            {/* Category Badge */}
            {paper.category && (
              <span className='inline-block px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md mb-4'>
                {paper.category}
              </span>
            )}

            {/* Title */}
            <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight'>{paper.title}</h1>

            {/* Authors */}
            <div className='flex items-start gap-3 mb-6 p-5 bg-blue-50 rounded-lg border border-blue-100'>
              <Users className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
              <div className='flex-1'>
                <p className='text-xs font-semibold text-blue-900 mb-2 uppercase tracking-wide'>Tác giả</p>
                <p className='text-base text-gray-900 font-medium leading-relaxed'>{paper.author.join(', ')}</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className='flex items-center gap-6 mb-4'>
              <div className='flex items-center gap-2'>
                <Eye className='h-5 w-5 text-gray-400' />
                <span className='text-2xl font-bold text-gray-900'>{paper.view}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Download className='h-5 w-5 text-gray-400' />
                <span className='text-2xl font-bold text-gray-900'>{paper.download}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {paper.abstract && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6'>
            <div className='flex items-center gap-2 mb-5'>
              <FileText className='h-5 w-5 text-blue-600' />
              <h2 className='text-xl font-bold text-gray-900'>Nội dung</h2>
            </div>
            <div className='bg-gray-50 rounded-lg p-6 border border-gray-200'>
              <p className='text-base text-gray-700 leading-relaxed whitespace-pre-line'>{paper.abstract}</p>
            </div>
          </div>
        )}

        {/* Keywords Section */}
        {paper.keywords && paper.keywords.length > 0 && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6'>
            <p className='text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide'>Từ khóa</p>
            <div className='flex flex-wrap gap-2'>
              {paper.keywords.map((keyword, index) => (
                <span key={index} className='px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg'>
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Language & Date Section */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          {paper.language && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <p className='text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide'>Ngôn ngữ</p>
              <p className='text-xl text-gray-900 font-bold'>{paper.language}</p>
            </div>
          )}
          {paper.created_at && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <p className='text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide'>Ngày đăng</p>
              <p className='text-xl text-gray-900 font-bold'>
                {new Date(paper.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
          )}
        </div>

        {/* Event Details */}
        {paper.event && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-5 flex items-center gap-2'>
              <Calendar className='h-5 w-5 text-blue-600' />
              Sự kiện liên quan
            </h3>
            <div className='space-y-4'>
              <div className='bg-blue-50 p-5 rounded-lg border border-blue-100'>
                <span className='text-xs font-bold text-blue-900 uppercase tracking-wide'>Tên sự kiện</span>
                <Link
                  to={`/events/${paper.event.id}`}
                  className='block text-lg text-blue-600 hover:text-blue-700 font-bold mt-2 hover:underline transition-colors'
                >
                  {paper.event.title} →
                </Link>
              </div>
              {paper.event.description && (
                <div className='bg-gray-50 p-5 rounded-lg border border-gray-200'>
                  <span className='text-xs font-bold text-gray-700 uppercase tracking-wide'>Mô tả</span>
                  <p className='text-sm text-gray-700 mt-2 leading-relaxed'>{paper.event.description}</p>
                </div>
              )}
              {paper.event.start_date && paper.event.end_date && (
                <div className='bg-gray-50 p-5 rounded-lg border border-gray-200'>
                  <span className='text-xs font-bold text-gray-700 uppercase tracking-wide'>Thời gian</span>
                  <p className='text-base text-gray-900 font-semibold mt-2'>
                    {new Date(paper.event.start_date).toLocaleDateString('vi-VN')} -{' '}
                    {new Date(paper.event.end_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}

              {/* Button to view event */}
              <Link
                to={`/events/${paper.event.id}`}
                className='inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-md'
              >
                <Calendar className='h-4 w-4' />
                Xem chi tiết sự kiện
              </Link>
            </div>
          </div>
        )}

        {/* Preview & Download Buttons */}
        {paper.file_url && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center'>
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              {/* Nút Xem trước */}
              <button
                onClick={handlePreview}
                className='group inline-flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-base font-bold rounded-lg shadow-md hover:shadow-lg transition-all'
              >
                <Eye className='h-5 w-5' />
                Xem trước PDF
              </button>

              {/* Nút Tải xuống */}
              <button
                onClick={handleDownload}
                className='group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-lg shadow-md hover:shadow-lg transition-all'
              >
                <Download className='h-5 w-5' />
                Tải xuống bài báo
              </button>
            </div>
            <p className='text-sm text-gray-500 mt-4'>File PDF • Xem trước hoặc tải xuống</p>
          </div>
        )}
      </div>
    </div>
  )
}
