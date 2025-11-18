import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { CREATE_LOCATION, UPDATE_LOCATION } from '../../../graphql/mutations/locationMutations'
import { MapPin, Building2, Map, Users } from 'lucide-react'
import Swal from 'sweetalert2'

interface LocationDetail {
  id: string
  name: string
  building?: string | null
  address?: string | null
  capacity?: number | null
  created_at?: string
  updated_at?: string
}

interface LocationModalProps {
  location: LocationDetail | null
  onClose: () => void
}

export default function LocationModal({ location, onClose }: LocationModalProps) {
  const [formData, setFormData] = useState({
    name: location?.name || '',
    building: location?.building || '',
    address: location?.address || '',
    capacity: location?.capacity || ''
  })

  const [createLocation, { loading: creating }] = useMutation(CREATE_LOCATION, {
    onCompleted: () => {
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Thêm địa điểm thành công!',
        confirmButtonText: 'Đóng'
      })
      onClose()
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message,
        confirmButtonText: 'Đóng'
      })
    }
  })

  const [updateLocation, { loading: updating }] = useMutation(UPDATE_LOCATION, {
    onCompleted: () => {
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật địa điểm thành công!',
        confirmButtonText: 'Đóng'
      })
      onClose()
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message,
        confirmButtonText: 'Đóng'
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const variables = {
      name: formData.name,
      building: formData.building || null,
      address: formData.address || null,
      capacity: formData.capacity ? parseInt(formData.capacity.toString()) : null
    }

    if (location) {
      // Update
      await updateLocation({
        variables: {
          id: location.id,
          ...variables
        }
      })
    } else {
      // Create
      await createLocation({ variables })
    }
  }

  return (
    <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50' onClick={onClose}>
      <div
        className='bg-white rounded-xl shadow-2xl w-full max-w-md p-8 m-4 animate-fadeIn'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='text-xl font-bold text-gray-800 mb-6'>{location ? 'Cập nhật địa điểm' : 'Thêm địa điểm mới'}</h2>

        <form onSubmit={handleSubmit}>
          <div className='space-y-5'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Tên địa điểm <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='text'
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Nhập tên địa điểm'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Tòa nhà</label>
              <div className='relative'>
                <Building2 className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='text'
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Nhập tòa nhà'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Địa chỉ</label>
              <div className='relative'>
                <Map className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='text'
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Nhập địa chỉ'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Sức chứa</label>
              <div className='relative'>
                <Users className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='number'
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Nhập sức chứa'
                  min='0'
                />
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 mt-8'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors'
            >
              Hủy
            </button>
            <button
              type='submit'
              disabled={creating || updating}
              className='px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors'
            >
              {creating || updating ? 'Đang xử lý...' : location ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
