import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { CREATE_PAPER, UPDATE_PAPER } from '../../../graphql/mutations/paperMutations'
import { GET_ALL_EVENTS } from '../../../graphql/queries/eventQueries'
import type { Paper } from '../../../types/paper.types'
import type { EventsData } from '../../../types/event.types'
import { X, Upload, FileText, Eye } from 'lucide-react'
import Swal from 'sweetalert2'
import config from '../../../constants/config'

interface PaperModalProps {
  paper: Paper | null
  onClose: () => void
}

export default function PaperModal({ paper, onClose }: PaperModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    author: [''],
    event_id: '',
    file_url: '',
    category: '',
    language: '',
    keywords: ['']
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [removePdf, setRemovePdf] = useState(false) // Flag để xóa PDF

  const { data: eventsData } = useQuery<EventsData>(GET_ALL_EVENTS)

  useEffect(() => {
    if (paper) {
      setFormData({
        title: paper.title,
        abstract: paper.abstract || '',
        author: paper.author.length > 0 ? paper.author : [''],
        event_id: paper.event_id,
        file_url: paper.file_url || '',
        category: paper.category || '',
        language: paper.language || '',
        keywords: paper.keywords && paper.keywords.length > 0 ? paper.keywords : ['']
      })
      setPdfFile(null)
      setRemovePdf(false)
    } else {
      // Reset form khi tạo mới
      setFormData({
        title: '',
        abstract: '',
        author: [''],
        event_id: '',
        file_url: '',
        category: '',
        language: '',
        keywords: ['']
      })
      setPdfFile(null)
      setRemovePdf(false)
    }
  }, [paper])

  const [createPaper, { loading: creating }] = useMutation(CREATE_PAPER)
  const [updatePaper, { loading: updating }] = useMutation(UPDATE_PAPER)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Chỉ chấp nhận file PDF!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Kích thước file không được vượt quá 10MB!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    // Chỉ lưu file, chưa upload (sẽ upload sau khi tạo/update paper)
    setPdfFile(file)
  }

  const handlePreviewPdf = () => {
    if (!pdfFile) return

    // Tạo URL tạm từ file để preview
    const fileUrl = URL.createObjectURL(pdfFile)
    window.open(fileUrl, '_blank')

    // Cleanup URL sau 1 phút để tránh memory leak
    setTimeout(() => URL.revokeObjectURL(fileUrl), 60000)
  }

  const handleRemovePdf = () => {
    Swal.fire({
      title: 'Xác nhận xóa file PDF?',
      text: 'File PDF sẽ bị xóa khỏi bài báo này.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData((prev) => ({ ...prev, file_url: '' }))
        setPdfFile(null)
        setRemovePdf(true) // Đánh dấu để xóa file khi submit
      }
    })
  }

  const uploadPdfFile = async (paperId: string, file: File): Promise<void> => {
    const formDataUpload = new FormData()
    formDataUpload.append('pdf', file)
    formDataUpload.append('paper_id', paperId)

    const token = localStorage.getItem('access_token')
    const response = await fetch(`${config.baseUrl}/api/v1/upload/pages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formDataUpload
    })

    const result = await response.json()

    if (result.status !== 200) {
      throw new Error(result.message || 'Upload file PDF thất bại')
    }

    console.log('✅ Upload PDF thành công:', result.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      Swal.fire({ icon: 'error', title: 'Lỗi!', text: 'Vui lòng nhập tiêu đề!', confirmButtonText: 'Đóng' })
      return
    }

    const validAuthors = formData.author.filter((a) => a.trim() !== '')
    if (validAuthors.length === 0) {
      Swal.fire({ icon: 'error', title: 'Lỗi!', text: 'Vui lòng nhập ít nhất 1 tác giả!', confirmButtonText: 'Đóng' })
      return
    }

    if (!formData.event_id) {
      Swal.fire({ icon: 'error', title: 'Lỗi!', text: 'Vui lòng chọn sự kiện!', confirmButtonText: 'Đóng' })
      return
    }

    try {
      setUploading(true)

      const validKeywords = formData.keywords.filter((k) => k.trim() !== '')

      const input = {
        title: formData.title.trim(),
        abstract: formData.abstract.trim() || undefined,
        author: validAuthors,
        event_id: formData.event_id,
        file_url: removePdf ? null : formData.file_url || undefined, // Nếu xóa PDF thì set null
        category: formData.category.trim() || undefined,
        language: formData.language.trim() || undefined,
        keywords: validKeywords.length > 0 ? validKeywords : undefined
      }

      let paperId: string

      if (paper) {
        // Update existing paper
        console.log('🔄 Updating paper:', paper._id)
        const result = await updatePaper({ variables: { input: { _id: paper._id, ...input } } })
        paperId = (result.data as { updatePaper?: { _id: string } })?.updatePaper?._id || paper._id
      } else {
        // Create new paper (không có file_url)
        console.log('➕ Creating new paper')
        const result = await createPaper({ variables: { input } })
        paperId = (result.data as { createPaper?: { _id: string } })?.createPaper?._id || ''

        if (!paperId) {
          throw new Error('Không thể tạo bài báo')
        }
      }

      // Upload PDF SAU KHI đã có paper_id (nếu có file mới)
      if (pdfFile && paperId) {
        console.log('📤 Uploading PDF for paper:', paperId)
        await uploadPdfFile(paperId, pdfFile)
        // Backend tự động update file_url vào paper, không cần gọi updatePaper nữa
      }

      // Success
      setUploading(false)
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: paper ? 'Cập nhật bài báo thành công!' : 'Tạo bài báo thành công!',
        showConfirmButton: false,
        timer: 1500
      })
      onClose()
    } catch (error: unknown) {
      console.error('Submit error:', error)

      // Hiển thị lỗi chi tiết từ backend
      const err = error as { graphQLErrors?: Array<{ message: string }>; message?: string }
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Có lỗi xảy ra. Vui lòng thử lại.'

      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: errorMessage,
        confirmButtonText: 'Đóng'
      })

      setUploading(false)
    }
  }

  const addAuthor = () => {
    setFormData((prev) => ({ ...prev, author: [...prev.author, ''] }))
  }

  const removeAuthor = (index: number) => {
    setFormData((prev) => ({ ...prev, author: prev.author.filter((_, i) => i !== index) }))
  }

  const updateAuthor = (index: number, value: string) => {
    setFormData((prev) => {
      const newAuthors = [...prev.author]
      newAuthors[index] = value
      return { ...prev, author: newAuthors }
    })
  }

  const addKeyword = () => {
    setFormData((prev) => ({ ...prev, keywords: [...prev.keywords, ''] }))
  }

  const removeKeyword = (index: number) => {
    setFormData((prev) => ({ ...prev, keywords: prev.keywords.filter((_, i) => i !== index) }))
  }

  const updateKeyword = (index: number, value: string) => {
    setFormData((prev) => {
      const newKeywords = [...prev.keywords]
      newKeywords[index] = value
      return { ...prev, keywords: newKeywords }
    })
  }

  const loading = creating || updating

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn'>
      <div className='absolute inset-0 bg-gray-900/30 backdrop-blur-sm' onClick={onClose}></div>
      <div className='relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            <FileText className='w-6 h-6 text-blue-600' />
            {paper ? 'Sửa Bài Báo' : 'Thêm Bài Báo Mới'}
          </h2>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <X className='w-6 h-6 text-gray-500' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Title */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Tiêu đề <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Nhập tiêu đề bài báo...'
              required
            />
          </div>

          {/* Abstract */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Tóm tắt</label>
            <textarea
              value={formData.abstract}
              onChange={(e) => setFormData((prev) => ({ ...prev, abstract: e.target.value }))}
              rows={4}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Nhập tóm tắt bài báo...'
            />
          </div>

          {/* Authors */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Tác giả <span className='text-red-500'>*</span>
            </label>
            <div className='space-y-2'>
              {formData.author.map((author, index) => (
                <div key={index} className='flex gap-2'>
                  <input
                    type='text'
                    value={author}
                    onChange={(e) => updateAuthor(index, e.target.value)}
                    className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder={`Tác giả ${index + 1}...`}
                  />
                  {formData.author.length > 1 && (
                    <button
                      type='button'
                      onClick={() => removeAuthor(index)}
                      className='px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors'
                    >
                      <X className='w-5 h-5' />
                    </button>
                  )}
                </div>
              ))}
              <button
                type='button'
                onClick={addAuthor}
                className='text-blue-600 hover:text-blue-700 text-sm font-medium'
              >
                + Thêm tác giả
              </button>
            </div>
          </div>

          {/* Event */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Sự kiện <span className='text-red-500'>*</span>
            </label>
            <select
              value={formData.event_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, event_id: e.target.value }))}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required
            >
              <option value=''>-- Chọn sự kiện --</option>
              {eventsData?.events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          {/* Category & Language */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Danh mục</label>
              <input
                type='text'
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='VD: Khoa học máy tính, AI, IoT...'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Ngôn ngữ</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>-- Chọn ngôn ngữ --</option>
                <option value='Tiếng Việt'>Tiếng Việt</option>
                <option value='English'>English</option>
              </select>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Từ khóa</label>
            <div className='space-y-2'>
              {formData.keywords.map((keyword, index) => (
                <div key={index} className='flex gap-2'>
                  <input
                    type='text'
                    value={keyword}
                    onChange={(e) => updateKeyword(index, e.target.value)}
                    className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder={`Từ khóa ${index + 1}...`}
                  />
                  {formData.keywords.length > 1 && (
                    <button
                      type='button'
                      onClick={() => removeKeyword(index)}
                      className='px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors'
                    >
                      <X className='w-5 h-5' />
                    </button>
                  )}
                </div>
              ))}
              <button
                type='button'
                onClick={addKeyword}
                className='text-blue-600 hover:text-blue-700 text-sm font-medium'
              >
                + Thêm từ khóa
              </button>
            </div>
          </div>

          {/* PDF Upload */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>File PDF</label>
            <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
              {pdfFile ? (
                <div className='space-y-3'>
                  <FileText className='w-12 h-12 text-blue-600 mx-auto' />
                  <p className='text-sm text-blue-600 font-medium'>📄 {pdfFile.name}</p>
                  <p className='text-xs text-gray-500'>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <div className='flex gap-2 justify-center'>
                    <button
                      type='button'
                      onClick={handlePreviewPdf}
                      className='inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                    >
                      <Eye className='w-4 h-4' />
                      Xem trước
                    </button>
                    <label className='cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                      <Upload className='w-4 h-4' />
                      Thay đổi file
                      <input type='file' accept='application/pdf' onChange={handleFileChange} className='hidden' />
                    </label>
                  </div>
                </div>
              ) : formData.file_url ? (
                <div className='space-y-3'>
                  <FileText className='w-12 h-12 text-green-600 mx-auto' />
                  <p className='text-sm text-green-600 font-medium'>✓ Đã có file PDF</p>
                  <a
                    href={
                      formData.file_url.startsWith('http') ? formData.file_url : `${config.baseUrl}${formData.file_url}`
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline text-sm block'
                  >
                    Xem file hiện tại
                  </a>
                  <div className='flex gap-2 justify-center'>
                    <label className='cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                      <Upload className='w-4 h-4' />
                      Thay đổi file
                      <input type='file' accept='application/pdf' onChange={handleFileChange} className='hidden' />
                    </label>
                    <button
                      type='button'
                      onClick={handleRemovePdf}
                      className='inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                      title='Xóa file PDF'
                    >
                      <X className='w-4 h-4' />
                      Xóa file
                    </button>
                  </div>
                </div>
              ) : (
                <div className='space-y-3'>
                  <Upload className='w-12 h-12 text-gray-400 mx-auto' />
                  <p className='text-sm text-gray-600'>Chưa có file PDF</p>
                  <label className='cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                    <Upload className='w-4 h-4' />
                    Upload file PDF
                    <input type='file' accept='application/pdf' onChange={handleFileChange} className='hidden' />
                  </label>
                  <p className='text-xs text-gray-500'>Chỉ chấp nhận file PDF, tối đa 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-3 justify-end pt-4 border-t border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type='submit'
              disabled={loading || uploading}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {loading && <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>}
              {paper ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
