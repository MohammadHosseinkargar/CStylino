/**
 * Zarinpal Payment Integration using Direct REST API
 * NO SDK - Direct API calls only
 */

const ZARINPAL_BASE_URL = process.env.ZARINPAL_BASE_URL || "https://api.zarinpal.com/pg/v4/payment"
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID

if (!MERCHANT_ID) {
  console.warn("ZARINPAL_MERCHANT_ID is not set in environment variables")
}

export interface ZarinpalRequestParams {
  amount: number // Amount in Toman
  description: string
  callbackUrl: string
  orderId: string
  mobile?: string
  email?: string
}

export interface ZarinpalRequestResponse {
  data: {
    code: number
    message: string
    authority: string
    fee_type: string
    fee: number
  }
  errors: any[]
}

export interface ZarinpalVerifyParams {
  authority: string
  amount: number // Amount in Toman
}

export interface ZarinpalVerifyResponse {
  data: {
    code: number
    message: string
    ref_id: number
    fee_type: string
    fee: number
  }
  errors: any[]
}

/**
 * Request payment from Zarinpal
 * Returns authority code if successful (code === 100)
 */
export async function zarinpalRequest(
  params: ZarinpalRequestParams
): Promise<{ success: boolean; authority?: string; error?: string }> {
  if (!MERCHANT_ID) {
    throw new Error("ZARINPAL_MERCHANT_ID is not configured")
  }

  try {
    const response = await fetch(`${ZARINPAL_BASE_URL}/request.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: params.amount,
        callback_url: `${params.callbackUrl}?orderId=${params.orderId}`,
        description: params.description,
        ...(params.mobile && { mobile: params.mobile }),
        ...(params.email && { email: params.email }),
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ZarinpalRequestResponse = await response.json()

    if (data.data.code === 100) {
      return {
        success: true,
        authority: data.data.authority,
      }
    } else {
      return {
        success: false,
        error: data.data.message || `Error code: ${data.data.code}`,
      }
    }
  } catch (error: any) {
    console.error("Zarinpal payment request error:", error)
    throw new Error(`خطا در ایجاد درخواست پرداخت: ${error.message}`)
  }
}

/**
 * Verify payment with Zarinpal
 * Returns ref_id if successful (code === 100 or 101)
 * Code 101 means payment was already verified
 */
export async function zarinpalVerify(
  params: ZarinpalVerifyParams
): Promise<{ success: boolean; refId?: number; error?: string; alreadyVerified?: boolean }> {
  if (!MERCHANT_ID) {
    throw new Error("ZARINPAL_MERCHANT_ID is not configured")
  }

  try {
    const response = await fetch(`${ZARINPAL_BASE_URL}/verify.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: params.amount,
        authority: params.authority,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ZarinpalVerifyResponse = await response.json()

    if (data.data.code === 100) {
      // Payment verified successfully
      return {
        success: true,
        refId: data.data.ref_id,
      }
    } else if (data.data.code === 101) {
      // Payment already verified (idempotent)
      return {
        success: true,
        refId: data.data.ref_id,
        alreadyVerified: true,
      }
    } else {
      return {
        success: false,
        error: data.data.message || `Error code: ${data.data.code}`,
      }
    }
  } catch (error: any) {
    console.error("Zarinpal payment verification error:", error)
    throw new Error(`خطا در تایید پرداخت: ${error.message}`)
  }
}

/**
 * Get Zarinpal gateway URL for redirect
 */
export function getZarinpalGatewayUrl(authority: string): string {
  return `https://www.zarinpal.com/pg/StartPay/${authority}`
}
