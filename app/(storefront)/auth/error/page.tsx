"use client"

import { Suspense } from "react"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fa } from "@/lib/copy/fa"

const errorMessages: Record<string, { title: string; description: string }> =
  fa.auth.error.messages

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
              {fa.auth.error.heading}: <span className="font-semibold">{errorCode}</span>
            </div>
          )}
          <div className="space-y-3">
            <Button asChild className="w-full btn-editorial h-12">
              <Link href="/auth/signin">{fa.auth.error.actions.signIn}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-12">
              <Link href="/store">{fa.auth.error.actions.store}</Link>
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
