"use client"

import { QueryProvider } from "@/components/query-provider"

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>
}
