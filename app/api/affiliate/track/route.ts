import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { setAffiliateRef } from "@/lib/affiliate"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "affiliate" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { ref } = await request.json()

    if (!ref) {
      return NextResponse.json(
        { error: "Ref code is required" },
        { status: 400 }
      )
    }

    // Verify affiliate exists
    const affiliate = await prisma.user.findUnique({
      where: { affiliateCode: ref },
    })

    if (!affiliate || affiliate.role === "customer") {
      return NextResponse.json(
        { error: "Invalid affiliate code" },
        { status: 400 }
      )
    }

    // Set cookie
    setAffiliateRef(ref)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Affiliate tracking error:", error)
    return NextResponse.json(
      { error: "Error tracking affiliate" },
      { status: 500 }
    )
  }
}

