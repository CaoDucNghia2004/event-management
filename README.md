# 🎉 Event Management System

Hệ thống quản lý sự kiện với React + TypeScript + Vite + Laravel + GraphQL + MongoDB

## 📋 Tính năng chính

### 🎯 Quản lý Sự kiện

- ✅ Tạo, sửa, xóa sự kiện
- ✅ Phê duyệt/Từ chối sự kiện
- ✅ Chuyển trạng thái sự kiện (PENDING → ONGOING → COMPLETED)
- ✅ Hủy sự kiện
- ✅ Kiểm tra trùng lịch tự động
- ✅ Upload ảnh sự kiện

### 📍 Quản lý Địa điểm

- ✅ CRUD địa điểm
- ✅ Kiểm tra dependency với sự kiện

### 📬 **Tin nhắn Real-time (SSE) - Messenger/Zalo Style**

- ✅ **Server-Sent Events (SSE)** - Nhận tin nhắn real-time
- ✅ **2-Column Layout** - Sidebar (danh sách sự kiện) + Chat area (tin nhắn)
- ✅ **Chat Interface** - Message bubbles với avatar như Messenger/Zalo
- ✅ **Search Events** - Tìm kiếm sự kiện nhanh chóng
- ✅ **Click to View** - Click vào sự kiện → Xem tin nhắn
- ✅ **Auto-update** - Tin nhắn mới tự động xuất hiện
- ✅ **Connection status** - Hiển thị trạng thái kết nối real-time
- ✅ **Heartbeat** - Giữ connection sống mỗi 2 giây
- ✅ **Timeout** - Tự động ngắt sau 5 phút
- ✅ **Beautiful UI** - Chat bubbles, avatars, smooth animations

### 👥 Quản lý Người dùng

- ✅ Đăng ký, đăng nhập, đăng xuất
- ✅ Phân quyền theo role
- ✅ Kích hoạt tài khoản qua email
- ✅ Quên mật khẩu

### 📊 Dashboard & Analytics

- ✅ Thống kê sự kiện
- ✅ Biểu đồ phân tích
- ✅ Quản lý đăng ký tham gia

## 🚀 Tech Stack

### Frontend

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Apollo Client** - GraphQL client
- **React Hook Form** + **Zod** - Form validation
- **Zustand** - State management
- **Axios** - HTTP client
- **SweetAlert2** - Beautiful alerts
- **Lucide React** - Icons

### Backend

- **Laravel 11** - PHP Framework
- **MongoDB** - NoSQL Database
- **GraphQL** (Lighthouse) - API
- **JWT Auth** (tymon/jwt-auth) - Authentication
- **SSE** - Server-Sent Events for real-time notifications

## 📬 Notification System (SSE)

### Backend API

**SSE Endpoint:**

```
GET /api/v1/notification/{eventId}?token={jwt_token}
```

**Events gửi từ Backend:**

- `event: initial` - Danh sách tin nhắn ban đầu
- `event: notification` - Tin nhắn mới real-time
- `event: timeout` - Connection timeout (300s)
- `: heartbeat` - Keep-alive comment (2s interval)

**REST API:**

```
POST   /api/v1/notification      - Tạo tin nhắn mới
PUT    /api/v1/notification/{id} - Cập nhật tin nhắn
DELETE /api/v1/notification/{id} - Xóa tin nhắn
GET    /api/v1/notification      - Lấy tất cả tin nhắn
```

### Frontend Component

```tsx
import NotificationList from '@/components/NotificationList/NotificationList'

// Sử dụng trong trang chi tiết sự kiện
;<NotificationList eventId={eventId} enableRealtime={true} />
```

**Features:**

- ✅ Kết nối SSE tự động
- ✅ Nhận tin nhắn real-time
- ✅ Hiển thị trạng thái kết nối
- ✅ Auto cleanup on unmount
- ✅ Beautiful gradient UI
- ✅ Smooth animations
- ✅ Custom scrollbar
- ✅ Loading & Empty states

### UI Design - Messenger/Zalo Style

**Layout:**

- 2-column layout: Sidebar (w-96) + Chat area (flex-1)
- Fixed header with app title
- Full-height layout (calc(100vh - 80px))

**Sidebar (Event List):**

- Search bar at top
- Scrollable event list
- Event items with image/icon
- Selected state highlighting (blue background)
- Event info: title, location, date

**Chat Area:**

- Empty state when no event selected
- Chat header with event info
- Message bubbles with avatar
- Avatar with online status (green dot)
- Timestamp next to sender name
- Real-time indicator at bottom

**Message Bubbles:**

- Avatar: Gradient circle (blue → indigo)
- Online status: Green dot
- Sender name: "Ban tổ chức"
- Bubble: White background, rounded corners
- Rounded-tl-sm for chat bubble effect
- Smooth fade-in animation

**Scrollbar:**

- Custom hidden scrollbar
- Smooth scrolling
- Auto-scroll to bottom (optional)

## 📖 Documentation

Chi tiết API và implementation: [HUONG_DAN_API.md](./HUONG_DAN_API.md)

## 🛠️ Setup & Installation

### Prerequisites

- Node.js >= 18
- PHP >= 8.2
- MongoDB >= 7.0
- Composer

### Frontend Setup

```bash
npm install
npm run dev
```

### Backend Setup

```bash
cd BE_Lavarel_Event_Management
composer install
php artisan key:generate
php artisan jwt:secret
php artisan serve
```

## 🎨 UI Screenshots

### Tin nhắn Real-time - Messenger/Zalo Style

**Layout:**

- **Sidebar**: Danh sách sự kiện với search bar
- **Chat Area**: Message bubbles với avatar
- **Empty State**: "Chọn một sự kiện" placeholder
- **Real-time**: Green dot indicator khi đang kết nối

**Features:**

- Click vào sự kiện → Xem tin nhắn
- Search để filter events
- Message bubbles như chat
- Avatar với online status
- Smooth animations

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname
      }
      // other options...
    }
  }
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname
      }
      // other options...
    }
  }
])
```
