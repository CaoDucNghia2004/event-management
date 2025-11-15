# Hướng Dẫn API - Event Management System

## 📋 Tổng quan

Frontend gọi **100% đúng** những gì Backend cung cấp. Backend xử lý toàn bộ validation và business logic.

---

## 🎯 1. LOCATION API (Địa điểm)

### ✅ **Đã implement đầy đủ**

#### **Queries**

```graphql
# Lấy tất cả locations
query GetAllLocations {
  locations {
    id
    name
    building
    address
    capacity
    created_at
    updated_at
  }
}

# Lấy location theo ID
query GetLocationById($id: ID!) {
  location(id: $id) {
    id
    name
    building
    address
    capacity
  }
}
```

#### **Mutations**

**1. Tạo Location**

```graphql
mutation CreateLocation($name: String!, $building: String, $address: String, $capacity: Int) {
  createLocation(name: $name, building: $building, address: $address, capacity: $capacity) {
    id
    name
    building
    address
    capacity
  }
}
```

**2. Cập nhật Location**

```graphql
mutation UpdateLocation($id: ID!, $name: String, $building: String, $address: String, $capacity: Int) {
  updateLocation(id: $id, name: $name, building: $building, address: $address, capacity: $capacity) {
    id
    name
    building
    address
    capacity
  }
}
```

**3. Xóa Location**

```graphql
mutation DeleteLocation($id: ID!) {
  deleteLocation(id: $id) {
    id
    name
  }
}
```

#### **Backend Validation (Location)**

- ✅ **Xóa location**: Backend kiểm tra nếu có event đang dùng → Throw exception
  ```php
  $eventCount = Event::where('location_id', $locationId)->count();
  if ($eventCount > 0) {
      throw new Exception("Không thể xóa vì còn {$eventCount} sự kiện đang sử dụng địa điểm này.");
  }
  ```

---

## 📅 2. EVENT API (Sự kiện)

### ✅ **Đã implement đầy đủ**

#### **Queries**

```graphql
# Lấy tất cả events
query GetAllEvents {
  events {
    id
    title
    description
    location_id
    start_date
    end_date
    organizer
    topic
    capacity
    waiting_capacity
    image_url
    current_status
    current_approval_status
    location {
      id
      name
      building
      address
    }
    approval_history {
      name
      sequence
      changed_at
    }
    status_history {
      name
      sequence
      changed_at
    }
    created_at
    updated_at
  }
}
```

**⚠️ Lưu ý:** Ban đầu query chỉ lấy thông tin cơ bản, sau đó đã bổ sung thêm `approval_history` và `status_history` để hiển thị lịch sử phê duyệt và trạng thái trong modal chi tiết sự kiện.

```graphql
# Lấy event theo ID
query GetEventById($id: ID!) {
  event(id: $id) {
    id
    title
    description
    # ... all fields
  }
}
```

#### **Mutations**

**1. Tạo Event**

```graphql
mutation CreateEvent(
  $title: String!
  $description: String
  $location_id: String!
  $start_date: DateTime! # Format: "2025-11-20 14:30:00"
  $end_date: DateTime! # Format: "2025-11-20 17:00:00"
  $organizer: String!
  $topic: String
  $capacity: Int!
  $waiting_capacity: Int
  $image_url: String
) {
  createEvent(
    title: $title
    description: $description
    location_id: $location_id
    start_date: $start_date
    end_date: $end_date
    organizer: $organizer
    topic: $topic
    capacity: $capacity
    waiting_capacity: $waiting_capacity
    image_url: $image_url
  ) {
    id
    title
    current_status
    current_approval_status
    created_at
  }
}
```

**⚠️ Validation Backend:**

- `title`: required, max 255 ký tự
- `location_id`: required, phải tồn tại trong DB
- `start_date`: required, phải sau thời điểm hiện tại (`after:now`)
- `end_date`: required, phải sau `start_date`
- `organizer`: required, max 255 ký tự
- `capacity`: required, >= 1
- `waiting_capacity`: optional, >= 0
- `image_url`: optional, phải là URL hợp lệ
- ✅ **Kiểm tra trùng lịch**: Backend tự động kiểm tra xem có event nào cùng location trong khoảng thời gian này không

**📝 Lưu ý về `image_url`:**

- Backend **CHỈ NHẬN URL STRING**, không xử lý upload file trong GraphQL mutation
- Backend có `UploadController.php` với method upload ảnh, nhưng **CHƯA ĐĂNG KÝ ROUTE** trong `routes/api.php`
- Frontend hiện tại **BỎ QUA** field `image_url` trong form tạo/sửa sự kiện
- Để sử dụng upload ảnh: Backend cần thêm route → Frontend gọi REST API upload → Nhận URL → Truyền vào GraphQL mutation

