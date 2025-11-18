import { useState } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { sendNotification } from '../../apiRequests/notification'
import Swal from 'sweetalert2'
import { getUserIdFromToken } from '../../utils/utils'

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventTitle: string
}

export default function SendMessageModal({ isOpen, onClose, eventId, eventTitle }: SendMessageModalProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const maxLength = 1000

  const handleSend = async () => {
    if (!message.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu nội dung',
        text: 'Vui lòng nhập nội dung tin nhắn!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    const organizerId = getUserIdFromToken()
    if (!organizerId) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể xác định người gửi!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    setLoading(true)
    try {
      await sendNotification({
        event_id: eventId,
        organizer_id: organizerId,
        message: message.trim()
      })

      Swal.fire({
        icon: 'success',
        title: 'Gửi thành công!',
        text: 'Tin nhắn đã được gửi đến người tham gia',
        confirmButtonText: 'Đóng',
        timer: 2000
      })

      setMessage('')
      onClose()
    } catch (error: any) {
      console.error('Error sending message:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gửi thất bại',
        text: error.response?.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn',
        confirmButtonText: 'Đóng'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-white/20 rounded-lg backdrop-blur-sm'>
              <Send className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-white'>Gửi tin nhắn đến người tham gia</h2>
              <p className='text-blue-100 text-sm'>{eventTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-white/20 rounded-lg transition-colors'
            disabled={loading}
          >
            <X className='w-5 h-5 text-white' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          <div className='mb-4'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Nội dung tin nhắn</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
              placeholder='Nhập nội dung tin nhắn cho người tham gia sự kiện...'
              className='w-full h-40 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              disabled={loading}
            />
            <div className='flex items-center justify-between mt-2'>
              <span className='text-xs text-gray-500'>Tin nhắn sẽ được gửi real-time đến tất cả người tham gia</span>
              <span className={`text-sm font-medium ${message.length >= maxLength ? 'text-red-600' : 'text-gray-500'}`}>
                {message.length}/{maxLength} ký tự
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center gap-3'>
            <button
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className='flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className='w-5 h-5' />
                  Gửi tin nhắn
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className='px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

