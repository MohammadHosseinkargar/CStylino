import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { CustomerSidebar } from "@/components/customer/sidebar"
import { BottomNav } from "@/components/account/bottom-nav"
import { prisma } from "@/lib/prisma"

export default async function CustomerLayout({
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
    select: { isBlocked: true },
  })

  if (!user || user.isBlocked) {
    redirect("/auth/signin")
  }

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row md:items-start md:gap-6 bg-background font-sans"
      dir="rtl"
      lang="fa"
    >
      <CustomerSidebar />
      <main className="flex-1 w-full">{children}</main>
      <BottomNav />
    </div>
  )
}
