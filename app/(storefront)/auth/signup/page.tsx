"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, Mail, Lock, Phone } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "خطا در ثبت‌نام")
      }

      toast({
        title: "موفق",
        description: "ثبت‌نام با موفقیت انجام شد. در حال ورود...",
      })

      // Auto sign in
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      router.push("/store")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در ثبت‌نام",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="editorial-container flex items-center justify-center min-h-screen py-12" dir="rtl">
      <Card className="w-full max-w-md card-editorial border-border/40">
        <CardHeader className="text-center space-y-3 pb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-hero font-bold">ایجاد حساب کاربری</CardTitle>
          <CardDescription className="text-body">
            حساب کاربری جدید ایجاد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold">
                نام
              </Label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="نام شما"
                  className="pr-12 h-12"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive mt-2">
                  {errors.name.message as string}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold">
                ایمیل
              </Label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="example@email.com"
                  className="pr-12 h-12"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-2">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold">
                رمز عبور
              </Label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="pr-12 h-12"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-2">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm font-semibold">
                شماره تماس <span className="text-muted-foreground font-normal">(اختیاری)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="09123456789"
                  className="pr-12 h-12 persian-number"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-editorial h-14 text-base"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-5 h-5 ml-2 animate-spin" />}
              ثبت‌نام
            </Button>
          </form>

          <div className="mt-8 text-center text-body">
            <span className="text-muted-foreground">قبلاً ثبت‌نام کرده‌اید؟ </span>
            <Link
              href="/auth/signin"
              className="text-primary font-semibold hover:underline transition-colors duration-300"
            >
              وارد شوید
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
