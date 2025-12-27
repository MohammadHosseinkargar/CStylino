import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import crypto from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
}

function resolveExtension(file: File) {
  const originalExt = path.extname(file.name || "").toLowerCase()
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(originalExt)) {
    return originalExt === ".jpeg" ? ".jpg" : originalExt
  }
  return MIME_TO_EXT[file.type || ""] || ""
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data." },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File field is required." }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large." }, { status: 400 })
    }

    const ext = resolveExtension(file)
    if (!ext) {
      return NextResponse.json({ error: "Unsupported file extension." }, { status: 400 })
    }

    const now = new Date()
    const year = String(now.getFullYear())
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const uploadDir = path.join(process.cwd(), "public", "uploads", year, month)
    await fs.mkdir(uploadDir, { recursive: true })

    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`
    const destination = path.join(uploadDir, safeName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(destination, buffer)

    return NextResponse.json({ url: `/uploads/${year}/${month}/${safeName}` })
  } catch (error: any) {
    const message =
      typeof error?.message === "string" && error.message.length > 0
        ? error.message
        : "Upload failed."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