**2. Cập nhật Event**

```graphql
mutation UpdateEvent(
  $id: ID!
  $title: String
  $description: String
  $location_id: String
  $start_date: DateTime
  $end_date: DateTime
  $organizer: String
  $topic: String
  $capacity: Int
  $waiting_capacity: Int
  $image_url: String
) {
  updateEvent(
    id: $id
    title: $title # ... other fields
  ) {
    id
    title
    current_status
  }
}
```

**⚠️ Validation Backend:**

- ✅ **Chỉ update được event APPROVED**: Backend kiểm tra `current_approval_status === 'APPROVED'`
- ✅ **Kiểm tra trùng lịch**: Nếu thay đổi thời gian/địa điểm

**3. Xóa Event**

```graphql
mutation DeleteEvent($id: ID!) {
  deleteEvent(id: $id) {
    id
    title
  }
}
```

**4. Phê duyệt/Từ chối Event**

```graphql
mutation ApproveEvent($id: ID!, $status: String!) {
  updateApprovalStatus(id: $id, status: $status) {
    id
    title
    current_approval_status
    approval_history {
      name
      sequence
      changed_at
    }
  }
}
```

**⚠️ Giá trị hợp lệ cho `status`:**

- `"APPROVED"` - Phê duyệt
- `"REJECTED"` - Từ chối

**5. Chuyển trạng thái Event**

```graphql
mutation AdvanceStatus($id: ID!) {
  advanceStatus(id: $id) {
    id
    title
    current_status
    status_history {
      name
      sequence
      changed_at
    }
  }
}
```

**⚠️ Flow trạng thái:**

- PENDING → ONGOING → COMPLETED
- ✅ Backend chỉ cho phép khi `current_approval_status === 'APPROVED'`

**6. Hủy Event**

```graphql
mutation CancelEvent($id: ID!) {
  cancelEvent(id: $id) {
    id
    title
    current_status
  }
}
```

**⚠️ Validation Backend:**

- ✅ Chỉ hủy được event APPROVED
- ✅ Set `current_status = 'CANCELLED'`

---

## 🔧 3. FORMAT DỮ LIỆU

### **DateTime Format**

Backend Laravel GraphQL yêu cầu:

```
Format: Y-m-d H:i:s
Ví dụ: 2025-11-20 14:30:00
```

**Frontend format trong EventModal.tsx:**

```typescript
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
```

### **Error Format từ Backend**

Backend Laravel trả error với format:

```json
{
  "errors": [
    {
      "status": 400,
      "error": "GRAPHQL_ERROR",
      "details": {
        "message": "Tại địa điểm này đã có sự kiện trùng thời gian..."
      }
    }
  ]
}
```

**Frontend extract error:**

```typescript
const errorMessage = err?.errors?.[0]?.details?.message || 'Lỗi mặc định'
```

---

## 📊 4. BUSINESS LOGIC - Backend xử lý 100%

### **Location**

- ✅ Kiểm tra event dependency khi xóa
- ✅ Validation các trường required

### **Event**

1. ✅ **Validation input**:
   - Required fields
   - Date after now
   - URL format
   - Integer min/max

2. ✅ **Kiểm tra trùng lịch**:
   - Cùng location
   - Thời gian overlap (start/end between existing events)

3. ✅ **Phân quyền**:
   - create-event
   - update-event
   - delete-event
   - approve-event
   - cancel-event
   - add-event-status

4. ✅ **State management**:
   - Approval status: PENDING → APPROVED/REJECTED
   - Event status: PENDING → ONGOING → COMPLETED
   - Chỉ APPROVED mới được update/cancel/advance

---

## ✅ 5. CHECKLIST - Frontend gọi đúng 100%

### **Location Management** ✅

- [x] Query: GET_ALL_LOCATIONS
- [x] Query: GET_LOCATION_BY_ID
- [x] Mutation: CREATE_LOCATION (4 params)
- [x] Mutation: UPDATE_LOCATION (5 params)
- [x] Mutation: DELETE_LOCATION (1 param)
- [x] Error handling: `err.errors[0].details.message`
- [x] UI: ManageLocations.tsx với search, pagination, CRUD

### **Event Management** ✅

