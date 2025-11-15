export default function Dashboard() {
  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>Dashboard Admin</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {/* Thống kê cards */}
        <div className='bg-white rounded-lg shadow p-6 border-l-4 border-blue-500'>
          <h3 className='text-gray-500 text-sm font-medium mb-2'>Tổng sự kiện</h3>
          <p className='text-3xl font-bold text-gray-800'>150</p>
        </div>

        <div className='bg-white rounded-lg shadow p-6 border-l-4 border-green-500'>
          <h3 className='text-gray-500 text-sm font-medium mb-2'>Người dùng</h3>
          <p className='text-3xl font-bold text-gray-800'>1,234</p>
        </div>

        <div className='bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500'>
          <h3 className='text-gray-500 text-sm font-medium mb-2'>Chờ duyệt</h3>
          <p className='text-3xl font-bold text-gray-800'>8</p>
        </div>

        <div className='bg-white rounded-lg shadow p-6 border-l-4 border-red-500'>
          <h3 className='text-gray-500 text-sm font-medium mb-2'>Bài báo</h3>
          <p className='text-3xl font-bold text-gray-800'>45</p>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-bold text-gray-800 mb-4'>Chức năng quản lý</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <button className='p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left'>
            <h3 className='font-semibold text-gray-800 mb-1'>Quản lý sự kiện</h3>
            <p className='text-sm text-gray-600'>Tạo, sửa, xóa sự kiện</p>
          </button>

          <button className='p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left'>
            <h3 className='font-semibold text-gray-800 mb-1'>Quản lý người dùng</h3>
            <p className='text-sm text-gray-600'>Xem và quản lý users</p>
          </button>

          <button className='p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left'>
            <h3 className='font-semibold text-gray-800 mb-1'>Phê duyệt sự kiện</h3>
            <p className='text-sm text-gray-600'>Duyệt các sự kiện mới</p>
          </button>

          <button className='p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left'>
            <h3 className='font-semibold text-gray-800 mb-1'>Quản lý địa điểm</h3>
            <p className='text-sm text-gray-600'>Thêm/sửa địa điểm tổ chức</p>
          </button>

          <button className='p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left'>
            <h3 className='font-semibold text-gray-800 mb-1'>Quản lý bài báo</h3>
            <p className='text-sm text-gray-600'>Kiểm duyệt bài báo</p>
          </button>

          <button className='p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left'>
            <h3 className='font-semibold text-gray-800 mb-1'>Thống kê báo cáo</h3>
            <p className='text-sm text-gray-600'>Xem báo cáo chi tiết</p>
          </button>
        </div>
      </div>
    </div>
  )
}
