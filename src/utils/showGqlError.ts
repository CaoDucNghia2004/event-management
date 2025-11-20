import Swal from 'sweetalert2'
import { translateMessage } from './translateMessage'

export function showGqlError(error: any) {
  const message =
    error?.graphQLErrors?.[0]?.extensions?.details?.message ||
    error?.errors?.[0]?.details?.message ||
    error?.graphQLErrors?.[0]?.message ||
    error?.message ||
    'Đã xảy ra lỗi.'

  Swal.fire({
    icon: 'error',
    title: 'Lỗi!',
    text: translateMessage(message),
    confirmButtonText: 'Đóng'
  })
}
