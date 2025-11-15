import { X, CheckCircle, Clock, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { Registration } from '../../types/registration.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  registration: Registration
  eventTitle: string
}

export default function RegistrationSuccessModal({ isOpen, onClose, registration, eventTitle }: Props) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const isConfirmed = registration.current_status === 'CONFIRMED'
  const isWaiting = registration.current_status === 'WAITING'

  const handleCopyCode = () => {
    navigator.clipboard.writeText(registration.code_roll_call ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in'>
        {/* Header */}
        <div
          className={`p-6 text-white ${
            isConfirmed
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
          }`}
        >
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              {isConfirmed ? <CheckCircle className='w-8 h-8' /> : <Clock className='w-8 h-8' />}
              <div>
                <h2 className='text-2xl font-bold'>
                  {isConfirmed ? 'Đăng ký thành công!' : 'Đã thêm vào danh sách chờ'}
                </h2>
                <p className='text-white/90 text-sm mt-1'>
                  {isConfirmed ? 'Bạn đã được xác nhận tham gia' : 'Chúng tôi sẽ thông báo khi có chỗ trống'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className='text-white/80 hover:text-white transition'>
              <X className='w-6 h-6' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 space-y-4'>
          {/* Event Info */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <p className='text-sm text-gray-500 mb-1'>Sự kiện</p>
            <p className='font-semibold text-gray-900'>{eventTitle}</p>
          </div>

          {/* Status */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <p className='text-sm text-gray-500 mb-1'>Trạng thái</p>
            <div className='flex items-center gap-2'>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isConfirmed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {isConfirmed ? '✅ Đã xác nhận' : '⏳ Đang chờ'}
              </span>
              {isWaiting && registration.queue_order && (
                <span className='text-sm text-gray-600'>
                  (Vị trí: <span className='font-bold'>#{registration.queue_order}</span>)
                </span>
              )}
            </div>
          </div>

          {/* Roll Call Code */}
          <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200'>
            <p className='text-sm text-gray-700 mb-2 font-medium'>Mã điểm danh của bạn:</p>
            <div className='flex items-center gap-2'>
              <code className='flex-1 bg-white px-4 py-3 rounded-lg font-mono text-xl font-bold text-blue-600 tracking-wider'>
                {registration.code_roll_call}
              </code>
              <button
                onClick={handleCopyCode}
                className='p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition'
                title='Sao chép mã'
              >
                {copied ? <Check className='w-5 h-5' /> : <Copy className='w-5 h-5' />}
              </button>
            </div>
            <p className='text-xs text-gray-600 mt-2'>💡 Lưu mã này để điểm danh khi tham gia sự kiện</p>
          </div>

          {/* Instructions */}
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <p className='text-sm font-semibold text-yellow-800 mb-2'>📌 Lưu ý quan trọng:</p>
            <ul className='text-sm text-yellow-700 space-y-1'>
              {isConfirmed ? (
                <>
                  <li>• Vui lòng có mặt đúng giờ để điểm danh</li>
                  <li>• Mang theo mã điểm danh khi tham gia</li>
                  <li>• Nếu không tham gia, vui lòng hủy đăng ký sớm</li>
                </>
              ) : (
                <>
                  <li>• Bạn sẽ được thông báo qua email khi có chỗ trống</li>
                  <li>• Vui lòng kiểm tra email thường xuyên</li>
                  <li>• Có thể hủy đăng ký bất cứ lúc nào</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className='p-6 bg-gray-50 border-t border-gray-200'>
          <button
            onClick={onClose}
            className='w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
