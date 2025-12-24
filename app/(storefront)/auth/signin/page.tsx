"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signInSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, Lock } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/store"
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      router.push(callbackUrl)
      router.refresh()
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ورود",
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
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-hero font-bold">خوش آمدید</CardTitle>
          <CardDescription className="text-body">
            وارد حساب کاربری خود شوید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <Button
              type="submit"
              className="w-full btn-editorial h-14 text-base"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-5 h-5 ml-2 animate-spin" />}
              ورود
            </Button>
          </form>

          <div className="mt-8 text-center text-body">
            <span className="text-muted-foreground">حساب کاربری ندارید؟ </span>
            <Link
              href="/auth/signup"
              className="text-primary font-semibold hover:underline transition-colors duration-300"
            >
              ثبت‌نام کنید
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
