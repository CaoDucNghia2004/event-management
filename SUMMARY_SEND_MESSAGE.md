# ✅ HOÀN THÀNH: Chức năng Gửi Tin nhắn đến Người tham gia

## 🎯 Đã làm gì?

Tạo chức năng **"Gửi tin nhắn đến người tham gia"** cho Admin với logic theo status sự kiện.

---

## 📊 Logic theo Status

| Status           | Admin gửi tin nhắn | User nhận real-time | User xem lịch sử   | Badge        |
| ---------------- | ------------------ | ------------------- | ------------------ | ------------ |
| **OPEN** 🟡      | ✅ Yes             | ✅ Yes              | ✅ Yes             | Sắp diễn ra  |
| **ONGOING** 🟢   | ✅ Yes             | ✅ Yes              | ✅ Yes             | Đang diễn ra |
| **COMPLETED** 📚 | ❌ No              | ❌ No               | ✅ Yes (read-only) | Đã kết thúc  |
| **CANCELLED** ❌ | ❌ No              | ❌ No               | ❌ No              | -            |

---

## 📁 Files Created

### **1. SendMessageModal Component**

```
src/components/SendMessageModal/
├── SendMessageModal.tsx  ← Modal gửi tin nhắn
└── index.ts              ← Export
```

**Features:**

- ✅ Gradient header (blue → indigo)
- ✅ Textarea (max 1000 ký tự)
- ✅ Character counter
- ✅ Loading state
- ✅ Success/Error notification (SweetAlert2)
- ✅ Validation

---

## 📝 Files Modified

### **1. ManageEvents.tsx** - Admin Page

**Changes:**

```tsx
// Import
import { MessageSquare } from 'lucide-react'
import SendMessageModal from '../../../components/SendMessageModal'

// State
const [sendMessageEvent, setSendMessageEvent] = useState<Event | null>(null)

// Icon gửi tin nhắn (chỉ OPEN/ONGOING)
{
  ;(event.current_status === 'OPEN' || event.current_status === 'ONGOING') && (
    <button onClick={() => setSendMessageEvent(event)}>
      <MessageSquare className='w-5 h-5' />
    </button>
  )
}

// Modal
{
  sendMessageEvent && (
    <SendMessageModal
      isOpen={!!sendMessageEvent}
      onClose={() => setSendMessageEvent(null)}
      eventId={sendMessageEvent.id}
      eventTitle={sendMessageEvent.title}
    />
  )
}
```

---

### **2. Messages.tsx** - User Page

**Changes:**

```tsx
// Filter: Chỉ hiện OPEN, ONGOING, COMPLETED
const confirmedRegistrations = registrations.filter(
  (reg) => reg.current_status === 'CONFIRMED' && ['OPEN', 'ONGOING', 'COMPLETED'].includes(reg.event?.current_status)
)

// Status badges trong sidebar
{
  event.current_status === 'OPEN' && <span className='bg-yellow-100 text-yellow-700'>🟡 Sắp diễn ra</span>
}
{
  event.current_status === 'ONGOING' && <span className='bg-green-100 text-green-700'>🟢 Đang diễn ra</span>
}
{
  event.current_status === 'COMPLETED' && <span className='bg-gray-100 text-gray-600'>📚 Đã kết thúc</span>
}

// Warning cho COMPLETED
{
  selectedEvent.current_status === 'COMPLETED' && (
    <div className='bg-gray-50 border border-gray-200'>
      ⚠️ Sự kiện đã kết thúc. Bạn chỉ có thể xem lại lịch sử tin nhắn.
    </div>
  )
}

// Real-time logic
;<NotificationList
  eventId={selectedEvent.id}
  enableRealtime={selectedEvent.current_status === 'OPEN' || selectedEvent.current_status === 'ONGOING'}
/>
```

---

### **3. NotificationList.tsx** - Component

**Changes:**

```tsx
// Archive indicator cho COMPLETED
{
  !enableRealtime && notifications.length > 0 && (
    <div>
      <span className='bg-gray-400'></span>
      Lịch sử tin nhắn (Sự kiện đã kết thúc)
    </div>
  )
}
```

---

### **4. notification.ts** - API Requests

**Changes:**

```tsx
// Export named function
export const sendNotification = (body: CreateNotificationInput) =>
  http.post<NotificationResponse>('/api/v1/notification', body)
```