- [x] Query: GET_ALL_EVENTS
- [x] Query: GET_EVENT_BY_ID
- [x] Mutation: CREATE_EVENT (10 params)
- [x] Mutation: UPDATE_EVENT (11 params)
- [x] Mutation: DELETE_EVENT (1 param)
- [x] Mutation: APPROVE_EVENT (2 params: id, status)
- [x] Mutation: ADVANCE_STATUS (1 param)
- [x] Mutation: CANCEL_EVENT (1 param)
- [x] DateTime format: YYYY-MM-DD HH:mm:ss
- [x] Error handling: `err.errors[0].details.message`
- [x] UI: ManageEvents.tsx với filter (status, approval), pagination, actions

### **Action Buttons Logic** ✅

- [x] **PENDING approval**:
  - ✅ Phê duyệt (CheckCircle icon)
  - ✅ Từ chối (XCircle icon)
  - ✅ Xóa
- [x] **APPROVED + không COMPLETED/CANCELLED**:
  - ✅ Chuyển trạng thái (PlayCircle icon)
  - ✅ Hủy sự kiện (Ban icon)
  - ✅ Sửa (Edit2 icon)
  - ✅ Xóa
- [x] **COMPLETED/CANCELLED**:
  - ✅ Xóa only

---

## 🎯 KẾT LUẬN

**Frontend đã implement 100% đúng Backend:**

1. ✅ GraphQL schema parameters khớp hoàn toàn
2. ✅ DateTime format đúng chuẩn Laravel
3. ✅ Error handling đúng format Laravel response
4. ✅ Không có business logic custom - chỉ gọi API
5. ✅ Backend xử lý toàn bộ validation:
   - Kiểm tra trùng lịch
   - Kiểm tra phụ thuộc (location-event)
   - Validation date/time
   - Phân quyền
   - State management

**Frontend = UI + API Consumer**  
**Backend = Business Logic + Validation**

### 📊 Tối ưu Performance

**Tận dụng data có sẵn - Không gọi API thừa:**

- `ManageEvents.tsx` gọi `GET_ALL_EVENTS` **1 lần duy nhất** khi mount
- Backend trả về **đầy đủ** thông tin: `image_url`, `location`, `approval_history`, `status_history`, etc.
- Modal "Xem chi tiết" (`EventDetailModal.tsx`) **không gọi API thêm**, chỉ hiển thị data đã có sẵn
- Click "Xem chi tiết" → `setViewingEvent(event)` → Mở modal với data trong state
- **Lợi ích**: Giảm request, tăng tốc độ, UX mượt mà hơn

**Kiến trúc:**

```
Component mount → GET_ALL_EVENTS (1 request)
                     ↓
                  State: events[]
                     ↓
          ┌──────────┴──────────┐
          ↓                     ↓
    Table Display         Modal Display
    (No API call)        (No API call)
```

🎉 **Hoàn thành 100%!**

---

## ⚠️ 6. LỖI THƯỜNG GẶP & CÁCH FIX

### **Lỗi: "Transaction numbers are only allowed on a replica set member or mongos"**

**Nguyên nhân:**

- Backend dùng directive `@delete` trong GraphQL → Lighthouse tự động bật MongoDB transaction
- MongoDB đang chạy ở chế độ **standalone** (không phải replica set)
- MongoDB transactions chỉ hoạt động trên Replica Set hoặc Sharded Cluster

**Cách fix:**

#### **Cách 1: Sửa Backend - Thêm custom delete method (Khuyến nghị)**

**Bước 1:** Thêm method delete vào `EventMutation.php`:

```php
public function delete($_, array $args)
{
    $event = Event::findOrFail($args['id']);
    $event->delete();
    return $event;
}
```

**Bước 2:** Sửa `event.graphql`:

```graphql
# Từ:
deleteEvent(id: ID! @eq): Event
    @middleware(checks: ["jwt.auth", "active"])
    @delete  # ← Xóa dòng này

# Thành:
deleteEvent(id: ID!): Event
    @middleware(checks: ["jwt.auth", "active"])
    @field(resolver: "App\\GraphQL\\Mutations\\EventMutation@delete")
```

#### **Cách 2: Cấu hình MongoDB Replica Set**

**Bước 1:** Stop MongoDB

```powershell
net stop MongoDB
```

**Bước 2:** Sửa file `mongod.cfg` (thường ở `C:\Program Files\MongoDB\Server\7.0\bin\`)

```yaml
replication:
  replSetName: 'rs0'
```

**Bước 3:** Start MongoDB

```powershell
net start MongoDB
```

**Bước 4:** Init replica set

```bash
mongosh
rs.initiate()
```

**Khuyến nghị:** Dùng **Cách 1** nếu không cần transaction phức tạp! 🎯
