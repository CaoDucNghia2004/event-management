import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_ALL_LOCATIONS } from '../../../graphql/queries/locationQueries'
import { DELETE_LOCATION } from '../../../graphql/mutations/locationMutations'
import { Edit2, Trash2, Plus, RotateCw } from 'lucide-react'
import LocationModal from './LocationModal'

interface LocationDetail {
  id: string
  name: string
  building?: string | null
  address?: string | null
  capacity?: number | null
  created_at?: string
  updated_at?: string
}

interface LocationsData {
  locations: LocationDetail[]
}

export default function ManageLocations() {
  const [searchName, setSearchName] = useState('')
  const [searchBuilding, setSearchBuilding] = useState('')
  const [searchAddress, setSearchAddress] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<LocationDetail | null>(null)
  const itemsPerPage = 5

  const { data, loading, error, refetch } = useQuery<LocationsData>(GET_ALL_LOCATIONS)
  const [deleteLocation] = useMutation(DELETE_LOCATION, {
    onCompleted: () => {
      refetch()
      alert('Xóa địa điểm thành công!')
    },
    onError: () => {
      // Error đã được xử lý trong handleDelete
    }
  })

  const locations: LocationDetail[] = data?.locations || []

  // Filter locations
  const filteredLocations = locations.filter((location) => {
    const matchName = location.name?.toLowerCase().includes(searchName.toLowerCase())
    const matchBuilding = location.building?.toLowerCase().includes(searchBuilding.toLowerCase())
    const matchAddress = location.address?.toLowerCase().includes(searchAddress.toLowerCase())
    return matchName && matchBuilding && matchAddress
  })

  // Pagination
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLocations = filteredLocations.slice(startIndex, startIndex + itemsPerPage)

  const handleSearch = () => {
    setCurrentPage(1)
  }

  const handleClear = () => {
    setSearchName('')
    setSearchBuilding('')
    setSearchAddress('')
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
      try {
        await deleteLocation({ variables: { id } })
      } catch (err: any) {
        // Lấy message từ err.errors[0].details.message
        const errorMessage = err?.errors?.[0]?.details?.message || 'Không thể xóa địa điểm. Vui lòng thử lại.'
        alert(errorMessage)
      }
    }
  }

  const handleEdit = (locationData: LocationDetail) => {
    setEditingLocation(locationData)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingLocation(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLocation(null)
    refetch()
  }

  if (loading) return <div className='p-8'>Đang tải...</div>
  if (error) return <div className='p-8 text-red-500'>Lỗi: {error.message}</div>

  return (
    <div className='p-8 bg-gray-50 min-h-screen'>
      {/* Search Section */}
      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <h2 className='text-xl font-bold text-gray-800 mb-4'>Tìm kiếm địa điểm</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Tên địa điểm</label>
            <input
              type='text'
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder='Nhập tên địa điểm'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Tòa nhà</label>
            <input
              type='text'
              value={searchBuilding}
              onChange={(e) => setSearchBuilding(e.target.value)}
              placeholder='Nhập tòa nhà'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Địa chỉ</label>
            <input
              type='text'
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder='Nhập địa chỉ'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>
        <div className='flex justify-end gap-3'>
          <button
            onClick={handleClear}
            className='px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors'
          >
            Xóa bộ lọc
          </button>
          <button
            onClick={handleSearch}
            className='px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors'
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className='bg-white rounded-lg shadow-md'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold text-gray-800'>Danh sách địa điểm</h2>
            <div className='flex gap-3'>
              <button
                onClick={handleAddNew}
                className='flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors'
              >
                <Plus className='w-5 h-5' />
                Thêm mới
              </button>
              <button
                onClick={() => refetch()}
                className='p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                title='Làm mới'
              >
                <RotateCw className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b-2 border-gray-200'>
              <tr>
                <th className='px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider'>STT</th>
                <th className='px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider'>
                  Tên địa điểm
                </th>
                <th className='px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider'>
                  Tòa nhà
                </th>
                <th className='px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider'>
                  Địa chỉ
                </th>
                <th className='px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider'>
                  Sức chứa
                </th>
                <th className='px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider'>
                  Ngày tạo
                </th>
                <th className='px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider'>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {paginatedLocations.map((location, index) => (
                <tr key={location.id} className='hover:bg-gray-50 transition-colors'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {startIndex + index + 1}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900'>{location.name}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{location.building || '-'}</td>
                  <td className='px-6 py-4 text-sm text-gray-700'>{location.address || '-'}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                    {location.capacity ? `${location.capacity} người` : '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                    {location.created_at ? new Date(location.created_at).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    <div className='flex justify-center gap-3'>
                      <button
                        onClick={() => handleEdit(location)}
                        className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                        title='Chỉnh sửa'
                      >
                        <Edit2 className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        title='Xóa'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50'>
          <div className='text-sm font-medium text-gray-700'>
            Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLocations.length)} trong tổng số{' '}
            {filteredLocations.length} bản ghi
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className='px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 font-medium transition-colors'
            >
              ‹ Trước
            </button>
            <span className='px-4 py-2 border-2 border-blue-500 rounded-lg bg-blue-50 text-blue-700 font-semibold'>
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className='px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 font-medium transition-colors'
            >
              Sau ›
            </button>
            <span className='text-sm font-medium text-gray-700 ml-3'>{itemsPerPage} / trang</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && <LocationModal location={editingLocation} onClose={handleCloseModal} />}
    </div>
  )
}
