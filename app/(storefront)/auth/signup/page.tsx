"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, Mail, Lock, Phone } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { fa } from "@/lib/copy/fa"

function SignUpPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
      const ref = searchParams.get("ref") || undefined
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ref }),
      })

      if (!response.ok) {
        throw new Error(fa.auth.signUp.requestError)
      }

      toast({
        title: fa.auth.signUp.successTitle,
        description: fa.auth.signUp.successDescription,
      })

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      router.push("/store")
      router.refresh()
    } catch (error: any) {
      toast({
        title: fa.auth.signUp.genericErrorTitle,
        description: fa.auth.signUp.genericErrorDescription,
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container flex items-center justify-center min-h-screen py-12" dir="rtl">
      <Card className="w-full max-w-md card-editorial border-border/40">
        <CardHeader className="text-center space-y-3 pb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-hero font-bold">{fa.auth.signUp.title}</CardTitle>
          <CardDescription className="text-body">{fa.auth.signUp.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold">
                {fa.auth.signUp.nameLabel}
              </Label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  {...register("name")}
                  placeholder={fa.auth.signUp.namePlaceholder}
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
                {fa.auth.signUp.emailLabel}
              </Label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder={fa.auth.signUp.emailPlaceholder}
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
                {fa.auth.signUp.passwordLabel}
              </Label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder={fa.auth.signUp.passwordPlaceholder}
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
                {fa.auth.signUp.phoneLabel}{" "}
                <span className="text-muted-foreground font-normal">
                  ({fa.common.optional})
                </span>
              </Label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder={fa.auth.signUp.phonePlaceholder}
                  className="pr-12 h-12 persian-number"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-editorial h-14 text-base"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-5 h-5 ms-2 animate-spin" />}
              {fa.auth.signUp.cta}
            </Button>
          </form>

          <div className="mt-8 text-center text-body">
            <span className="text-muted-foreground">{fa.auth.signUp.haveAccount} </span>
            <Link
              href="/auth/signin"
              className="text-primary font-semibold hover:underline transition-colors duration-300"
            >
              {fa.auth.signUp.signIn}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpPageContent />
    </Suspense>
  )
}
