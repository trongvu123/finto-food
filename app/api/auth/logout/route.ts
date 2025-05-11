import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth"

export async function POST() {
    const response = NextResponse.json({ success: true })
    response.cookies.delete("token")
    return response
} 