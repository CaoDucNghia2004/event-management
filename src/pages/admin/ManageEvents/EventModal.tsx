import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { CREATE_EVENT, UPDATE_EVENT } from '../../../graphql/mutations/eventMutations'
import { GET_ALL_LOCATIONS } from '../../../graphql/queries/locationQueries'
import type { Event } from '../../../types/event.types'
import { Calendar, FileText, MapPin, Users, Clock, Tag } from 'lucide-react'

interface EventModalProps {
  event: Event | null
  onClose: () => void
}

const EventModal = ({ event, onClose }: EventModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location_id: '',
    start_date: '',
    end_date: '',
    organizer: '',
    topic: '',
    capacity: '',
    waiting_capacity: '',
    image_url: ''
  })

  const { data: locationsData } = useQuery(GET_ALL_LOCATIONS)
  const locations = (locationsData as { locations: { id: string; name: string; building?: string }[] })?.locations || []

  const [createEvent, { loading: creating }] = useMutation(CREATE_EVENT, {
    onCompleted: () => {
      alert('Thêm sự kiện thành công!')
      onClose()
    },
    onError: (error: unknown) => {
      const err = error as { errors?: Array<{ details?: { message?: string } }>; message?: string }
      const errorMessage = err?.errors?.[0]?.details?.message || err?.message || 'Không thể tạo sự kiện'
      alert('Lỗi: ' + errorMessage)
    }
  })

  const [updateEvent, { loading: updating }] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      alert('Cập nhật sự kiện thành công!')
      onClose()
    },
    onError: (error: unknown) => {
      const err = error as { errors?: Array<{ details?: { message?: string } }>; message?: string }
      const errorMessage = err?.errors?.[0]?.details?.message || err?.message || 'Không thể cập nhật sự kiện'
      alert('Lỗi: ' + errorMessage)
    }
  })

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        location_id: event.location?.id || '',
        start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
        end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
        organizer: event.organizer || '',
        topic: event.topic || '',
        capacity: event.capacity?.toString() || '',
        waiting_capacity: event.waiting_capacity?.toString() || '',
        image_url: event.image_url || ''
      })
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Format datetime to YYYY-MM-DD HH:mm:ss (remove timezone Z)
    const formatDateTime = (dateStr: string) => {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    const variables = {
      title: formData.title,
      description: formData.description || null,
      location_id: formData.location_id,
      start_date: formatDateTime(formData.start_date),
      end_date: formatDateTime(formData.end_date),
      organizer: formData.organizer,
      topic: formData.topic || null,
      capacity: parseInt(formData.capacity),
      waiting_capacity: formData.waiting_capacity ? parseInt(formData.waiting_capacity) : null,
      image_url: formData.image_url || null
    }

    console.log('Sending event data:', variables) // Debug log

    if (event) {
      // Update
      await updateEvent({
        variables: {
          id: event.id,
          ...variables
        }
      })
    } else {
      // Create
      await createEvent({ variables })
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn'>
      <div className='absolute inset-0 bg-gray-900/30 backdrop-blur-sm' onClick={onClose}></div>
      <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-xl'>
          <h2 className='text-2xl font-bold text-gray-800'>{event ? 'Cập nhật sự kiện' : 'Thêm sự kiện mới'}</h2>
        </div>

        <form onSubmit={handleSubmit} className='p-8 space-y-5'>
          {/* Tên sự kiện */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Tên sự kiện <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Nhập tên sự kiện...'
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Mô tả</label>
            <div className='relative'>
              <FileText className='absolute left-3 top-3 w-5 h-5 text-gray-400' />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Nhập mô tả...'
                rows={3}
              />
            </div>
          </div>

          {/* Địa điểm */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Địa điểm <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
              <select
                required
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>-- Chọn địa điểm --</option>
                {locations.map((location: { id: string; name: string; building?: string }) => (
                  <option key={location.id} value={location.id}>
                    {location.name} {location.building ? `- ${location.building}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Thời gian bắt đầu và kết thúc */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Thời gian bắt đầu <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <Clock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='datetime-local'
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Thời gian kết thúc <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <Clock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='datetime-local'
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
          </div>

          {/* Người tổ chức */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Người tổ chức <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <Users className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                required
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Nhập tên người tổ chức...'
              />
            </div>
          </div>

          {/* Chủ đề */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Chủ đề</label>
            <div className='relative'>
              <Tag className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Nhập chủ đề...'
              />
            </div>
          </div>

          {/* Sức chứa và Chỗ chờ */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Sức chứa <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <Users className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='number'
                  required
                  min='1'
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Số người tối đa...'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Danh sách chờ</label>
              <div className='relative'>
                <Users className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='number'
                  min='0'
                  value={formData.waiting_capacity}
                  onChange={(e) => setFormData({ ...formData, waiting_capacity: e.target.value })}
                  className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Số người chờ...'
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className='flex gap-4 pt-4'>
            <button
              type='submit'
              disabled={creating || updating}
              className='flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50'
            >
              {creating || updating ? 'Đang xử lý...' : event ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold'
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal
