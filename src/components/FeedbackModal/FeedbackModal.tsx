import { useState } from 'react'
import { X, Star, MessageSquare, Send } from 'lucide-react'
import { useMutation } from '@apollo/client/react'
import { CREATE_FEEDBACK, UPDATE_FEEDBACK } from '../../graphql/mutations/feedbackMutations'
import type { CreateFeedbackData, CreateFeedbackInput, UpdateFeedbackData } from '../../types/feedback.types'
import Swal from 'sweetalert2'
import { checkToxicComment } from '../../apiRequests/toxicClassifier'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  registrationId: string
  eventId: string
  eventTitle: string
  onSuccess?: () => void
}

export default function FeedbackModal({
  isOpen,
  onClose,
  registrationId,
  eventId,
  eventTitle,
  onSuccess
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comments, setComments] = useState<string>('')
  const [feedbackId, setFeedbackId] = useState<string | null>(null) // Lưu ID feedback đã tạo

  const [createFeedback, { loading }] = useMutation<CreateFeedbackData>(CREATE_FEEDBACK, {
    onError: (error) => {
      console.error('Error creating feedback:', error)
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message || 'Không thể gửi đánh giá. Vui lòng thử lại!',
        confirmButtonText: 'Đóng'
      })
    }
  })

  const [updateFeedback] = useMutation<UpdateFeedbackData>(UPDATE_FEEDBACK)

  const handleClose = () => {
    setRating(0)
    setHoverRating(0)
    setComments('')
    setFeedbackId(null) // Reset feedback ID
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn đánh giá',
        text: 'Vui lòng chọn số sao đánh giá!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    // Kiểm tra comments không được để trắng
    if (!comments.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa có nhận xét',
        text: 'Vui lòng nhập nhận xét của bạn về sự kiện!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    // KIỂM TRA TOXIC TRƯỚC KHI GỬI
    if (comments.trim()) {
      console.log('🔍 Checking toxic before submit:', comments.trim())
      const toxicResult = await checkToxicComment(comments.trim())
      console.log('📊 Toxic result:', toxicResult)

      if (toxicResult.success && toxicResult.is_toxic === true) {
        // PHÁT HIỆN TOXIC → CHẶN KHÔNG CHO GỬI
        await Swal.fire({
          icon: 'warning',
          title: '⚠️ CẢNH BÁO',
          html: `
            <div style="text-align: center; padding: 10px; line-height: 1.8;">
              <p style="font-size: 16px; margin-bottom: 15px;">
                <strong>Nhận xét của bạn chứa từ ngữ chưa chuẩn mực với quy định của trường.</strong>
              </p>
              
              <p style="font-size: 15px; color: #dc3545; margin-bottom: 15px;">
                Vui lòng cập nhật lại để gửi đánh giá.
              </p>
            </div>
          `,
          confirmButtonText: 'Chỉnh sửa ngay',
          confirmButtonColor: '#28a745'
        })
        // GIỮ MODAL MỞ, không gửi
        return
      }
    }

    // KHÔNG CÓ TOXIC → CHO PHÉP GỬI
    const input: CreateFeedbackInput = {
      registration_id: registrationId,
      event_id: eventId,
      rating,
      comments: comments.trim() || undefined
    }

    try {
      let currentFeedbackId = feedbackId

      // Tạo feedback (nếu chưa có) hoặc update (nếu đã có)
      if (!currentFeedbackId) {
        // Tạo mới feedback
        const result = await createFeedback({ variables: { input } })
        currentFeedbackId = result.data?.createFeedback.id || null
        setFeedbackId(currentFeedbackId)
      } else {
        // Update feedback đã tồn tại
        await updateFeedback({
          variables: {
            id: currentFeedbackId,
            input: {
              rating,
              comments: comments.trim() || undefined
            }
          }
        })
      }

      // Thành công
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cảm ơn bạn đã đánh giá!',
        showConfirmButton: false,
        timer: 1500
      })

      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      // Error đã được handle ở onError của createFeedback
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl'>
          <div className='flex items-center gap-3'>
            <MessageSquare className='w-6 h-6' />
            <h2 className='text-xl font-bold'>Đánh giá sự kiện</h2>
          </div>
          <button
            onClick={handleClose}
            className='p-1 hover:bg-white/20 rounded-lg transition-colors'
            disabled={loading}
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Event Title */}
          <div className='bg-blue-50 rounded-xl p-4 border border-blue-200'>
            <p className='text-sm text-gray-600 mb-1'>Sự kiện</p>
            <p className='font-semibold text-gray-900'>{eventTitle}</p>
          </div>

          {/* Rating */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-3'>
              Đánh giá của bạn <span className='text-red-500'>*</span>
            </label>
            <div className='flex items-center gap-2'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type='button'
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className='transition-transform hover:scale-110'
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className='ml-2 text-sm font-medium text-gray-700'>
                  {rating === 1 && 'Rất tệ'}
                  {rating === 2 && 'Tệ'}
                  {rating === 3 && 'Bình thường'}
                  {rating === 4 && 'Tốt'}
                  {rating === 5 && 'Tuyệt vời'}
                </span>
              )}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Nhận xét của bạn (tùy chọn)</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder='Chia sẻ trải nghiệm của bạn về sự kiện...'
              rows={4}
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
              maxLength={500}
            />
            <p className='text-xs text-gray-500 mt-1'>{comments.length}/500 ký tự</p>
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={handleClose}
              disabled={loading}
              className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50'
            >
              Hủy
            </button>
            <button
              type='submit'
              disabled={loading || rating === 0}
              className='flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className='w-5 h-5' />
                  Gửi đánh giá
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
