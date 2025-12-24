# راهنمای احراز هویت - NextAuth.js v4

## ✅ پیاده‌سازی کامل با NextAuth.js v4 (Stable)

این پروژه از **NextAuth.js v4** (نسخه پایدار) استفاده می‌کند و **auth.js** یا نسخه‌های beta استفاده نمی‌شود.

## 📦 پکیج‌های نصب شده

```json
{
  "next-auth": "^4.24.7",
  "@next-auth/prisma-adapter": "^1.0.7",
  "bcryptjs": "^2.4.3"
}
```

## 🔧 تنظیمات

### متغیرهای محیطی

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
```

### ساختار فایل‌ها

```
lib/auth.ts                    # تنظیمات NextAuth
app/api/auth/[...nextauth]/    # Route Handler
types/next-auth.d.ts          # Type definitions
middleware.ts                  # Route protection
```

## 🔐 Provider: Credentials

### تنظیمات

```typescript
// lib/auth.ts
CredentialsProvider({
  async authorize(credentials) {
    // بررسی ایمیل و رمز عبور
    // Hash password با bcrypt
    // بازگرداندن user object با role
  }
})
```

### ویژگی‌ها

- ✅ Hash کردن رمز عبور با `bcryptjs`
- ✅ بررسی اعتبار کاربر در دیتابیس
- ✅ بازگرداندن role در JWT token
- ✅ پیام‌های خطا به فارسی

## 🎫 Session Strategy: JWT

### تنظیمات

```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

### Callbacks

```typescript
callbacks: {
  async jwt({ token, user }) {
    // اضافه کردن role و id به token
  },
  async session({ session, token }) {
    // اضافه کردن role و id به session
  }
}
```

## 👥 نقش‌ها (Roles)

### نقش‌های موجود

- `customer`: مشتری عادی
- `affiliate`: همکار در فروش
- `admin`: مدیر سیستم

### استفاده در کد

```typescript
// Server Component
const session = await getServerSession(authOptions)
if (session?.user.role === "admin") {
  // Admin only
}

// Client Component
const { data: session } = useSession()
if (session?.user.role === "affiliate") {
  // Affiliate only
}
```

## 🛡️ محافظت از مسیرها

### Middleware

```typescript
// middleware.ts
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "admin"
    
    if (path.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect("/auth/signin")
    }
  }
)
```

### Route Protection

```typescript
// app/(admin)/admin/layout.tsx
const session = await getServerSession(authOptions)
if (!session || session.user.role !== "admin") {
  redirect("/auth/signin")
}
```

## 📝 استفاده در API Routes

### Server-Side

```typescript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "لطفاً ابتدا وارد شوید" },
      { status: 401 }
    )
  }
  
  // Check role
  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "دسترسی غیرمجاز" },
      { status: 403 }
    )
  }
}
```

## 🎨 استفاده در Client Components

### Session Provider

```typescript
// app/layout.tsx
import { Providers } from "@/components/providers"

export default function RootLayout({ children }) {
  return (
    <Providers>
      {children}
    </Providers>
  )
}
```

### استفاده از Session

```typescript
"use client"
import { useSession, signIn, signOut } from "next-auth/react"

export default function Component() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <p>Loading...</p>
  if (status === "unauthenticated") return <button onClick={() => signIn()}>Sign In</button>
  
  return (
    <div>
      <p>Welcome {session.user.email}</p>
      <p>Role: {session.user.role}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

## 🔄 جریان احراز هویت

### ثبت‌نام

1. کاربر فرم ثبت‌نام را پر می‌کند
2. رمز عبور با `bcrypt.hash()` hash می‌شود
3. کاربر در دیتابیس ایجاد می‌شود
4. کد معرف (affiliate code) ایجاد می‌شود
5. کاربر به صورت خودکار وارد می‌شود

### ورود

1. کاربر ایمیل و رمز عبور را وارد می‌کند
2. `CredentialsProvider.authorize()` فراخوانی می‌شود
3. رمز عبور با `bcrypt.compare()` بررسی می‌شود
4. JWT token ایجاد می‌شود (با role)
5. Session ایجاد می‌شود

### خروج

```typescript
import { signOut } from "next-auth/react"
signOut({ callbackUrl: "/store" })
```

## 🔒 امنیت

### Password Hashing

- استفاده از `bcryptjs` با salt rounds = 10
- رمزهای عبور هرگز به صورت plain text ذخیره نمی‌شوند

### Session Security

- JWT tokens در httpOnly cookies ذخیره می‌شوند
- Secret key در متغیرهای محیطی
- Session expiration: 30 روز

### Route Protection

- Middleware برای محافظت از مسیرهای admin/affiliate
- بررسی role در Server Components
- بررسی role در API Routes

## 📚 منابع

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js v4 GitHub](https://github.com/nextauthjs/next-auth/tree/v4)

## ✅ Checklist

- [x] نصب next-auth@4 (stable)
- [x] حذف auth.js
- [x] استفاده از PrismaAdapter
- [x] Credentials Provider
- [x] JWT sessions با role
- [x] Password hashing با bcrypt
- [x] محافظت از مسیرها با middleware
- [x] Type definitions
- [x] پیام‌های خطا به فارسی

