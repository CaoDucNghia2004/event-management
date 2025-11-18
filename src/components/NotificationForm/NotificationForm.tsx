import { useState } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import notificationApiRequests from '../../apiRequests/notification'
import Swal from 'sweetalert2'

interface NotificationFormProps {
  eventId: string
  organizerId: string
  onSuccess?: () => void
}

export default function NotificationForm({ eventId, organizerId, onSuccess }: NotificationFormProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa nhập tin nhắn',
        text: 'Vui lòng nhập nội dung tin nhắn!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    setSending(true)

    try {
      await notificationApiRequests.create({
        event_id: eventId,
        organizer_id: organizerId,
        message: message.trim()
      })

      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Gửi tin nhắn thành công!',
        showConfirmButton: false,
        timer: 1500
      })

      setMessage('')
      onSuccess?.()
    } catch (error: any) {
      console.error('Error sending notification:', error)
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error?.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại!',
        confirmButtonText: 'Đóng'
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
      <div className='flex items-center gap-2 mb-4'>
        <MessageSquare className='w-5 h-5 text-blue-600' />
        <h3 className='text-lg font-semibold text-gray-900'>Gửi tin nhắn đến người tham gia</h3>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Nội dung tin nhắn</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Nhập nội dung tin nhắn cho người tham gia sự kiện...'
            rows={4}
            className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
            maxLength={1000}
            disabled={sending}
          />
          <p className='text-xs text-gray-500 mt-1'>{message.length}/1000 ký tự</p>
        </div>

        <button
          type='submit'
          disabled={sending || !message.trim()}
          className='w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        >
          {sending ? (
            <>
              <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              Đang gửi...
            </>
          ) : (
            <>
              <Send className='w-5 h-5' />
              Gửi tin nhắn
            </>
          )}
        </button>
      </form>
    </div>
  )
}

