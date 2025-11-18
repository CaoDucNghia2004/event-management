import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import notificationApiRequests from '../../../apiRequests/notification'
import type { Notification } from '../../../types/notification.types'

interface EditNotificationModalProps {
  notification: Notification
  eventTitle: string
  onClose: () => void
  onSuccess: () => void
}

export default function EditNotificationModal({
  notification,
  eventTitle,
  onClose,
  onSuccess
}: EditNotificationModalProps) {
  const [message, setMessage] = useState(notification.message)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMessage(notification.message)
  }, [notification])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa nhập nội dung',
        text: 'Vui lòng nhập nội dung tin nhắn!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    if (message.trim() === notification.message) {
      Swal.fire({
        icon: 'info',
        title: 'Không có thay đổi',
        text: 'Nội dung tin nhắn không thay đổi!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    setIsSubmitting(true)

    try {
      await notificationApiRequests.update(notification.id, {
        message: message.trim()
      })

      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật tin nhắn thành công!',
        showConfirmButton: false,
        timer: 1500
      })

      onSuccess()
      onClose()
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error?.response?.data?.message || 'Không thể cập nhật tin nhắn!',
        confirmButtonText: 'Đóng'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn'>
      <div className='absolute inset-0 bg-gray-900/30 backdrop-blur-sm' onClick={onClose}></div>
      <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-2xl' onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className='bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl'>
          <div>
            <h2 className='text-xl font-bold'>Chỉnh sửa tin nhắn</h2>
            <p className='text-indigo-100 text-sm mt-1'>Sự kiện: {eventTitle}</p>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className='p-6'>
          <div className='mb-6'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Nội dung tin nhắn <span className='text-red-500'>*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none'
              placeholder='Nhập nội dung tin nhắn...'
              disabled={isSubmitting}
            />
            <p className='text-sm text-gray-500 mt-2'>{message.length} ký tự</p>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium'
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type='submit'
              className='px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

