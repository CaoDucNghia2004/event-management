import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router'
import { FileText, Eye, Download, Calendar, Search } from 'lucide-react'
import { GET_PAPERS } from '../../../graphql/queries/paperQueries'
import type { PapersResponse } from '../../../types/paper.types'
import { useState, useMemo } from 'react'

export default function Papers() {
  const { data, loading, error } = useQuery<PapersResponse>(GET_PAPERS)
  const [searchQuery, setSearchQuery] = useState('')

  console.log('Papers query:', { data, loading, error })

  const papers = data?.papers || []

  // Filter papers based on search query - MUST be before any conditional returns
  const filteredPapers = useMemo(() => {
    if (!searchQuery.trim()) return papers

    const query = searchQuery.toLowerCase()
    return papers.filter(
      (paper) =>
        paper.title.toLowerCase().includes(query) ||
        paper.abstract?.toLowerCase().includes(query) ||
        paper.author.some((author) => author.toLowerCase().includes(query))
    )
  }, [papers, searchQuery])

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex justify-center items-center min-h-[400px]'>
          <div className='animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600'></div>
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Papers error details:', error)

    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          <p className='font-semibold mb-2'>Lỗi tải danh sách bài báo:</p>
          <p>{error.message}</p>
          <pre className='text-xs mt-2 bg-red-100 p-2 rounded overflow-auto'>{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      {/* Hero Section with Background Image */}
      <div
        className='relative bg-cover bg-center text-white overflow-hidden min-h-[500px]'
        style={{ backgroundImage: `url("/HUIT5.jpg")` }}
      >
        {/* Image Overlay - Darker for better readability */}
        <div className='absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/75'></div>

        {/* Content */}
        <div className='relative container mx-auto px-4 py-16 max-w-7xl'>
          <div className='flex gap-8 items-center min-h-[400px]'>
            {/* Left: Content */}
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-6'>
                <FileText className='h-7 w-7' />
                <span className='text-base font-semibold uppercase tracking-wider opacity-95'>Thư viện số</span>
              </div>
              <h1 className='text-5xl md:text-6xl font-bold mb-6 leading-tight'>Bài báo khoa học</h1>
              <p className='text-xl md:text-2xl text-white/95 mb-4 leading-relaxed'>
                Khám phá và tìm kiếm trong <span className='font-bold text-yellow-300'>{papers.length}</span> bài báo
                nghiên cứu từ các hội nghị và sự kiện khoa học
              </p>
              <p className='text-base text-white/80 mb-10 max-w-2xl'>
                Truy cập kho tàng tri thức với các công trình nghiên cứu chất lượng cao từ giảng viên và sinh viên HUIT
              </p>

              {/* Search Bar */}
              <div className='relative max-w-2xl'>
                <Search className='absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
                <input
                  type='text'
                  placeholder='Tìm kiếm bài báo, tác giả, từ khóa...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-14 pr-12 py-5 bg-white text-gray-900 rounded-xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-yellow-300/50 transition-all placeholder:text-gray-400 text-base'
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-semibold text-lg'
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Right: Advertisement */}
            <div className='hidden lg:block w-[600px] flex-shrink-0 relative z-10'>
              <img src='/quangcao.png' alt='Quảng cáo' className='w-full h-auto' />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        {/* Results Info */}
        <div className='mb-6'>
          {searchQuery ? (
            <p className='text-gray-700'>
              Tìm thấy <span className='font-semibold text-blue-600'>{filteredPapers.length}</span> kết quả cho "
              {searchQuery}"
            </p>
          ) : (
            <p className='text-gray-600'>Hiển thị {filteredPapers.length} bài báo</p>
          )}
        </div>

        {/* Papers List */}
        {filteredPapers.length === 0 ? (
          <div className='text-center py-20 bg-white rounded-xl shadow-sm'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
              <FileText className='h-8 w-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có bài báo'}
            </h3>
            <p className='text-gray-500'>
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có bài báo nào được đăng tải'}
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredPapers.map((paper) => (
              <Link
                key={paper._id}
                to={`/papers/${paper._id}`}
                className='group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300'
              >
                <div className='p-6'>
                  <div className='flex items-start gap-4'>
                    {/* Icon */}
                    <div className='flex-shrink-0 mt-1'>
                      <div className='w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors'>
                        <FileText className='h-6 w-6 text-blue-600' />
                      </div>
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      {/* Title */}
                      <h3 className='text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2'>
                        {paper.title}
                      </h3>

                      {/* Authors */}
                      <p className='text-sm text-gray-600 mb-3 line-clamp-1'>{paper.author.join(' • ')}</p>

                      {/* Abstract */}
                      {paper.abstract && (
                        <p className='text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed'>{paper.abstract}</p>
                      )}

                      {/* Meta Info */}
                      <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500'>
                        {/* Category */}
                        {paper.category && (
                          <span className='inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full font-medium'>
                            {paper.category}
                          </span>
                        )}

                        {/* Event */}
                        {paper.event && (
                          <div className='flex items-center gap-1.5'>
                            <Calendar className='h-4 w-4' />
                            <span className='line-clamp-1'>{paper.event.title}</span>
                          </div>
                        )}

                        {/* Language */}
                        {paper.language && (
                          <span className='px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium'>
                            {paper.language}
                          </span>
                        )}

                        {/* Stats */}
                        <div className='flex items-center gap-4 ml-auto'>
                          <div className='flex items-center gap-1.5'>
                            <Eye className='h-4 w-4' />
                            <span>{paper.view}</span>
                          </div>
                          <div className='flex items-center gap-1.5'>
                            <Download className='h-4 w-4' />
                            <span>{paper.download}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
