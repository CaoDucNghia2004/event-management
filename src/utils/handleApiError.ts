import Swal from 'sweetalert2'
import { translateMessage } from './translateMessage'

export const handleApiError = (error: any) => {
  const graphErrors = error?.response?.data?.errors

  if (!graphErrors || !Array.isArray(graphErrors)) return false

  const err = graphErrors[0]
  const status = err?.status
  const message = err?.details?.message || 'Đã có lỗi xảy ra'

  // ❗ Chỉ xử lý lỗi phân quyền
  const isForbidden = (status === 400 && message.includes('Forbidden')) || status === 403

  if (isForbidden) {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: translateMessage(message)
    })
    return true // báo đã xử lý
  }

  return false
}
