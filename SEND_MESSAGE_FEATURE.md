# 📨 Chức năng Gửi Tin nhắn đến Người tham gia

## 🎯 Tổng quan

Tính năng cho phép **Admin/Ban tổ chức** gửi tin nhắn real-time đến tất cả người tham gia sự kiện.

---

## 🔄 Flow Logic theo Status Sự kiện

### **1. Sự kiện OPEN (Đang mở đăng ký)** 🟡

**Đặc điểm:**
- ✅ User đã đăng ký thành công (CONFIRMED)
- ✅ Admin **CÓ THỂ** gửi tin nhắn
- ✅ User **NHẬN ĐƯỢC** tin nhắn real-time
- ✅ Badge: "🟡 Sắp diễn ra"

**Use case:**
- Thông báo chuẩn bị: "Các bạn nhớ mang theo..."
- Thay đổi thông tin: "Địa điểm chuyển sang phòng B..."
- Nhắc nhở: "Sự kiện sẽ bắt đầu vào ngày mai..."

---

### **2. Sự kiện ONGOING (Đang diễn ra)** 🟢

**Đặc điểm:**
- ✅ Sự kiện đang diễn ra
- ✅ Admin **CÓ THỂ** gửi tin nhắn
- ✅ User **NHẬN ĐƯỢC** tin nhắn real-time
- ✅ Badge: "🟢 Đang diễn ra"

**Use case:**
- Thông báo trong sự kiện: "Sự kiện bắt đầu..."
- Hướng dẫn: "Chuyển sang phòng hội thảo..."
- Cập nhật: "Nghỉ giải lao 15 phút..."

---

### **3. Sự kiện COMPLETED (Đã kết thúc)** 📚

**Đặc điểm:**
- ✅ Sự kiện đã kết thúc
- ❌ Admin **KHÔNG THỂ** gửi tin nhắn mới
- ✅ User vẫn **XEM ĐƯỢC** lịch sử tin nhắn (read-only)
- ❌ **KHÔNG** kết nối SSE real-time
- ✅ Badge: "📚 Đã kết thúc"
- ⚠️ Warning: "Sự kiện đã kết thúc. Bạn chỉ có thể xem lại lịch sử tin nhắn."

**Use case:**
- Xem lại thông báo quan trọng
- Lưu trữ lịch sử
- Tham khảo thông tin

---

### **4. Sự kiện CANCELLED (Đã hủy)** ❌

**Đặc điểm:**
- ❌ **KHÔNG** hiển thị trong Messages
- ❌ Admin không thể gửi tin nhắn
- ❌ User không thấy tin nhắn

---

## 📊 Bảng So sánh

| Status | Hiển thị Messages | Real-time SSE | Admin gửi tin nhắn | User nhận tin nhắn | Badge |
|--------|-------------------|---------------|-------------------|-------------------|-------|
| **OPEN** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 🟡 Sắp diễn ra |
| **ONGOING** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 🟢 Đang diễn ra |
| **COMPLETED** | ✅ Yes | ❌ No | ❌ No | ✅ Yes (read-only) | 📚 Đã kết thúc |
| **CANCELLED** | ❌ No | ❌ No | ❌ No | ❌ No | - |

---

## 🎨 UI Components

### **1. Admin - ManageEvents Page**

**Icon gửi tin nhắn:**
```tsx
{/* Chỉ hiện khi OPEN hoặc ONGOING */}
{(event.current_status === 'OPEN' || event.current_status === 'ONGOING') && (
  <button
    onClick={() => setSendMessageEvent(event)}
    className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg'
    title='Gửi tin nhắn đến người tham gia'
  >
    <MessageSquare className='w-5 h-5' />
  </button>
)}
```

**Modal gửi tin nhắn:**
- Component: `SendMessageModal`
- Props: `eventId`, `eventTitle`, `isOpen`, `onClose`
- Features:
  - Textarea (max 1000 ký tự)
  - Character counter
  - Loading state
  - Success/Error notification

---

### **2. User - Messages Page**

