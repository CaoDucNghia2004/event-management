# 🐛 LỖI BACKEND - QUẢN LÝ BÀI BÁO (PAPER)

## ❌ VẤN ĐỀ

Backend có **MÂU THUẪN** giữa cách lưu dữ liệu và validation:

### 1️⃣ Upload API lưu gì vào database?

**File:** `app/Http/Controllers/UploadController.php` (line 299-310)

```php
$url = Storage::url($path);
// → Trả về: "/storage/papers/Paper_123_20251116.pdf" (đường dẫn tương đối)

$paper->file_url = $url;
$paper->save();
// → Lưu vào DB: "/storage/papers/Paper_123_20251116.pdf"
```

**Kết quả:** Database lưu **đường dẫn tương đối** `/storage/papers/...`

---

### 2️⃣ Download API expect gì?

**File:** `app/Http/Controllers/UploadController.php` (line 363)

```php
$path = str_replace('/storage/', '', $paper->file_url);
// → Expect: "/storage/papers/abc.pdf" (đường dẫn tương đối)
```

**Kết quả:** Download API expect **đường dẫn tương đối** `/storage/papers/...`

---

### 3️⃣ Validation yêu cầu gì?

**File:** `app/Http/Requests/CreatePaperRequest.php` (line 32)

```php
'file_url' => 'nullable|url|max:500',  // ❌ YÊU CẦU URL ĐẦY ĐỦ
```

**File:** `app/Http/Requests/UpdatePaperRequest.php` (line 33)

```php
'file_url' => 'nullable|url|max:500',  // ❌ YÊU CẦU URL ĐẦY ĐỦ
```

**Kết quả:** Validation yêu cầu **URL đầy đủ** `http://localhost:8000/storage/papers/...`

---

## 🔥 MÂU THUẪN

| Phần             | Expect                                     | Thực tế                   |
| ---------------- | ------------------------------------------ | ------------------------- |
| **Upload API**   | -                                          | Lưu `/storage/papers/...` |
| **Download API** | `/storage/papers/...`                      | ✅ Đúng                   |
| **Validation**   | `http://localhost:8000/storage/papers/...` | ❌ SAI                    |

→ **Upload lưu đường dẫn tương đối, nhưng Validation yêu cầu URL đầy đủ!**

---

## ✅ GIẢI PHÁP

Sửa validation để **CHẤP NHẬN ĐƯỜNG DẪN TƯƠNG ĐỐI** (giống cách Upload API lưu):

### Sửa file: `app/Http/Requests/CreatePaperRequest.php`

**Dòng 32:** Đổi từ `url` → `string`

```php
// ❌ TRƯỚC (SAI)
'file_url' => 'nullable|url|max:500',

// ✅ SAU (ĐÚNG)
'file_url' => 'nullable|string|max:500',
```

### Sửa file: `app/Http/Requests/UpdatePaperRequest.php`

**Dòng 33:** Đổi từ `url` → `string`

```php
// ❌ TRƯỚC (SAI)
'file_url' => 'nullable|url|max:500',

// ✅ SAU (ĐÚNG)
'file_url' => 'nullable|string|max:500',
```

---

## 🎯 TẠI SAO PHẢI SỬA?

### ❌ Nếu KHÔNG sửa:

1. Frontend phải gửi URL đầy đủ: `http://localhost:8000/storage/papers/abc.pdf`
2. Database lưu URL đầy đủ: `http://localhost:8000/storage/papers/abc.pdf`
3. Khi deploy lên production (`https://example.com`):
   - Database vẫn lưu: `http://localhost:8000/storage/papers/abc.pdf`
   - Link bị SAI! ❌

### ✅ Nếu SỬA:

1. Frontend gửi đường dẫn tương đối: `/storage/papers/abc.pdf`
2. Database lưu đường dẫn tương đối: `/storage/papers/abc.pdf`
3. Khi deploy lên production:
   - Database: `/storage/papers/abc.pdf`
   - Frontend ghép: `https://example.com/storage/papers/abc.pdf`
   - Link ĐÚNG! ✅

---

## 📝 TÓM TẮT

**Cần sửa 2 file:**

1. `app/Http/Requests/CreatePaperRequest.php` - line 32
2. `app/Http/Requests/UpdatePaperRequest.php` - line 33

**Đổi:** `'file_url' => 'nullable|url|max:500'`  
**Thành:** `'file_url' => 'nullable|string|max:500'`

**Lý do:** Để validation nhất quán với cách Upload API lưu dữ liệu (đường dẫn tương đối).

---

## 🗑️ VẤN ĐỀ BỔ SUNG: XÓA BÀI BÁO

### ❌ Hiện tại:

**File:** `app/GraphQL/Mutations/PaperMutation.php` (line 116-143)

