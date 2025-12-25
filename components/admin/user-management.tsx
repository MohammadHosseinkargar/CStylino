"use client"

import { useMemo, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { ListCard } from "@/components/ui/list-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@prisma/client"

type AdminUser = {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: UserRole
  isBlocked: boolean
  createdAt: string | Date
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "admin", label: "مدیر" },
  { value: "affiliate", label: "همکار" },
  { value: "customer", label: "مشتری" },
]

export function UserManagement({
  users,
  showHeader = true,
  showSearch = true,
}: {
  users: AdminUser[]
  showHeader?: boolean
  showSearch?: boolean
}) {
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<AdminUser[]>(users)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const filtered = useMemo(() => {
    if (!showSearch) {
      return items
    }
    const term = query.trim().toLowerCase()
    if (!term) return items
    return items.filter((user) => {
      const emailMatch = user.email.toLowerCase().includes(term)
      const phoneMatch = (user.phone || "").toLowerCase().includes(term)
      return emailMatch || phoneMatch
    })
  }, [items, query, showSearch])

  const setPending = (id: string, value: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev)
      if (value) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const updateUser = async (id: string, payload: Partial<AdminUser>) => {
    setPending(id, true)
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || "خطا در بروزرسانی کاربر.")
      }

      setItems((prev) =>
        prev.map((user) => (user.id === id ? { ...user, ...result.user } : user))
      )
      toast({ title: "تغییرات ذخیره شد." })
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error?.message || "خطا در بروزرسانی کاربر.",
        variant: "destructive",
      })
    } finally {
      setPending(id, false)
    }
  }

  return (
    <div className="space-y-5">
      {(showHeader || showSearch) && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {showHeader && (
            <div>
              <h3 className="text-lg font-semibold">مدیریت کاربران</h3>
              <p className="text-sm text-muted-foreground">
                نقش و وضعیت کاربران را مدیریت کنید.
              </p>
            </div>
          )}
          {showSearch && (
            <div className="w-full md:w-72">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="جستجو با ایمیل یا موبایل"
              />
            </div>
          )}
        </div>
      )}

      <div className="hidden md:block">
        <DataTable
          columns={[
            { key: "name", header: "نام" },
            { key: "email", header: "ایمیل" },
            { key: "phone", header: "موبایل" },
            { key: "role", header: "نقش" },
            { key: "status", header: "وضعیت" },
            { key: "createdAt", header: "ثبت‌نام" },
            { key: "actions", header: "عملیات", className: "text-left" },
          ]}
          data={filtered}
          renderRow={(user) => {
            const isPending = pendingIds.has(user.id)
            return (
              <TableRow key={user.id}>
                <TableCell className="font-semibold">
                  {user.name || "بدون نام"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.phone || "—"}
                </TableCell>
                <TableCell>
                  <select
                    className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm"
                    value={user.role}
                    disabled={isPending}
                    onChange={(event) =>
                      updateUser(user.id, {
                        role: event.target.value as UserRole,
                      })
                    }
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      user.isBlocked
                        ? "bg-destructive/15 text-destructive"
                        : "bg-emerald-500/15 text-emerald-600"
                    }`}
                  >
                    {user.isBlocked ? "مسدود" : "فعال"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-left">
                  <Button
                    variant={user.isBlocked ? "secondary" : "destructive"}
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      updateUser(user.id, { isBlocked: !user.isBlocked })
                    }
                  >
                    {user.isBlocked ? "رفع مسدودی" : "مسدودسازی"}
                  </Button>
                </TableCell>
              </TableRow>
            )
          }}
        />
      </div>

      <div className="md:hidden space-y-4">
        {filtered.map((user) => {
          const isPending = pendingIds.has(user.id)
          return (
            <ListCard
              key={user.id}
              title={user.name || "بدون نام"}
              subtitle={user.email}
              meta={formatDate(user.createdAt)}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">موبایل</span>
                  <span>{user.phone || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">وضعیت</span>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      user.isBlocked
                        ? "bg-destructive/15 text-destructive"
                        : "bg-emerald-500/15 text-emerald-600"
                    }`}
                  >
                    {user.isBlocked ? "مسدود" : "فعال"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">نقش</span>
                  <select
                    className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm"
                    value={user.role}
                    disabled={isPending}
                    onChange={(event) =>
                      updateUser(user.id, {
                        role: event.target.value as UserRole,
                      })
                    }
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant={user.isBlocked ? "secondary" : "destructive"}
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    updateUser(user.id, { isBlocked: !user.isBlocked })
                  }
                >
                  {user.isBlocked ? "رفع مسدودی" : "مسدودسازی"}
                </Button>
              </div>
            </ListCard>
          )
        })}
      </div>
    </div>
  )
}
