import { cookies } from "next/headers"

const AFFILIATE_COOKIE_NAME = "stylino_ref"
const AFFILIATE_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

export function setAffiliateRef(refCode: string) {
  const cookieStore = cookies()
  cookieStore.set(AFFILIATE_COOKIE_NAME, refCode, {
    maxAge: AFFILIATE_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export function getAffiliateRef(): string | null {
  const cookieStore = cookies()
  return cookieStore.get(AFFILIATE_COOKIE_NAME)?.value || null
}

export function clearAffiliateRef() {
  const cookieStore = cookies()
  cookieStore.delete(AFFILIATE_COOKIE_NAME)
}

