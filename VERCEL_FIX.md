# 🔧 Fix: Database Connection Error on Vercel

## Lỗi hiện tại
```
{"success":false,"error":"Error: Database not configured..."}
```

## Nguyên nhân
Vercel Postgres tạo biến môi trường tên là `POSTGRES_URL`, nhưng code đang tìm `DATABASE_URL`.

## ✅ Cách fix

### Cách 1: Thêm Environment Variable thủ công (Khuyến nghị)

1. **Vào Vercel Dashboard**:
   - Truy cập: https://vercel.com/dashboard
   - Chọn project của bạn
   - Tab **Settings** → **Environment Variables**

2. **Thêm biến môi trường**:
   ```
   Name: DATABASE_URL
   Value: ${POSTGRES_URL}
   ```
   Hoặc copy giá trị từ biến `POSTGRES_URL` đã có sẵn

3. **Redeploy**:
   - Vào tab **Deployments**
   - Click **...** → **Redeploy**

### Cách 2: Dùng Vercel CLI

```bash
# Login
vercel login

# Lấy POSTGRES_URL
vercel env ls

# Thêm DATABASE_URL = POSTGRES_URL
vercel env add DATABASE_URL
# Nhập giá trị từ POSTGRES_URL

# Redeploy
vercel --prod
```

### Cách 3: Sửa trong Vercel Dashboard (Storage)

1. Vào **Storage** tab
2. Click **Postgres** database
3. Tab **.env.local**
4. Copy dòng `POSTGRES_URL="postgres://..."`
5. Vào **Settings** → **Environment Variables**
6. Thêm mới:
   - Name: `DATABASE_URL`
   - Value: [paste giá trị vừa copy]

## ✅ Kiểm tra sau khi fix

```bash
curl -X POST https://digital-signature-manager-iota.vercel.app/api/init-db
```

Kết quả mong đợi:
```json
{"success":true,"data":{"donVi":3,"tokens":2,"users":2},"message":"Database initialized successfully"}
```

## 🔍 Debug nếu vẫn lỗi

### 1. Kiểm tra biến môi trường có tồn tại không:
Tạo file `app/api/debug/route.ts`:
```typescript
export async function GET() {
    return Response.json({
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        envKeys: Object.keys(process.env).filter(k => 
            k.includes('POSTGRES') || k.includes('DATABASE')
        )
    });
}
```

Truy cập: `https://your-app.vercel.app/api/debug`

### 2. Kiểm tra Database đã connect chưa:
Vào Vercel Dashboard → Storage → Postgres
- Nếu chưa có, click **Create Database**
- Nếu đã có, click **Connect** để kết nối với project

### 3. Preview Deployment vs Production:
Environment variables có thể khác nhau giữa Preview và Production. Đảm bảo bạn set cho cả hai:
- Production (main branch)
- Preview (pull requests)

## 📋 Checklist

- [ ] Postgres database đã được tạo trên Vercel
- [ ] Database đã được connect với project
- [ ] Biến môi trường `DATABASE_URL` hoặc `POSTGRES_URL` đã được set
- [ ] Đã redeploy sau khi thêm biến môi trường
- [ ] API `/api/init-db` trả về success

## 🆘 Liên hệ support

Nếu vẫn gặp lỗi:
1. Kiểm tra Vercel Postgres status: https://status.neon.tech/
2. Xem logs trong Vercel Dashboard → Deployments → [Chọn deployment] → Functions
