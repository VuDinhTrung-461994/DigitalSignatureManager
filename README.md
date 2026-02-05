# Modern Login Page - Next.js

Trang đăng nhập hiện đại với giao diện đẹp và animations mượt mà sử dụng Next.js, Tailwind CSS và Framer Motion.

## Tính năng

- Giao diện hiện đại với gradient background
- Animations mượt mà với Framer Motion
- Responsive design
- Form validation
- Show/Hide password
- Social login buttons (Google, Facebook)
- Dark mode support
- TypeScript support

## Công nghệ sử dụng

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **React 19** - UI library

## Cài đặt

```bash
# Di chuyển vào thư mục project
cd login-app

# Cài đặt dependencies (nếu chưa cài)
npm install

# Chạy development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run start` - Chạy production server
- `npm run lint` - Chạy ESLint

## Cấu trúc project

```
login-app/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Login page
├── public/              # Static files
├── next.config.js       # Next.js config
├── tailwind.config.js   # Tailwind CSS config
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies
```

## Tính năng chính

### Animations
- Animated background với gradient circles
- Smooth transitions cho form inputs
- Hover effects cho buttons
- Loading animation khi submit

### Form Features
- Email validation
- Password show/hide toggle
- Remember me checkbox
- Forgot password link
- Loading state

### Responsive Design
- Mobile-friendly
- Tablet-optimized
- Desktop-enhanced

## Customization

### Thay đổi màu sắc
Chỉnh sửa gradient trong `app/page.tsx`:
```tsx
className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"
```

### Thay đổi animations
Chỉnh sửa Framer Motion config trong `app/page.tsx`:
```tsx
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

## License

MIT
