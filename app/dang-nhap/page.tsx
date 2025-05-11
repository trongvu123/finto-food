"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/api"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setLoading(true)
            const res = await login(formData)
            if (res.token) {
                localStorage.setItem("token", res.token)
                toast.success("Đăng nhập thành công!")
                router.push("/")
            } else {
                toast.error("Đăng nhập thất bại")
            }

            router.push("/")
        } catch (error) {
            toast.error("Đăng nhập thất bại")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8 rounded-lg border p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Đăng nhập</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Chưa có tài khoản?{" "}
                        <Link href="/dang-ky" className="text-primary hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium">
                            Mật khẩu
                        </label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Đăng nhập"}
                    </Button>
                </form>
            </div>
        </div>
    )
} 