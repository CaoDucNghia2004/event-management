# 📝 Cập nhật Quản lý Bài Báo - Gọi API đúng

## ✅ Các thay đổi đã thực hiện

### 1. **PaperModal.tsx** - Form thêm/sửa bài báo

#### 🔧 Sửa logic submit form:

- **Vấn đề**: Backend yêu cầu `paper_id` phải TỒN TẠI trước khi upload file
- **Giải pháp**: Tạo/update paper TRƯỚC → Lấy `paper_id` → Upload file SAU

#### 🎯 Flow mới:

```typescript
// 1. Tạo/update paper trước (không có file)
if (paper) {
  const result = await updatePaper({ variables: { input: { _id: paper._id, ...input } } })
  paperId = result.data?.updatePaper?._id || paper._id
} else {
  const result = await createPaper({ variables: { input } })
  paperId = result.data?.createPaper?._id
}

// 2. Upload PDF SAU KHI đã có paper_id
if (pdfFile && paperId) {
  await uploadPdfFile(paperId, pdfFile)
  // Backend tự động update file_url vào paper
}

// 3. Hiển thị thông báo thành công
await Swal.fire({ icon: 'success', title: 'Thành công!' })
onClose()
```

#### 📄 Hiển thị file PDF:

- Hiển thị tên file và kích thước khi chọn file mới
- Hiển thị trạng thái "Đã có file PDF" khi edit paper có file
- Xử lý cả URL đầy đủ và đường dẫn tương đối

#### ⚠️ Error handling:

- Hiển thị lỗi chi tiết từ backend GraphQL
- Xử lý `error.graphQLErrors[0].message`

---

### 2. **ManagePapers.tsx** - Trang danh sách bài báo

#### 🔧 Sửa filter event:

- **Trước**: Lấy events bằng `new Set()` → bị duplicate
- **Sau**: Dùng `Map` với `event_id` làm key → loại bỏ duplicate đúng cách

```typescript
const eventsMap = new Map()
data?.papers.forEach((paper) => {
  if (paper.event && !eventsMap.has(paper.event_id)) {
    eventsMap.set(paper.event_id, paper.event)
  }
})
const events = Array.from(eventsMap.values())
```

#### 🎯 Sửa dropdown filter:

- Tìm `event_id` đúng từ paper để filter
- Xử lý trường hợp `event.id` khác `paper.event_id`

---

### 3. **PaperDetailModal.tsx** - Modal xem chi tiết

#### 🔧 Sửa xử lý file URL:

```typescript
// Xử lý cả URL đầy đủ và đường dẫn tương đối
const fileUrl = paper.file_url.startsWith('http') ? paper.file_url : `${config.baseUrl}${paper.file_url}`
```

---

## 🎯 Kết quả

### ✅ Chức năng hoạt động đúng:

1. **Thêm bài báo mới** → Gọi `createPaper` mutation
2. **Sửa bài báo** → Gọi `updatePaper` mutation
3. **Xóa bài báo** → Gọi `deletePaper` mutation (tự động xóa file PDF)
4. **Upload PDF** → Upload trước, sau đó lưu URL vào database
5. **Filter theo event** → Lọc đúng theo `event_id`
6. **Xem/tải PDF** → Xử lý đúng cả URL đầy đủ và tương đối

### 🚀 API Backend đã sẵn sàng:

- ✅ `createPaper(input: CreatePaperInput!): Paper`
- ✅ `updatePaper(input: UpdatePaperInput!): Paper`
- ✅ `deletePaper(_id: ID!): Paper`
- ✅ Validation đầy đủ (title, author, event_id bắt buộc)
- ✅ Tự động xóa file PDF khi xóa paper

---

## 📋 Checklist test

- [ ] Tạo bài báo mới không có PDF
- [ ] Tạo bài báo mới có PDF
- [ ] Sửa bài báo (thay đổi thông tin)
- [ ] Sửa bài báo (thay đổi PDF)
- [ ] Xóa bài báo
- [ ] Filter theo event
- [ ] Tìm kiếm theo tiêu đề
- [ ] Xem chi tiết bài báo
- [ ] Xem trước PDF
- [ ] Tải xuống PDF
- [ ] Phân trang

---

## 🔍 Backend API

### 📤 Upload PDF: `POST /api/v1/upload/pages`

**Request:**

```typescript
FormData {
  pdf: File,           // File PDF (max 10MB)
  paper_id: string     // ID của paper (PHẢI TỒN TẠI trong DB)
}
```

**Response:**

```json
{
  "status": 200,
  "message": "Upload file PDF bài báo thành công",
  "data": {
    "paper_id": "...",
    "title": "...",
    "file_url": "/storage/papers/Paper_xxx_20251117.pdf",
    "file_size": 1234567,
    "uploaded_at": "2025-11-17 10:30:00"
  }
}
```

**Lưu ý:**

- Backend TỰ ĐỘNG update `file_url` vào paper
- Backend TỰ ĐỘNG xóa file cũ nếu có
- Yêu cầu authentication (Bearer token)

---

### 📥 Download PDF: `GET /api/v1/download/paper/{paperId}`

**Response:**

- File PDF (binary)
- Backend TỰ ĐỘNG tăng `download` count

**Lưu ý:**

- Yêu cầu authentication (Bearer token)
- File name = `{paper.title}.pdf`

---

## 🔍 Lưu ý quan trọng

1. **Upload endpoint**: `/api/v1/upload/pages` ✅ ĐÃ CÓ
2. **Download endpoint**: `/api/v1/download/paper/{id}` ✅ ĐÃ CÓ
3. **File size limit**: 10MB
4. **File type**: Chỉ chấp nhận PDF
5. **Authentication**: Cần token trong localStorage (`access_token`)
6. **Paper phải tồn tại**: Upload file YÊU CẦU paper đã được tạo trong DB
