import { MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className='bg-[#0b63a5] text-white'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
          {/* Left side - University info and contact */}
          <div className='flex-1 lg:max-w-xl space-y-6'>
            {/* Logo and University name */}
            <div className='flex items-center gap-4'>
              <img src='/logo1.jpg' alt='HUIT' className='h-20 w-auto rounded-sm' />
              <div>
                <div className='text-xl md:text-2xl font-bold leading-tight'>TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HCM</div>
                <div className='text-sm md:text-base opacity-90 mt-1'>HCM UNIVERSITY OF INDUSTRY AND TRADE</div>
              </div>
            </div>

            {/* School code */}
            <div className='border-t border-blue-600 pt-4'>
              <div className='flex items-center gap-3'>
                <div>
                  <div className='text-base font-semibold opacity-90'>MÃ TRƯỜNG</div>
                  <div className='text-2xl font-bold'>DCT</div>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className='space-y-3 text-sm md:text-base'>
              <div className='flex items-start gap-3'>
                <MapPin className='w-5 h-5 mt-1 flex-shrink-0' />
                <div>
                  <div className='font-semibold mb-1'>Địa chỉ:</div>
                  <div>140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, Thành phố Hồ Chí Minh, Việt Nam</div>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Phone className='w-5 h-5 mt-1 flex-shrink-0' />
                <div>
                  <div className='font-semibold mb-1'>Điện thoại:</div>
                  <div>028 6270 6275 - 096 205 1080</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Google Maps */}
          <div className='flex-1 lg:pl-8'>
            <div className='w-full h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg'>
              <iframe
                title='Bản đồ HUIT - Trường Đại học Công Thương TP.HCM'
                src='https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=140+Lê+Trọng+Tấn,+Tây+Thạnh,+Tân+Phú,+Thành+phố+Hồ+Chí+Minh,+Việt+Nam&zoom=17&language=vi'
                width='100%'
                height='100%'
                style={{ border: 0 }}
                allowFullScreen
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lower/light footer removed per user request - the blue band above is the main footer now */}
    </footer>
  )
}
