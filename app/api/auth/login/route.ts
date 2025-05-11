import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createToken } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json(
                { error: "Email hoặc mật khẩu không đúng" },
                { status: 401 }
            )
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Email hoặc mật khẩu không đúng" },
                { status: 401 }
            )
        }

        const token = await createToken({
            id: user.id,
            email: user.email,
            name: user.name || "",
            role: user.role
        })

        const response = NextResponse.json(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            },
            { status: 200 }
        )

        // Set HTTP-only cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 // 7 days
        })

        return response
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json(
            { error: "Đã xảy ra lỗi khi đăng nhập" },
            { status: 500 }
        )
    }
} 