**Sidebar - Event List:**
```tsx
// Filter: Chỉ hiện OPEN, ONGOING, COMPLETED
const confirmedRegistrations = registrations.filter(
  (reg) =>
    reg.current_status === 'CONFIRMED' &&
    ['OPEN', 'ONGOING', 'COMPLETED'].includes(reg.event?.current_status)
)
```

**Status Badges:**
- 🟡 Sắp diễn ra (OPEN) - Yellow
- 🟢 Đang diễn ra (ONGOING) - Green
- 📚 Đã kết thúc (COMPLETED) - Gray

**Chat Area:**
- Header: Event info + Warning (nếu COMPLETED)
- Messages: NotificationList component
- Real-time: Chỉ bật cho OPEN và ONGOING

```tsx
<NotificationList
  eventId={selectedEvent.id}
  enableRealtime={
    selectedEvent.current_status === 'OPEN' ||
    selectedEvent.current_status === 'ONGOING'
  }
/>
```

---

### **3. NotificationList Component**

**Real-time Indicator:**
```tsx
{/* OPEN/ONGOING - Real-time */}
{enableRealtime && connected && (
  <div>
    <span className='bg-green-500 animate-pulse'></span>
    Đang nhận tin nhắn mới
  </div>
)}

{/* COMPLETED - Archive */}
{!enableRealtime && notifications.length > 0 && (
  <div>
    <span className='bg-gray-400'></span>
    📚 Lịch sử tin nhắn (Sự kiện đã kết thúc)
  </div>
)}
```

---

## 📁 Files Changed

### **New Files:**
1. ✅ `src/components/SendMessageModal/SendMessageModal.tsx` - Modal gửi tin nhắn
2. ✅ `src/components/SendMessageModal/index.ts` - Export
3. ✅ `SEND_MESSAGE_FEATURE.md` - Documentation

### **Modified Files:**
1. ✅ `src/pages/admin/ManageEvents/ManageEvents.tsx`
   - Import `SendMessageModal`, `MessageSquare`
   - State: `sendMessageEvent`
   - Icon gửi tin nhắn (chỉ OPEN/ONGOING)
   - Render modal

2. ✅ `src/pages/user/Messages/Messages.tsx`
   - Filter: OPEN, ONGOING, COMPLETED
   - Status badges
   - Warning for COMPLETED
   - Real-time logic

3. ✅ `src/components/NotificationList/NotificationList.tsx`
   - Archive indicator for COMPLETED

---

## 🚀 How to Use

### **Admin:**
1. Vào trang "Quản lý sự kiện"
2. Tìm sự kiện có status **OPEN** hoặc **ONGOING**
3. Click icon 💬 "Gửi tin nhắn"
4. Nhập nội dung (max 1000 ký tự)
5. Click "Gửi tin nhắn"
6. ✅ Tin nhắn được gửi real-time đến tất cả người tham gia

### **User:**
1. Vào trang "Tin nhắn"
2. Chọn sự kiện từ sidebar
3. Xem tin nhắn:
   - **OPEN/ONGOING**: Real-time, có indicator xanh
   - **COMPLETED**: Chỉ đọc, có warning, indicator xám

---

## ✅ Checklist

- [x] SendMessageModal component
- [x] Icon gửi tin nhắn trong ManageEvents
- [x] Chỉ hiện icon cho OPEN/ONGOING
- [x] Filter Messages: OPEN, ONGOING, COMPLETED
- [x] Status badges (🟡🟢📚)
- [x] Warning cho COMPLETED
- [x] Real-time logic (chỉ OPEN/ONGOING)
- [x] Archive indicator (COMPLETED)
- [x] Documentation

---

## 🎉 Result

**Perfect implementation!** 

- ✅ Admin gửi tin nhắn cho OPEN/ONGOING
- ✅ User nhận real-time
- ✅ COMPLETED: Read-only, không real-time
- ✅ UI đẹp, logic rõ ràng
- ✅ Badges và warnings đầy đủ

**Ready to use!** 🚀

