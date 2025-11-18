# 🐛 LỖI: Upload PDF thất bại - "Bài báo không tồn tại trong hệ thống"

## ❌ Lỗi gốc

```
POST http://localhost:8000/api/v1/upload/pages 404 (Not Found)
Upload error: Error: Bài báo không tồn tại trong hệ thống
```

## 🔍 Nguyên nhân

Backend endpoint `/api/v1/upload/pages` **YÊU CẦU** `paper_id` phải **TỒN TẠI** trong database trước khi upload file.

**Code backend:**
```php
// app/Http/Controllers/UploadController.php
public function uploadPages(Request $request) {
    $paperId = $request->input('paper_id');
    
    // Tìm paper - NẾU KHÔNG TỒN TẠI → LỖI 404
    $paper = Paper::find($paperId);
    if (!$paper) {
        return $this->errorResponse(404, 'Not Found', 'Bài báo không tồn tại trong hệ thống');
    }
    
    // Upload file và TỰ ĐỘNG update file_url vào paper
    $paper->file_url = $url;
    $paper->save();
}
```

## ❌ Logic cũ (SAI)

```typescript
// ❌ SAI: Upload file TRƯỚC khi tạo paper
if (pdfFile) {
  const tempPaperId = `temp_${Date.now()}`  // ← ID này KHÔNG TỒN TẠI trong DB
  await uploadPdfFile(tempPaperId, pdfFile) // ← LỖI 404!
}

await createPaper({ variables: { input } })
```

## ✅ Logic mới (ĐÚNG)

```typescript
// ✅ ĐÚNG: Tạo paper TRƯỚC, upload file SAU

// 1. Tạo paper trước (không có file)
const result = await createPaper({ variables: { input } })
const paperId = result.data?.createPaper?._id  // ← Lấy ID thật từ DB

// 2. Upload PDF SAU KHI đã có paper_id
if (pdfFile && paperId) {
  await uploadPdfFile(paperId, pdfFile)  // ← Backend tự động update file_url
}
```

## 🎯 Kết quả

### Khi TẠO MỚI paper:
1. ✅ Tạo paper (GraphQL mutation) → Nhận `_id`
2. ✅ Upload PDF với `paper_id` = `_id` → Backend update `file_url`
3. ✅ Hiển thị thông báo thành công

### Khi SỬA paper:
1. ✅ Update paper (GraphQL mutation) → Dùng `_id` hiện tại
2. ✅ Upload PDF mới (nếu có) → Backend tự động xóa file cũ và update `file_url`
3. ✅ Hiển thị thông báo thành công

## 📋 Files đã sửa

- ✅ `src/pages/admin/ManagePapers/PaperModal.tsx`
  - Sửa `handleSubmit()`: Tạo/update paper trước, upload file sau
  - Sửa `uploadPdfFile()`: Đơn giản hóa, không cần return file_url
  - Xử lý success/error trong `handleSubmit` thay vì mutation callback

## 🚀 Test

1. **Tạo paper mới có PDF**: ✅ Hoạt động
2. **Tạo paper mới không PDF**: ✅ Hoạt động
3. **Sửa paper, thay đổi PDF**: ✅ Hoạt động
4. **Sửa paper, không đổi PDF**: ✅ Hoạt động
5. **Xóa paper**: ✅ Backend tự động xóa file PDF

## 💡 Lưu ý

- Backend **TỰ ĐỘNG** update `file_url` vào paper sau khi upload
- Backend **TỰ ĐỘNG** xóa file PDF cũ khi upload file mới
- Backend **TỰ ĐỘNG** xóa file PDF khi xóa paper
- Frontend **KHÔNG CẦN** gọi `updatePaper` sau khi upload file

