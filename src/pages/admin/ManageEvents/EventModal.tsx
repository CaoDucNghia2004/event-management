import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useMutation, useQuery } from '@apollo/client/react'
import { CREATE_EVENT, UPDATE_EVENT } from '../../../graphql/mutations/eventMutations'
import { GET_ALL_LOCATIONS } from '../../../graphql/queries/locationQueries'
import type { Event } from '../../../types/event.types'
import { Calendar, FileText, MapPin, Users, Clock, Tag, Upload, X } from 'lucide-react'
import uploadApiRequests from '../../../apiRequests/upload'
import config from '../../../constants/config'
import Swal from 'sweetalert2'

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
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [dateTimeErrors, setDateTimeErrors] = useState({
    start_date: '',
    end_date: ''
  })
  const [capacityError, setCapacityError] = useState('')

  const { data: locationsData } = useQuery(GET_ALL_LOCATIONS)
  const locations =
    (locationsData as { locations: { id: string; name: string; building?: string; capacity?: number }[] })?.locations ||
    []

  const [createEvent, { loading: creating }] = useMutation(CREATE_EVENT, {
    onError: (error: {
      graphQLErrors?: Array<{ extensions?: { reason?: string }; message?: string }>
      errors?: Array<{ details?: { message?: string } }>
      message?: string
    }) => {
      // Try multiple error message locations
      const errorMessage =
        error?.graphQLErrors?.[0]?.extensions?.reason ||
        error?.graphQLErrors?.[0]?.message ||
        error?.errors?.[0]?.details?.message ||
        error?.message ||
        'Không thể tạo sự kiện'
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: errorMessage,
        confirmButtonText: 'Đóng'
      })
    }
  })

  const [updateEvent, { loading: updating }] = useMutation(UPDATE_EVENT, {
    onError: (error: {
      graphQLErrors?: Array<{ extensions?: { reason?: string }; message?: string }>
      errors?: Array<{ details?: { message?: string } }>
      message?: string
    }) => {
      // Try multiple error message locations
      const errorMessage =
        error?.graphQLErrors?.[0]?.extensions?.reason ||
        error?.graphQLErrors?.[0]?.message ||
        error?.errors?.[0]?.details?.message ||
        error?.message ||
        'Không thể cập nhật sự kiện'
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: errorMessage,
        confirmButtonText: 'Đóng'
      })
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
      // Set preview for existing image
      if (event.image_url) {
        setImagePreview(`${config.baseUrl}${event.image_url}`)
      }
    }
  }, [event])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Kích thước ảnh không được vượt quá 5MB!',
        confirmButtonText: 'Đóng'
      })
      return
    }

    // Show preview and store file for later upload
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setSelectedImageFile(file)
  }

  const handleRemoveImage = () => {
    setImagePreview('')
    setSelectedImageFile(null)
    setFormData((prev) => ({ ...prev, image_url: '' }))
  }

  // Validate datetime
  const validateCapacity = (locationId: string, eventCapacity: string) => {
    if (!locationId || !eventCapacity) {
      setCapacityError('')
      return true
    }
    const location = locations.find((loc: any) => loc.id === locationId)
    const capacity = parseInt(eventCapacity)
    if (location?.capacity && capacity > location.capacity) {
      setCapacityError(`Sức chứa vượt quá giới hạn của địa điểm (${location.capacity} người)`)
      return false
    }
    setCapacityError('')
    return true
  }

  const validateDateTime = (startDate: string, endDate: string) => {
    const errors = { start_date: '', end_date: '' }
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Check if start date is in the past
    if (start <= now) {
      errors.start_date = 'Thời gian bắt đầu phải sau thời điểm hiện tại'
    }

    // Check if end date is after start date
    if (end <= start) {
      errors.end_date = 'Thời gian kết thúc phải sau thời gian bắt đầu'
    }

    setDateTimeErrors(errors)
    return !errors.start_date && !errors.end_date
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate datetime before submitting
    if (!validateDateTime(formData.start_date, formData.end_date)) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi thời gian',
        text: 'Vui lòng kiểm tra lại thời gian bắt đầu và kết thúc',
        confirmButtonColor: '#3b82f6'
      })
      return
    }

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

    // When updating event: only send image_url if we have a new file selected
    // If keeping old image (no new file), omit image_url to keep existing value in database
    const shouldSendImageUrl = event ? selectedImageFile !== null : true // Always send for create, only if changed for update

    // Parse waiting_capacity properly
    const waitingCapacityValue = formData.waiting_capacity?.trim()
    const parsedWaitingCapacity =
      waitingCapacityValue && waitingCapacityValue !== '' && !isNaN(Number(waitingCapacityValue))
        ? parseInt(waitingCapacityValue)
        : undefined // Use undefined instead of null to omit field

    const variables: any = {
      title: formData.title,
      description: formData.description || null,
      location_id: formData.location_id,
      start_date: formatDateTime(formData.start_date),
      end_date: formatDateTime(formData.end_date),
      organizer: formData.organizer,
      topic: formData.topic || null,
      capacity: parseInt(formData.capacity),
      ...(shouldSendImageUrl && { image_url: formData.image_url || null })
    }

    // Only include waiting_capacity if it has a valid value
    if (parsedWaitingCapacity !== undefined) {
      variables.waiting_capacity = parsedWaitingCapacity
    }

    console.log('Sending event data:', variables) // Debug log

    try {
      let eventId = event?.id

      if (event) {
        // Update existing event
        await updateEvent({
          variables: {
            id: event.id,
            ...variables
          }
        })
      } else {
        // Create new event
        const result = (await createEvent({ variables })) as { data?: { createEvent?: { id: string } } }
        eventId = result.data?.createEvent?.id
        console.log('Create event result:', result)
        console.log('Event ID:', eventId)
      }

      // Upload image after event creation/update ONLY if there's a new image file selected
      // If keeping old image (no new file selected), skip upload
      if (selectedImageFile && eventId) {
        console.log('Uploading new image for event:', eventId)
        setUploadingImage(true)
        try {
          const uploadFormData = new FormData()
          uploadFormData.append('image', selectedImageFile)
          uploadFormData.append('event_id', eventId)

          await uploadApiRequests.uploadEventImage(uploadFormData)
          // Don't show upload success toast - will show final success message below
        } catch (uploadError) {
          const errorMsg =
            (uploadError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Lỗi khi upload ảnh!'
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: errorMsg,
            confirmButtonText: 'Đóng'
          })
          return // Stop here if upload fails
        } finally {
          setUploadingImage(false)
        }
      } else if (!selectedImageFile && imagePreview && !event) {
        // Creating new event but somehow has preview without file (shouldn't happen)
        console.warn('Preview exists but no file selected for new event')
      }

      // Show success message and close modal after everything completes
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: event ? 'Cập nhật sự kiện thành công!' : 'Thêm sự kiện thành công!',
        showConfirmButton: false,
        timer: 1500
      })
      onClose()
    } catch (error) {
      const errorMessage =
        (error as any)?.errors?.[0]?.details?.message ||
        (error as any)?.errors?.[0]?.extensions?.reason ||
        (error as any)?.errors?.[0]?.message ||
        (error as any)?.message ||
        'Đã xảy ra lỗi không xác định'
      console.error('Error:', errorMessage)
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: errorMessage,
        confirmButtonText: 'Đóng'
      })
    }
  }

  const modal = (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn'>
      <div className='absolute inset-0 bg-gray-900/50 backdrop-blur-sm' onClick={onClose}></div>
      <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white bg-opacity-100 z-50 border-b border-gray-200 px-8 py-6 rounded-t-xl'>
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
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
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
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, location_id: e.target.value }))
                  validateCapacity(e.target.value, formData.capacity)
                }}
                className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white'
              >
                <option value=''>-- Chọn địa điểm --</option>
                {locations.map((location: { id: string; name: string; building?: string; capacity?: number }) => (
                  <option key={location.id} value={location.id}>
                    {location.name} {location.building ? `- ${location.building}` : ''}{' '}
                    {location.capacity ? `(${location.capacity} người)` : ''}
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
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                    // Validate on change
                    if (e.target.value && formData.end_date) {
                      validateDateTime(e.target.value, formData.end_date)
                    }
                  }}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    dateTimeErrors.start_date
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
              {dateTimeErrors.start_date && <p className='mt-1 text-sm text-red-600'>{dateTimeErrors.start_date}</p>}
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
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                    // Validate on change
                    if (formData.start_date && e.target.value) {
                      validateDateTime(formData.start_date, e.target.value)
                    }
                  }}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    dateTimeErrors.end_date
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
              {dateTimeErrors.end_date && <p className='mt-1 text-sm text-red-600'>{dateTimeErrors.end_date}</p>}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, organizer: e.target.value }))}
                className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Nhập tên tổ chức...'
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
                onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
                className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Nhập chủ đề...'
              />
            </div>
          </div>

          {/* Upload ảnh sự kiện */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Ảnh sự kiện</label>

            {imagePreview ? (
              <div className='relative border-2 border-gray-200 rounded-lg p-4'>
                <img src={imagePreview} alt='Event preview' className='w-full h-48 object-cover rounded-lg' />
                <button
                  type='button'
                  onClick={handleRemoveImage}
                  className='absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition'
                >
                  <X className='w-4 h-4' />
                </button>
                {uploadingImage && (
                  <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
                    <div className='text-white'>Đang upload...</div>
                  </div>
                )}
              </div>
            ) : (
              <div className='relative'>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  className='hidden'
                  id='event-image'
                  disabled={uploadingImage}
                />
                <label
                  htmlFor='event-image'
                  className='flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition'
                >
                  <Upload className='w-12 h-12 text-gray-400 mb-2' />
                  <span className='text-sm text-gray-600'>
                    {uploadingImage ? 'Đang upload...' : 'Click để chọn ảnh'}
                  </span>
                  <span className='text-xs text-gray-400 mt-1'>JPG, PNG, WEBP (max 5MB)</span>
                </label>
              </div>
            )}
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
                  onChange={(e) => {
                    setFormData({ ...formData, capacity: e.target.value })
                    validateCapacity(formData.location_id, e.target.value)
                  }}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    capacityError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder='Số người tối đa...'
                />
              </div>
              {capacityError && <p className='mt-1 text-sm text-red-600'>{capacityError}</p>}
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
              disabled={
                creating || updating || !!dateTimeErrors.start_date || !!dateTimeErrors.end_date || !!capacityError
              }
              className='flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
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

  // Render modal into document.body to avoid stacking-context issues
  if (typeof document !== 'undefined') {
    return ReactDOM.createPortal(modal, document.body)
  }

  return modal
}

export default EventModal
