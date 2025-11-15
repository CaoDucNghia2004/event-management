import { X, MapPin, Calendar, Users, Tag, User, Clock, Image as ImageIcon } from 'lucide-react'
import type { Event } from '../../../types/event.types'

interface EventDetailModalProps {
  event: Event
  onClose: () => void
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn'>
      <div className='absolute inset-0 bg-gray-900/50 backdrop-blur-sm' onClick={onClose}></div>
      <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10'>
          <h2 className='text-2xl font-bold text-gray-800'>Chi tiết sự kiện</h2>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors' title='Đóng'>
            <X className='w-6 h-6 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Ảnh sự kiện */}
          {event.image_url && (
            <div className='rounded-lg overflow-hidden border border-gray-200'>
              <img
                src={event.image_url}
                alt={event.title}
                className='w-full h-64 object-cover'
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Tiêu đề */}
          <div>
            <h3 className='text-2xl font-bold text-gray-900 mb-2'>{event.title}</h3>
            <div className='flex gap-3'>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  event.current_status === 'ENDED'
                    ? 'bg-gray-100 text-gray-700'
                    : event.current_status === 'OPEN'
                      ? 'bg-blue-100 text-blue-700'
                      : event.current_status === 'ONGOING'
                        ? 'bg-green-100 text-green-700'
                        : event.current_status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {event.current_status}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  event.current_approval_status === 'APPROVED'
                    ? 'bg-green-100 text-green-700'
                    : event.current_approval_status === 'REJECTED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {event.current_approval_status}
              </span>
            </div>
          </div>

          {/* Mô tả */}
          {event.description && (
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                <ImageIcon className='w-4 h-4' />
                Mô tả
              </h4>
              <p className='text-gray-700 whitespace-pre-wrap'>{event.description}</p>
            </div>
          )}

          {/* Thông tin chi tiết */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Địa điểm */}
            <div className='flex items-start gap-3 p-4 bg-blue-50 rounded-lg'>
              <MapPin className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-sm font-semibold text-gray-700'>Địa điểm</p>
                <p className='text-gray-900 font-medium'>{event.location?.name || 'N/A'}</p>
                {event.location?.building && <p className='text-sm text-gray-600'>{event.location.building}</p>}
                {event.location?.address && <p className='text-sm text-gray-600'>{event.location.address}</p>}
              </div>
            </div>

            {/* Người tổ chức */}
            <div className='flex items-start gap-3 p-4 bg-purple-50 rounded-lg'>
              <User className='w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-sm font-semibold text-gray-700'>Người tổ chức</p>
                <p className='text-gray-900 font-medium'>{event.organizer}</p>
              </div>
            </div>

            {/* Thời gian bắt đầu */}
            <div className='flex items-start gap-3 p-4 bg-green-50 rounded-lg'>
              <Calendar className='w-5 h-5 text-green-600 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-sm font-semibold text-gray-700'>Thời gian bắt đầu</p>
                <p className='text-gray-900 font-medium'>{formatDate(event.start_date)}</p>
              </div>
            </div>

            {/* Thời gian kết thúc */}
            <div className='flex items-start gap-3 p-4 bg-orange-50 rounded-lg'>
              <Clock className='w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-sm font-semibold text-gray-700'>Thời gian kết thúc</p>
                <p className='text-gray-900 font-medium'>{formatDate(event.end_date)}</p>
              </div>
            </div>

            {/* Sức chứa */}
            <div className='flex items-start gap-3 p-4 bg-yellow-50 rounded-lg'>
              <Users className='w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-sm font-semibold text-gray-700'>Sức chứa</p>
                <p className='text-gray-900 font-medium'>{event.capacity} người</p>
                {event.waiting_capacity && event.waiting_capacity > 0 && (
                  <p className='text-sm text-gray-600'>Danh sách chờ: {event.waiting_capacity} người</p>
                )}
              </div>
            </div>

            {/* Chủ đề */}
            {event.topic && (
              <div className='flex items-start gap-3 p-4 bg-indigo-50 rounded-lg'>
                <Tag className='w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm font-semibold text-gray-700'>Chủ đề</p>
                  <p className='text-gray-900 font-medium'>{event.topic}</p>
                </div>
              </div>
            )}
          </div>

          {/* Thời gian tạo/cập nhật */}
          <div className='border-t pt-4 text-sm text-gray-600'>
            <p>Ngày tạo: {formatDate(event.created_at)}</p>
            {event.updated_at && <p>Cập nhật: {formatDate(event.updated_at)}</p>}
          </div>

          {/* Lịch sử phê duyệt */}
          {event.approval_history && event.approval_history.length > 0 && (
            <div className='border-t pt-4'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3'>Lịch sử phê duyệt</h4>
              <div className='space-y-2'>
                {event.approval_history.map((history, index) => (
                  <div key={index} className='flex items-center gap-3 text-sm'>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        history.name === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : history.name === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {history.name}
                    </span>
                    <span className='text-gray-600'>{new Date(history.changed_at).toLocaleString('vi-VN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lịch sử trạng thái */}
          {event.status_history && event.status_history.length > 0 && (
            <div className='border-t pt-4'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3'>Lịch sử trạng thái</h4>
              <div className='space-y-2'>
                {event.status_history.map((history, index) => (
                  <div key={index} className='flex items-center gap-3 text-sm'>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        history.name === 'ENDED'
                          ? 'bg-gray-100 text-gray-700'
                          : history.name === 'OPEN'
                            ? 'bg-blue-100 text-blue-700'
                            : history.name === 'ONGOING'
                              ? 'bg-green-100 text-green-700'
                              : history.name === 'CANCELLED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {history.name}
                    </span>
                    <span className='text-gray-600'>{new Date(history.changed_at).toLocaleString('vi-VN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl'>
          <button
            onClick={onClose}
            className='w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