---

## 🎨 UI Screenshots

### **Admin - ManageEvents**

```
┌─────────────────────────────────────────────────────────┐
│  STT │ Tên sự kiện │ ... │ Trạng thái │ Hành động      │
├──────┼─────────────┼─────┼────────────┼────────────────┤
│  1   │ Event A     │ ... │ ONGOING    │ 👁️ 💬 📋 ✏️ 🗑️ │
│  2   │ Event B     │ ... │ OPEN       │ 👁️ 💬 ✏️ 🗑️    │
│  3   │ Event C     │ ... │ COMPLETED  │ 👁️ ✏️ 🗑️       │
└──────┴─────────────┴─────┴────────────┴────────────────┘
                                            ↑
                                    Icon 💬 chỉ hiện
                                    khi OPEN/ONGOING
```

### **SendMessageModal**

```
┌─────────────────────────────────────────────────────┐
│  💬 Gửi tin nhắn đến người tham gia            ✕   │
│  Event Title                                        │
├─────────────────────────────────────────────────────┤
│  Nội dung tin nhắn                                  │
│  ┌───────────────────────────────────────────────┐ │
│  │ Nhập nội dung tin nhắn...                     │ │
│  │                                               │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│  Tin nhắn sẽ được gửi real-time...   0/1000 ký tự  │
│                                                     │
│  [ 📤 Gửi tin nhắn ]  [ Hủy ]                      │
└─────────────────────────────────────────────────────┘
```

### **User - Messages Page**

```
┌─────────────────────────────────────────────────────┐
│  💬 Tin nhắn                                        │
├──────────────────┬──────────────────────────────────┤
│  🔍 Search       │  📅 Event Title                  │
│  ┌────────────┐  │  📍 Location • 📅 Date           │
│  │ Event A    │  │  ⚠️ Sự kiện đã kết thúc...      │
│  │ 🟢 Đang... │  │  ┌──────────────────────────┐   │
│  └────────────┘  │  │ 👤 Ban tổ chức • 10:30   │   │
│  ┌────────────┐  │  │ ┌──────────────────────┐ │   │
│  │ Event B    │  │  │ │ Xin chào...          │ │   │
│  │ 🟡 Sắp...  │  │  │ └──────────────────────┘ │   │
│  └────────────┘  │  └──────────────────────────┘   │
│  ┌────────────┐  │  📚 Lịch sử tin nhắn (Đã kết...) │
│  │ Event C    │  │                                  │
│  │ 📚 Đã...   │  │                                  │
│  └────────────┘  │                                  │
└──────────────────┴──────────────────────────────────┘
```

---

## ✅ Checklist

- [x] SendMessageModal component
- [x] Icon 💬 trong ManageEvents
- [x] Chỉ hiện icon cho OPEN/ONGOING
- [x] Filter Messages: OPEN, ONGOING, COMPLETED
- [x] Status badges (🟡🟢📚)
- [x] Warning cho COMPLETED
- [x] Real-time logic (chỉ OPEN/ONGOING)
- [x] Archive indicator (COMPLETED)
- [x] Export sendNotification function
- [x] Documentation (SEND_MESSAGE_FEATURE.md)
- [x] Build success (no errors)

---

## 🚀 How to Test

### **Admin:**

1. Login as admin
2. Vào "Quản lý sự kiện"
3. Tìm sự kiện **OPEN** hoặc **ONGOING**
4. Click icon 💬
5. Nhập tin nhắn
6. Click "Gửi tin nhắn"
7. ✅ Success notification

### **User:**

1. Login as user (đã đăng ký sự kiện)
2. Vào "Tin nhắn"
3. Chọn sự kiện:
   - **OPEN/ONGOING**: Thấy 🟢 real-time indicator
   - **COMPLETED**: Thấy ⚠️ warning + 📚 archive indicator
4. Nhận tin nhắn real-time (nếu OPEN/ONGOING)

---

## 🎉 Result

**Perfect implementation!**

✅ Admin gửi tin nhắn cho OPEN/ONGOING  
✅ User nhận real-time  
✅ COMPLETED: Read-only, không real-time  
✅ UI đẹp, logic rõ ràng  
✅ Badges và warnings đầy đủ  
✅ Build success

**Ready to use!** 🚀
