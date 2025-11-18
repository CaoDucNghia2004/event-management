import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users } from 'lucide-react'

const slides = [
  {
    id: 1,
    image: '/HUIT1.jpg',
    title: 'Chào mừng đến với HUIT Event Management',
    description: 'Nền tảng quản lý sự kiện hàng đầu cho sinh viên và giảng viên'
  },
  {
    id: 2,
    image: '/HUIT2.jpg',
    title: 'Khám phá các sự kiện học thuật',
    description: 'Tham gia hội thảo, hội nghị và các hoạt động học thuật chất lượng cao'
  },
  {
    id: 3,
    image: '/HUIT3.jpg',
    title: 'Kết nối và phát triển',
    description: 'Gặp gỡ các chuyên gia, mở rộng mạng lưới và nâng cao kiến thức'
  }
]

// features data removed — not used on this student-focused homepage

export default function Home() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Slider */}
      <div className='relative w-full h-[600px] overflow-hidden bg-black'>
        {/* Slides */}
        <div className='relative w-full h-full'>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide
                  ? 'opacity-100 translate-x-0'
                  : index < currentSlide
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
              }`}
            >
              {/* Image with overlay */}
              <div className='relative w-full h-full'>
                <img
                  src={slide.image}
                  alt={slide.title}
                  className='w-full h-full object-cover opacity-60'
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                {/* Dark overlay */}
                <div className='absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60'></div>
              </div>

              {/* Content */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-center text-white px-4 max-w-4xl'>
                  <h1 className='text-5xl md:text-6xl font-bold mb-6 animate-fade-in'>{slide.title}</h1>
                  <p className='text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in-delay'>{slide.description}</p>
                  <button className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg'>
                    Khám phá ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all'
          aria-label='Previous slide'
        >
          <ChevronLeft className='w-6 h-6' />
        </button>
        <button
          onClick={nextSlide}
          className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all'
          aria-label='Next slide'
        >
          <ChevronRight className='w-6 h-6' />
        </button>

        {/* Dots Indicator */}
        <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3'>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all rounded-full ${
                index === currentSlide ? 'bg-white w-12 h-3' : 'bg-white/50 w-3 h-3 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* About/Intro Section */}
      <div className='bg-white py-20'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            {/* Text Content */}
            <div className='space-y-6'>
              <div className='inline-block px-6 py-3 bg-blue-50 text-blue-600 rounded-full text-lg font-semibold mb-4'>
                Hệ thống dành cho sinh viên HUIT
              </div>
              <h2 className='text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight'>
                Nền tảng quản lý sự kiện học thuật hiện đại
              </h2>
              <p className='text-lg md:text-xl text-gray-600 leading-relaxed'>
                Đại Học Công Thương mang đến cho sinh viên một hệ thống quản lý sự kiện hoàn toàn mới - nơi bạn có thể
                dễ dàng khám phá, đăng ký và tham gia các hoạt động học thuật, workshop kỹ năng mềm và sự kiện ngoại
                khóa.
              </p>
              <p className='text-lg text-gray-600 leading-relaxed'>
                Với giao diện thân thiện và quy trình đăng ký đơn giản, chúng tôi giúp bạn không bỏ lỡ bất kỳ cơ hội nào
                để học hỏi, kết nối và phát triển bản thân trong môi trường đại học năng động.
              </p>
              <div className='flex gap-8 pt-6'>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-blue-600 mb-1'>500+</div>
                  <div className='text-sm text-gray-600 font-medium'>Sự kiện</div>
                </div>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-blue-600 mb-1'>10K+</div>
                  <div className='text-sm text-gray-600 font-medium'>Sinh viên tham gia</div>
                </div>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-blue-600 mb-1'>50+</div>
                  <div className='text-sm text-gray-600 font-medium'>Địa điểm tổ chức</div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className='relative'>
              <div className='rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300'>
                <img src='/HUIT2.jpg' alt='HUIT Campus' className='w-full h-auto object-cover' />
              </div>
              {/* Decorative element */}
              <div className='absolute -bottom-6 -right-6 w-48 h-48 bg-blue-100 rounded-2xl -z-10'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section removed as requested — homepage continues with About/Intro then Events Showcase */}

      {/* Events Showcase Section */}
      <div className='bg-gradient-to-b from-gray-50 to-white py-20'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='text-center mb-16'>
            <div className='inline-block px-6 py-3 bg-blue-50 text-blue-600 rounded-full text-lg font-semibold mb-4'>
              Các hoạt động nổi bật
            </div>
            <div className='flex items-center justify-center gap-4 mb-4'>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-800'>Sự kiện & Hội thảo tại HUIT</h2>
              <img src='/logo1.jpg' alt='HUIT logo' className='h-16 w-auto rounded-md shadow-sm' />
            </div>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Khám phá những hoạt động học thuật, workshop và hội thảo chất lượng cao dành cho sinh viên
            </p>
          </div>

          {/* Events Grid */}
          <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-12'>
            {/* Event Card 1 */}
            <div className='group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2'>
              <div className='relative h-96 overflow-hidden'>
                <img
                  src='/HUIT2.jpg'
                  alt='Hội thảo học thuật'
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'></div>
                <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
                  <div className='inline-block px-4 py-2 bg-blue-600 rounded-full text-sm font-semibold mb-3'>
                    Học thuật
                  </div>
                  <h3 className='text-3xl font-bold mb-2'>Hội thảo Khoa học Công nghệ</h3>
                  <p className='text-base text-gray-200 mb-3'>
                    Cập nhật xu hướng công nghệ mới nhất từ các chuyên gia hàng đầu
                  </p>
                  <div className='flex items-center gap-3 text-sm'>
                    <Calendar className='w-5 h-5' />
                    <span>Hàng tháng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Card 2 */}
            <div className='group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2'>
              <div className='relative h-96 overflow-hidden'>
                <img
                  src='/HUIT3.jpg'
                  alt='Workshop kỹ năng'
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'></div>
                <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
                  <div className='inline-block px-4 py-2 bg-green-600 rounded-full text-sm font-semibold mb-3'>
                    Kỹ năng mềm
                  </div>
                  <h3 className='text-3xl font-bold mb-2'>Workshop Kỹ năng Nghề nghiệp</h3>
                  <p className='text-base text-gray-200 mb-3'>
                    Rèn luyện kỹ năng thuyết trình, làm việc nhóm và giao tiếp hiệu quả
                  </p>
                  <div className='flex items-center gap-3 text-sm'>
                    <Users className='w-5 h-5' />
                    <span>100+ sinh viên tham gia</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Card 3 */}
            <div className='group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2'>
              <div className='relative h-96 overflow-hidden'>
                <img
                  src='/HUIT4.jpg'
                  alt='Sự kiện ngoại khóa'
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'></div>
                <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
                  <div className='inline-block px-4 py-2 bg-purple-600 rounded-full text-sm font-semibold mb-3'>
                    Ngoại khóa
                  </div>
                  <h3 className='text-3xl font-bold mb-2'>Hoạt động Văn hóa - Thể thao</h3>
                  <p className='text-base text-gray-200 mb-3'>
                    Tham gia các hoạt động vui chơi, giải trí và giao lưu văn hóa
                  </p>
                  <div className='flex items-center gap-3 text-sm'>
                    <MapPin className='w-5 h-5' />
                    <span>Sân trường HUIT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View All Button */}
          <div className='text-center mt-12'>
            <button
              onClick={() => navigate('/events')}
              className='bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg'
            >
              Xem tất cả sự kiện
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section: make horizontal and remove image wrapper/background/shadow */}
      <div className='py-12'>
        <div className='max-w-7xl mx-auto px-4'>
          {/* Force horizontal layout; allow wrap for small screens */}
          <div className='flex flex-row items-center justify-start gap-4 flex-wrap'>
            {/* Left: text (left aligned) */}
            <div className='text-left flex-1 min-w-0'>
              <h2 className='text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-4 md:whitespace-nowrap leading-tight'>
                Sẵn sàng tham gia?
              </h2>
              <p className='text-lg md:text-xl text-gray-700 mb-6'>
                Đăng ký ngay để không bỏ lỡ các sự kiện học thuật hấp dẫn
              </p>
              <div className='flex gap-4'>
                <button className='bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow'>
                  Đăng ký ngay
                </button>
                <button className='bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-900 transition-all'>
                  Tìm hiểu thêm
                </button>
              </div>
            </div>

            {/* Right: promotional image (no background / no shadow) */}
            <div className='shrink-0'>
              <img src='/quangcao.png' alt='Quảng cáo' className='w-80 md:w-[520px] lg:w-[640px] object-contain' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
