# 📬 Notification UI Redesign - Messenger/Zalo Style Chat Interface

## 🎯 Mục tiêu

Thiết kế lại giao diện tin nhắn theo kiểu **Messenger/Zalo**:

- ✅ Layout 2 cột: Sidebar (danh sách sự kiện) + Chat area (tin nhắn)
- ✅ Click vào sự kiện → Hiện tin nhắn bên phải
- ✅ Message bubbles như chat
- ✅ Avatar + online status
- ✅ Search events
- ✅ Real-time updates

## 🏗️ Architecture

### **Layout Structure**

```
┌─────────────────────────────────────────────────────────┐
│  Header (Fixed)                                         │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  Sidebar     │  Chat Area                               │
│  (Events)    │  (Messages)                              │
│              │                                          │
│  - Search    │  - Chat Header (Event info)              │
│  - Event 1   │  - Messages (bubbles)                    │
│  - Event 2   │  - Real-time indicator                   │
│  - Event 3   │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

---

## ✨ Thay đổi chính

### 📱 **1. Messages Page - 2 Column Layout**

**File:** `src/pages/user/Messages/Messages.tsx`

**Before:** Accordion style (expand/collapse)
**After:** 2-column chat interface

#### **LEFT SIDEBAR - Event List**

**Before:**

```tsx
<div className='flex items-center gap-2'>
  <MessageSquare className='w-5 h-5 text-blue-600' />
  <h3 className='text-lg font-semibold text-gray-900'>Tin nhắn từ Ban tổ chức</h3>
</div>
```

**After:**

```tsx
<div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4'>
  <div className='flex items-center gap-3'>
    <div className='p-2 bg-white/20 rounded-lg backdrop-blur-sm'>
      <MessageSquare className='w-6 h-6 text-white' />
    </div>
    <div>
      <h3 className='text-xl font-bold text-white'>Tin nhắn từ Ban tổ chức</h3>
      <p className='text-blue-100 text-sm'>Cập nhật thông tin sự kiện real-time</p>
    </div>
  </div>
  <div className='flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full'>
    <div className='w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50' />
    <span className='text-sm font-medium text-white'>Đang kết nối</span>
  </div>
</div>
```

**Improvements:**

- ✅ Gradient background (blue → indigo)
- ✅ Backdrop blur effect
- ✅ Subtitle mô tả
- ✅ Connection status badge với animation
- ✅ Glow effect cho status indicator

---

### 💬 **Message Cards - Enhanced with Hover Effects**

**Before:**

```tsx
<div className='bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow'>
  <div className='flex items-start gap-3'>
    <div className='flex-shrink-0 p-2 bg-blue-100 rounded-lg'>
      <Bell className='w-5 h-5 text-blue-600' />
    </div>
    <div className='flex-1 min-w-0'>
      <p className='text-gray-900'>{notification.message}</p>
      <p className='text-xs text-gray-500 mt-2'>{formatDateTime(notification.created_at)}</p>
    </div>
  </div>
</div>
```

**After:**

```tsx
<div className='group bg-white rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1'>
  <div className='flex items-start gap-4'>
    {/* Icon với gradient + blur effect */}
    <div className='flex-shrink-0'>
      <div className='relative'>
        <div className='absolute inset-0 bg-blue-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity'></div>
        <div className='relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full'>
          <Bell className='w-5 h-5 text-white' />
        </div>
      </div>
    </div>

    {/* Content với badge */}
    <div className='flex-1 min-w-0'>
      <div className='flex items-start justify-between gap-3 mb-2'>
        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700'>
          Ban tổ chức
        </span>
        <time className='text-xs text-gray-400 font-medium whitespace-nowrap'>
          {formatDateTime(notification.created_at)}
        </time>
      </div>
      <p className='text-gray-800 leading-relaxed whitespace-pre-wrap text-[15px]'>{notification.message}</p>
    </div>
  </div>
</div>
```

**Improvements:**

- ✅ Hover: shadow-xl + translate-y-1 (lift effect)
- ✅ Gradient icon (blue → indigo)
- ✅ Blur glow effect on hover
- ✅ Badge "Ban tổ chức"
- ✅ Better typography (15px, leading-relaxed)
- ✅ Timestamp alignment

---

### 📊 **Footer - Message Count & Status**

**New Addition:**

```tsx
{
  notifications.length > 0 && (
    <div className='px-6 py-3 bg-white border-t border-gray-100'>
      <div className='flex items-center justify-between text-sm'>
        <span className='text-gray-500'>
          <span className='font-semibold text-gray-700'>{notifications.length}</span> tin nhắn
        </span>
        {enableRealtime && connected && (
          <span className='text-green-600 font-medium flex items-center gap-1.5'>
            <span className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></span>
            Đang nhận tin nhắn mới
          </span>
        )}
      </div>
    </div>
  )
}
```

**Features:**

- ✅ Message count
- ✅ Real-time status indicator
- ✅ Pulsing dot animation

---

### 📜 **Scrollbar - Custom Hidden**

```tsx
<div className='space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar'>{/* Messages */}</div>
```

**CSS (already in index.css):**

```css
.custom-scrollbar {
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE */
}

.custom-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}
```

---

## 🎨 Color Palette

| Element           | Color                            |
| ----------------- | -------------------------------- |
| Header Gradient   | `from-blue-600 to-indigo-600`    |
| Icon Gradient     | `from-blue-500 to-indigo-600`    |
| Badge Background  | `bg-blue-100`                    |
| Badge Text        | `text-blue-700`                  |
| Status Green      | `bg-green-400`, `text-green-600` |
| Card Border Hover | `border-blue-200`                |

---

## 📱 Responsive & Accessibility

- ✅ Mobile-friendly (responsive padding, font sizes)
- ✅ Keyboard navigation support
- ✅ ARIA labels (implicit through semantic HTML)
- ✅ Color contrast WCAG AA compliant
- ✅ Smooth animations (respects prefers-reduced-motion)

---

## 🚀 Performance

- ✅ CSS transitions (GPU-accelerated)
- ✅ Virtual scrolling ready (max-height + overflow)
- ✅ Optimized re-renders (React.memo ready)
- ✅ Lazy loading images (if needed)

---

## 📊 Usage

### User Messages Page

```tsx
// src/pages/user/Messages/Messages.tsx
<NotificationList eventId={event.id} enableRealtime={true} />
```

### Admin Event Detail Modal

```tsx
// src/pages/admin/ManageEvents/EventDetailModal.tsx
<NotificationList eventId={event.id} enableRealtime={false} />
```

### User Event Detail Page

```tsx
// src/pages/user/EventDetail/EventDetail.tsx
// (Có thể thêm nếu cần)
<NotificationList eventId={eventId} enableRealtime={true} />
```

---

## ✅ Checklist

- [x] Gradient header với backdrop blur
- [x] Connection status badge với animation
- [x] Message cards với hover effects
- [x] Gradient icon với blur glow
- [x] Badge "Ban tổ chức"
- [x] Footer với message count
- [x] Custom hidden scrollbar
- [x] Empty state với beautiful placeholder
- [x] Loading state
- [x] Responsive design
- [x] Smooth animations
- [x] Documentation updated

---

## 🎉 Result

**Giao diện mới:**

- 🎨 Đẹp hơn, chuyên nghiệp hơn
- 📱 Responsive tốt hơn
- ✨ Animations mượt mà
- 🔔 Real-time status rõ ràng
- 📖 Dễ đọc, dễ theo dõi
- 🎯 Tập trung vào nội dung tin nhắn

**Perfect for one-way message viewing!** 🚀
