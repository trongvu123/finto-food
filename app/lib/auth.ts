import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function createToken(payload: any) {
    // In a real app, you would use a proper JWT library
    const token = Buffer.from(JSON.stringify(payload)).toString("base64")
    return token
}

export async function verifyToken(token: string) {
    try {
        const payload = JSON.parse(Buffer.from(token, "base64").toString())
        return payload
    } catch (error) {
        return null
    }
}

export async function getAuthUser(req: NextRequest) {
    const token = req.cookies.get("token")?.value
    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload) return null

    return payload
}

export async function requireAuth(req: NextRequest) {
    const user = await getAuthUser(req) ?? null

    return user
}

export async function requireAdmin(req: NextRequest) {
    const user = await requireAuth(req)
    if (user.role !== "ADMIN") {
        throw new Error("Forbidden")
    }
    return user
}

export async function setAuthCookie(token: string) {
    const response = NextResponse.next()
    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 // 24 hours
    })
    return response
}

export async function clearAuthCookie() {
    const response = NextResponse.next()
    response.cookies.delete("token")
    return response
} 