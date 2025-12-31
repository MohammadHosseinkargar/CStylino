import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/sidebar"
import { prisma } from "@/lib/prisma"
import { AdminProviders } from "./providers"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isBlocked: true },
  })

  if (!user || user.isBlocked || user.role !== "admin") {
    redirect("/auth/signin")
  }

  return (
    <AdminProviders>
      <div
        className="min-h-screen flex flex-col md:flex-row md:items-start md:gap-6 bg-background font-sans"
        dir="rtl"
        lang="fa"
      >
        <AdminSidebar />
        <main className="flex-1 w-full p-4 md:p-8">{children}</main>
      </div>
    </AdminProviders>
  )
}
