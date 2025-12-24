import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { AffiliateSidebar } from "@/components/affiliate/sidebar"

export default async function AffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "affiliate" && session.user.role !== "admin")) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" dir="rtl">
      <AffiliateSidebar />
      <main className="flex-1 w-full p-4 md:p-8">{children}</main>
    </div>
  )
}

