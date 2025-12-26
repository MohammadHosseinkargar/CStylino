"use client"

import { Suspense } from "react"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const errorMessages: Record<
  string,
  { title: string; description: string }
> = {
  Configuration: {
    title: "خطای پیکربندی",
    description: "مشکلی در تنظیمات ورود وجود دارد. لطفا بعدا دوباره تلاش کنید.",
  },
  AccessDenied: {
    title: "دسترسی رد شد",
    description: "اجازه ورود برای این حساب صادر نشده است.",
  },
  Verification: {
    title: "لینک نامعتبر",
    description: "لینک تایید نامعتبر است یا منقضی شده است.",
  },
  CredentialsSignin: {
    title: "ورود ناموفق",
    description: "ایمیل یا رمز عبور اشتباه است. لطفا دوباره تلاش کنید.",
  },
  OAuthSignin: {
    title: "خطای ورود با سرویس",
    description: "اتصال به سرویس ورود با مشکل مواجه شد. لطفا دوباره تلاش کنید.",
  },
  OAuthCallback: {
    title: "خطای بازگشت",
    description: "بازگشت از سرویس ورود کامل نشد. لطفا دوباره تلاش کنید.",
  },
  OAuthCreateAccount: {
    title: "خطای ساخت حساب",
    description: "امکان ایجاد حساب با این سرویس وجود ندارد.",
  },
  EmailCreateAccount: {
    title: "خطای ساخت حساب",
    description: "امکان ایجاد حساب با ایمیل وجود ندارد.",
  },
  Callback: {
    title: "خطای بازگشت",
    description: "فرآیند ورود کامل نشد. لطفا دوباره تلاش کنید.",
  },
  OAuthAccountNotLinked: {
    title: "حساب مرتبط نیست",
    description: "این حساب به ایمیل دیگری متصل است. با ایمیل درست وارد شوید.",
  },
  EmailSignin: {
    title: "خطای ارسال ایمیل",
    description: "ارسال لینک ورود با ایمیل ناموفق بود.",
  },
  SessionRequired: {
    title: "نیاز به ورود",
    description: "برای دسترسی به این بخش باید وارد حساب خود شوید.",
  },
  Default: {
    title: "خطای نامشخص",
    description: "مشکلی در فرآیند ورود پیش آمد. لطفا دوباره تلاش کنید.",
  },
}

function getMessage(code: string | null) {
  if (!code) {
    return errorMessages.Default
  }

  return errorMessages[code] || errorMessages.Default
}

function AuthErrorPageContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get("error")
  const message = getMessage(errorCode)

  return (
    <div className="page-container flex items-center justify-center min-h-screen py-12" dir="rtl">
      <Card className="w-full max-w-md card-editorial border-border/40">
        <CardHeader className="text-center space-y-3 pb-8">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-hero font-bold">{message.title}</CardTitle>
          <CardDescription className="text-body">{message.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorCode && (
            <div className="text-center text-sm text-muted-foreground">
              کد خطا: <span className="font-semibold">{errorCode}</span>
            </div>
          )}
          <div className="space-y-3">
            <Button asChild className="w-full btn-editorial h-12">
              <Link href="/auth/signin">بازگشت به صفحه ورود</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-12">
              <Link href="/store">رفتن به فروشگاه</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <AuthErrorPageContent />
    </Suspense>
  )
}
