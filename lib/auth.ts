import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

interface JwtPayload {
    id: string
    email: string
    name: string
    role: string
}

export async function createToken(payload: JwtPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export async function verifyToken(token: string): Promise<JwtPayload> {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload
    } catch (error) {
        throw new Error("Invalid token")
    }
}

export async function getTokenFromHeader(authHeader: string | undefined) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("No token provided")
    }
    return authHeader.split(" ")[1]
}

export async function getAuthUser(req: NextRequest): Promise<JwtPayload | null> {
    const token = req.cookies.get("token")?.value
    if (!token) return null

    try {
        return await verifyToken(token)
    } catch {
        return null
    }
}

export async function requireAuth(req: NextRequest): Promise<JwtPayload> {
    const user = await getAuthUser(req)
    if (!user) {
        throw new Error("Unauthorized")
    }
    return user
}

export async function requireAdmin(req: NextRequest): Promise<JwtPayload> {
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