import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { AffiliateSidebar } from "@/components/affiliate/sidebar"
import { prisma } from "@/lib/prisma"

export default async function AffiliateLayout({
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

  if (!user || user.isBlocked || (user.role !== "affiliate" && user.role !== "admin")) {
    redirect("/auth/signin")
  }

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row md:items-start md:gap-6 bg-background font-sans"
      dir="rtl"
      lang="fa"
    >
      <AffiliateSidebar />
      <main className="flex-1 w-full p-4 md:p-8">{children}</main>
    </div>
  )
}