```php
public function delete($_, array $args)
{
    // Validate _id
    $validator = Validator::make($args, [
        '_id' => 'required|string',
    ]);
    $validator->validate();

    // Tìm paper cần xóa
    $paper = Paper::find($args['_id']);
    if (!$paper) {
        throw ValidationException::withMessages([
            '_id' => ['Paper không tồn tại trong hệ thống.'],
        ]);
    }

    // Lưu thông tin paper trước khi xóa để trả về
    $deletedPaper = $paper->replicate();

    // Xóa paper
    $paper->delete();  // ❌ CHỈ XÓA DATABASE

    return $deletedPaper;
}
```

### 🔍 Vấn đề là gì?

Khi xóa bài báo, code hiện tại chỉ xóa **record trong database**, nhưng **KHÔNG XÓA FILE PDF** trên server.

**Ví dụ cụ thể:**

1. **Trước khi xóa:**
   - Database có: Paper ID `123`, `file_url = "/storage/papers/Paper_123_20251116.pdf"`
   - Server có file: `storage/app/public/papers/Paper_123_20251116.pdf` (10MB)

2. **Sau khi xóa (code hiện tại):**
   - Database: ✅ Record đã bị xóa
   - Server: ❌ File `Paper_123_20251116.pdf` **VẪN CÒN** (10MB)

3. **Hậu quả:**
   - File PDF không ai dùng nữa nhưng vẫn chiếm dung lượng server
   - Xóa 100 bài báo (mỗi bài 5MB) = 500MB rác trên server!

### 📂 File PDF nằm ở đâu?

File PDF được lưu tại: `storage/app/public/papers/Paper_{ID}_{Timestamp}.pdf`

Khi xóa database, Laravel **KHÔNG TỰ ĐỘNG XÓA FILE** → Phải xóa thủ công!

---

### ✅ Cách sửa:

**Bước 1:** Thêm `use Storage` vào đầu file

**File:** `app/GraphQL/Mutations/PaperMutation.php` (line 1-11)

```php
<?php

namespace App\GraphQL\Mutations;

use App\Models\Paper;
use App\Models\Event;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;  // ← ✅ THÊM DÒNG NÀY
use App\Http\Requests\CreatePaperRequest;
use App\Http\Requests\UpdatePaperRequest;
use Illuminate\Validation\ValidationException;
use Exception;
```

**Bước 2:** Sửa hàm `delete()` để xóa file PDF trước khi xóa database

**File:** `app/GraphQL/Mutations/PaperMutation.php` (line 116-143)

```php
public function delete($_, array $args)
{
    // Validate _id
    $validator = Validator::make($args, [
        '_id' => 'required|string',
    ], [
        '_id.required' => 'ID paper là bắt buộc.',
        '_id.string' => 'ID paper phải là chuỗi.',
    ]);

    $validator->validate();

    // Tìm paper cần xóa
    $paper = Paper::find($args['_id']);
    if (!$paper) {
        throw ValidationException::withMessages([
            '_id' => ['Paper không tồn tại trong hệ thống.'],
        ]);
    }

    // ✅ BƯỚC 1: XÓA FILE PDF TRÊN SERVER (NẾU CÓ)
    if ($paper->file_url) {
        // Chuyển "/storage/papers/abc.pdf" → "papers/abc.pdf"
        $path = str_replace('/storage/', '', $paper->file_url);

        // Kiểm tra file có tồn tại không
        if (Storage::disk('public')->exists($path)) {
            // Xóa file
            Storage::disk('public')->delete($path);
        }
    }

    // Lưu thông tin paper trước khi xóa để trả về
    $deletedPaper = $paper->replicate();

    // ✅ BƯỚC 2: XÓA RECORD TRONG DATABASE
    $paper->delete();

    return $deletedPaper;
}
```

### 📝 Giải thích code:

1. **`str_replace('/storage/', '', $paper->file_url)`**
   - Chuyển `/storage/papers/abc.pdf` → `papers/abc.pdf`
   - Vì `Storage::disk('public')` đã trỏ đến `storage/app/public/`

2. **`Storage::disk('public')->exists($path)`**
   - Kiểm tra file có tồn tại không trước khi xóa
   - Tránh lỗi nếu file đã bị xóa thủ công

3. **`Storage::disk('public')->delete($path)`**
   - Xóa file PDF khỏi server
   - File sẽ bị xóa vĩnh viễn khỏi `storage/app/public/papers/`

### ⚠️ Lưu ý:

- Phải xóa file **TRƯỚC** khi xóa database
- Nếu xóa database trước, sẽ mất `file_url` → không biết file nào cần xóa!

---

**Ngày tạo:** 2025-11-16
**Người phát hiện:** Frontend Team
**Mức độ:** 🔴 Nghiêm trọng (ảnh hưởng production deployment)
