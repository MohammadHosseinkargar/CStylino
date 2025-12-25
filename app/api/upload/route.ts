import { NextResponse } from "next/server"
import { IncomingForm, File as FormidableFile } from "formidable"
import { Readable } from "stream"
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

type ParsedForm = {
  fields: Record<string, unknown>
  files: Record<string, FormidableFile | FormidableFile[]>
}

function toNodeRequest(request: Request) {
  return request.arrayBuffer().then((arrayBuffer) => {
    const body = Buffer.from(arrayBuffer)
    const stream = Readable.from(body)
    const headers = Object.fromEntries(request.headers.entries())
    return Object.assign(stream, {
      headers,
      method: request.method,
      url: "",
    })
  })
}

async function parseMultipartForm(request: Request): Promise<ParsedForm> {
  const contentType = request.headers.get("content-type") || ""
  if (!contentType.includes("multipart/form-data")) {
    throw new Error("درخواست باید از نوع فرم چندبخشی باشد.")
  }

  const form = new IncomingForm({
    maxFileSize: MAX_FILE_SIZE,
    maxFiles: 1,
    multiples: false,
    allowEmptyFiles: false,
    filter: ({ mimetype }) => {
      if (!mimetype) return false
      return ALLOWED_MIME_TYPES.has(mimetype)
    },
  })

  const nodeRequest = await toNodeRequest(request)

  return await new Promise((resolve, reject) => {
    form.parse(nodeRequest as any, (err, fields, files) => {
      if (err) {
        reject(err)
        return
      }
      resolve({ fields, files } as ParsedForm)
    })
  })
}

function resolveExtension(file: FormidableFile) {
  const originalExt = path.extname(file.originalFilename || "").toLowerCase()
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(originalExt)) {
    return originalExt === ".jpeg" ? ".jpg" : originalExt
  }
  return MIME_TO_EXT[file.mimetype || ""] || ""
}

export async function POST(request: Request) {
  try {
    const { files } = await parseMultipartForm(request)
    const file = files.file

    if (!file || Array.isArray(file)) {
      return NextResponse.json({ error: "فایل معتبری ارسال نشده است." }, { status: 400 })
    }

    if (!file.mimetype || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return NextResponse.json({ error: "فرمت فایل مجاز نیست." }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "حجم فایل بیش از ۵ مگابایت است." }, { status: 400 })
    }

    const ext = resolveExtension(file)
    if (!ext) {
      return NextResponse.json({ error: "فرمت فایل شناسایی نشد." }, { status: 400 })
    }

    const now = new Date()
    const year = String(now.getFullYear())
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const uploadDir = path.join(process.cwd(), "public", "uploads", year, month)
    await fs.mkdir(uploadDir, { recursive: true })

    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`
    const destination = path.join(uploadDir, safeName)
    await fs.rename(file.filepath, destination)

    return NextResponse.json({ url: `/uploads/${year}/${month}/${safeName}` })
  } catch (error: any) {
    if (error?.code === "LIMIT_FILE_SIZE") {
      return NextResponse.json({ error: "حجم فایل بیش از ۵ مگابایت است." }, { status: 400 })
    }

    const message =
      typeof error?.message === "string" && error.message.length > 0
        ? error.message
        : "آپلود فایل با خطا مواجه شد."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
