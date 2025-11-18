# 💬 Messenger/Zalo Style Chat Interface - Complete Redesign

## 🎯 Overview

Redesigned notification system to look like **Messenger/Zalo** chat interface:

- **2-column layout**: Event list (left) + Chat area (right)
- **Click to view**: Select event → View messages
- **Chat bubbles**: Message bubbles with avatar
- **Real-time**: SSE updates with online status
- **Search**: Filter events by name

---

## 🏗️ Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  📱 Header (Fixed)                                              │
│  💬 Tin nhắn                                                    │
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│  📋 SIDEBAR      │  💬 CHAT AREA                                │
│  (w-96)          │  (flex-1)                                    │
│                  │                                              │
│  🔍 Search       │  ┌────────────────────────────────────────┐ │
│  ┌────────────┐  │  │ Event Header (image + title + date)   │ │
│  │ Event 1    │  │  └────────────────────────────────────────┘ │
│  │ 📅 Date    │  │                                              │
│  └────────────┘  │  ┌─ Message Bubble 1 ──────────────────┐   │
│  ┌────────────┐  │  │ 👤 Ban tổ chức  • 10:30              │   │
│  │ Event 2    │  │  │ ┌──────────────────────────────────┐ │   │
│  │ 📅 Date    │  │  │ │ Xin chào các bạn...              │ │   │
│  └────────────┘  │  │ └──────────────────────────────────┘ │   │
│  ┌────────────┐  │  └──────────────────────────────────────┘   │
│  │ Event 3    │  │                                              │
│  │ 📅 Date    │  │  ┌─ Message Bubble 2 ──────────────────┐   │
│  └────────────┘  │  │ 👤 Ban tổ chức  • 11:45              │   │
│                  │  │ ┌──────────────────────────────────┐ │   │
│                  │  │ │ Sự kiện sẽ bắt đầu lúc...        │ │   │
│                  │  │ └──────────────────────────────────┘ │   │
│                  │  └──────────────────────────────────────┘   │
│                  │                                              │
│                  │  🟢 Đang nhận tin nhắn mới                   │
└──────────────────┴──────────────────────────────────────────────┘
```

---

## 📁 Files Changed

### 1. **Messages Page** - `src/pages/user/Messages/Messages.tsx`

**Changes:**

- ✅ 2-column layout: Sidebar + Chat area
- ✅ Search bar for filtering events
- ✅ Event list with images
- ✅ Selected state highlighting
- ✅ Chat header with event info
- ✅ Empty state when no event selected

**Key Features:**

```tsx
// State
const [selectedEvent, setSelectedEvent] = useState<Registration['event'] | null>(null)
const [searchQuery, setSearchQuery] = useState('')

// Filter events
const filteredRegistrations = confirmedRegistrations.filter((reg) => {
  return event.title.toLowerCase().includes(searchQuery.toLowerCase())
})

// Layout
<div className='flex h-full'>
  {/* LEFT: Event List */}
  <div className='w-96 bg-white border-r'>
    <Search />
    <EventList />
  </div>

  {/* RIGHT: Chat Area */}
  <div className='flex-1 bg-gray-50'>
    {selectedEvent ? (
      <>
        <ChatHeader />
        <NotificationList eventId={selectedEvent.id} />
      </>
    ) : (
      <EmptyState />
    )}
  </div>
</div>
```

---

### 2. **NotificationList Component** - `src/components/NotificationList/NotificationList.tsx`

**Changes:**

- ✅ Removed gradient header (now in page)
- ✅ Removed footer (now in page)
- ✅ Chat bubble style messages
- ✅ Avatar with online status
- ✅ Simplified layout for embedding

**Message Bubble Design:**

```tsx
<div className='flex items-start gap-3'>
  {/* Avatar */}
  <div className='relative'>
    <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full'>
      <Bell className='w-5 h-5 text-white' />
    </div>
    {/* Online status */}
    <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-50 rounded-full'></div>
  </div>

  {/* Message */}
  <div className='flex-1'>
    <div className='flex items-baseline gap-2 mb-1'>
      <span className='text-sm font-semibold'>Ban tổ chức</span>
      <time className='text-xs text-gray-400'>{time}</time>
    </div>
    <div className='bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm'>
      <p>{message}</p>
    </div>
  </div>
</div>
```

---

### 3. **Registration Types** - `src/types/registration.types.ts`

**Changes:**

- ✅ Added `image_url` to event type

```tsx
event?: {
  id: string
  title: string
  image_url?: string  // ← NEW
  // ...
}
```

---

### 4. **GraphQL Query** - `src/graphql/queries/registrationQueries.ts`

**Changes:**

- ✅ Added `image_url` field to query

```graphql
event {
  id
  title
  image_url  # ← NEW
  start_date
  end_date
  # ...
}
```

---

## 🎨 UI Components

### **Sidebar Event Item**

```tsx
<button className='w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50'>
  {/* Image */}
  <div className='w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100'>
    {event.image_url ? <img src={event.image_url} /> : <Calendar className='w-6 h-6 text-blue-600' />}
  </div>

  {/* Info */}
  <div className='flex-1 text-left'>
    <h3 className='text-sm font-semibold truncate'>{event.title}</h3>
    <p className='text-xs text-gray-500'>{event.location?.name}</p>
    <p className='text-xs text-gray-400'>{formatDate(event.start_date)}</p>
  </div>

  {/* Selected indicator */}
  {isSelected && <div className='w-2 h-2 bg-blue-600 rounded-full'></div>}
</button>
```

---

## 🎯 User Experience

### **Flow:**

1. **User opens Messages page**
   - Sees list of registered events on left
   - Empty state on right: "Chọn một sự kiện"

2. **User searches for event**
   - Types in search box
   - Event list filters in real-time

3. **User clicks on event**
   - Event highlights in blue
   - Chat area shows event header
   - Messages load via SSE
   - Real-time indicator appears

4. **User receives new message**
   - New message bubble appears
   - Smooth fade-in animation
   - Auto-scroll to bottom (optional)

---

## 📊 Responsive Design

- **Desktop (>1024px)**: Full 2-column layout
- **Tablet (768-1024px)**: Narrower sidebar (w-80)
- **Mobile (<768px)**: Stack layout or modal (future enhancement)

---

## ✅ Checklist

- [x] 2-column layout (sidebar + chat)
- [x] Search events
- [x] Event list with images
- [x] Selected state highlighting
- [x] Chat header with event info
- [x] Message bubbles with avatar
- [x] Online status indicator
- [x] Real-time SSE updates
- [x] Empty states
- [x] Loading states
- [x] Custom scrollbar
- [x] Smooth animations
- [x] Type safety (TypeScript)
- [x] GraphQL query updated
- [x] Documentation

---

## 🚀 Result

**Perfect Messenger/Zalo style chat interface!** 🎉

- 💬 Familiar chat UX
- 🎨 Beautiful design
- ⚡ Real-time updates
- 📱 Responsive layout
- 🔍 Search functionality
- ✨ Smooth animations
