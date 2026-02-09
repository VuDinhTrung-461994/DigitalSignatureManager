# Digital Signature Manager - PostgreSQL Edition

## 🚀 Triển khai trên Vercel

### Bước 1: Chuẩn bị Database trên Vercel

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn
3. Vào tab **Storage**
4. Click **Connect Store** → Chọn **Postgres**
5. Chọn region gần bạn nhất (khuyến nghị: Singapore cho VN)
6. Click **Create & Connect**

### Bước 2: Environment Variables tự động

Sau khi connect, Vercel sẽ tự động thêm các biến môi trường:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**Không cần thêm thủ công!**

### Bước 3: Deploy lên GitHub

```bash
# Commit code
git add .
git commit -m "Chuyển sang PostgreSQL cho Vercel"
git push origin main
```

Vercel sẽ tự động deploy khi bạn push lên GitHub.

### Bước 4: Khởi tạo Database

Sau khi deploy thành công, truy cập:
```
https://your-project.vercel.app/api/init-db
```

Hoặc dùng cURL:
```bash
curl -X POST https://your-project.vercel.app/api/init-db
```

## 🔧 Cấu trúc Project

### Dependencies
- `@neondatabase/serverless` - PostgreSQL client
- `next` - Next.js framework
- `framer-motion` - Animation
- `tailwindcss` - Styling

### Database Schema

**DonVi (Đơn vị)**
- `id` (TEXT, PK)
- `ten` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Token (Thiết bị)**
- `token_id` (TEXT, PK)
- `ma_thiet_bi` (TEXT)
- `mat_khau` (TEXT)
- `ngay_hieu_luc` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**User (Ngườidùng)**
- `user_id` (TEXT, PK)
- `ten` (TEXT)
- `so_cccd` (INTEGER)
- `don_vi_id` (TEXT, FK)
- `token_id` (TEXT, FK)
- `uy_quyen` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🛠️ API Endpoints

### Users
- `GET /api/users` - Lấy danh sách users
- `POST /api/users` - Tạo user mới
- `GET /api/users/[id]` - Lấy chi tiết user
- `PUT /api/users/[id]` - Cập nhật user
- `DELETE /api/users/[id]` - Xóa user

### DonVi
- `GET /api/donvi` - Lấy danh sách đơn vị
- `POST /api/donvi` - Tạo đơn vị mới

### Tokens
- `GET /api/tokens` - Lấy danh sách tokens
- `POST /api/tokens` - Tạo token mới

### Initialize
- `POST /api/init-db` - Khởi tạo database với sample data

## 📁 Pages

- `/` - Trang chủ
- `/devices` - Quản lý thiết bị chữ ký số (chính)
- `/db-test` - Trang test database

## 🎨 Tính năng UI

- Dark theme với gradient background
- Glassmorphism effects
- Smooth animations (Framer Motion)
- Hover effects trên tất cả elements
- Real-time search
- Responsive design

## 🔒 Bảo mật

- Mật khẩu được blur trong UI
- Environment variables cho database connection
- SQL injection protection qua parameterized queries

## 🐛 Troubleshooting

### Lỗi "Database not configured"
Đảm bảo đã connect Postgres storage trong Vercel Dashboard.

### Lỗi "Unable to open database file"
Đây là lỗi SQLite cũ. Đã fix bằng cách chuyển sang PostgreSQL.

### Không thể tạo tables
Truy cập `/api/init-db` để tự động tạo schema.

## 📝 License

MIT
