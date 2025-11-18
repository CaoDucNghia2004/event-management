/**
 * Dịch các message tiếng Anh từ backend sang tiếng Việt
 */
export function translateMessage(message: string): string {
  if (!message) return message

  const lowerMessage = message.toLowerCase()

  // Authentication messages
  if (lowerMessage.includes('incorrect email or password')) {
    return 'Email hoặc mật khẩu không đúng!'
  }
  if (lowerMessage.includes('invalid credentials')) {
    return 'Thông tin đăng nhập không hợp lệ!'
  }
  if (lowerMessage.includes('user not found')) {
    return 'Người dùng không tồn tại!'
  }
  if (lowerMessage.includes('email already exists') || lowerMessage.includes('email has already been taken')) {
    return 'Email đã tồn tại!'
  }
  if (lowerMessage.includes('username already exists') || lowerMessage.includes('username has already been taken')) {
    return 'Tên người dùng đã tồn tại!'
  }
  if (lowerMessage.includes('invalid token') || lowerMessage.includes('token is invalid')) {
    return 'Mã xác thực không hợp lệ!'
  }
  if (lowerMessage.includes('token expired') || lowerMessage.includes('token has expired')) {
    return 'Mã xác thực đã hết hạn!'
  }
  if (lowerMessage.includes('unauthorized')) {
    return 'Không có quyền truy cập!'
  }

  // Validation messages
  if (lowerMessage.includes('required') || lowerMessage.includes('is required')) {
    return 'Trường này là bắt buộc!'
  }
  if (lowerMessage.includes('invalid email')) {
    return 'Email không hợp lệ!'
  }
  if (lowerMessage.includes('password too short') || lowerMessage.includes('password must be at least')) {
    return 'Mật khẩu quá ngắn!'
  }
  if (lowerMessage.includes('passwords do not match') || lowerMessage.includes('password confirmation')) {
    return 'Mật khẩu xác nhận không khớp!'
  }

  // Event messages
  if (lowerMessage.includes('event not found')) {
    return 'Sự kiện không tồn tại!'
  }
  if (lowerMessage.includes('event is full')) {
    return 'Sự kiện đã đầy!'
  }
  if (lowerMessage.includes('already registered')) {
    return 'Bạn đã đăng ký sự kiện này rồi!'
  }
  if (lowerMessage.includes('registration not found')) {
    return 'Đăng ký không tồn tại!'
  }

  // Network messages
  if (lowerMessage.includes('network error')) {
    return 'Lỗi kết nối mạng!'
  }
  if (lowerMessage.includes('server error') || lowerMessage.includes('internal server error')) {
    return 'Lỗi máy chủ!'
  }

  // Nếu không match pattern nào, trả về message gốc
  return message
}

