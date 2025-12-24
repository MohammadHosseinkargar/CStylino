import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signUpSchema } from "@/lib/validations"
import { generateAffiliateCode } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = signUpSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "این ایمیل قبلاً ثبت شده است" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Generate affiliate code
    let affiliateCode = generateAffiliateCode()
    let codeExists = await prisma.user.findUnique({
      where: { affiliateCode },
    })

    // Ensure unique affiliate code
    while (codeExists) {
      affiliateCode = generateAffiliateCode()
      codeExists = await prisma.user.findUnique({
        where: { affiliateCode },
      })
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: "customer",
        affiliateCode,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json(
      { message: "ثبت‌نام با موفقیت انجام شد", user },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "خطا در ثبت‌نام" },
      { status: 500 }
    )
  }
}

