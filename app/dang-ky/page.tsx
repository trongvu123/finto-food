"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { register } from "@/lib/api"
import { toast } from "sonner"

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Vui lòng nhập họ tên"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Vui lòng nhập email"
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = "Email không hợp lệ"
        }

        if (!formData.password) {
            newErrors.password = "Vui lòng nhập mật khẩu"
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            try {
                setLoading(true)
                await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
                toast.success("Đăng ký thành công!")
                router.push("/dang-nhap")
            } catch (error) {
                toast.error("Đăng ký thất bại")
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }))
        }
    }

    return (
        <div className="container relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-0 top-0 h-32 w-32 animate-float">
                    <Image
                        src="/paw-print.svg"
                        alt="Paw print"
                        width={128}
                        height={128}
                        className="opacity-10"
                    />
                </div>
                <div className="absolute bottom-0 right-0 h-32 w-32 animate-float-delayed">
                    <Image
                        src="/paw-print.svg"
                        alt="Paw print"
                        width={128}
                        height={128}
                        className="opacity-10"
                    />
                </div>
            </div>

            <Card className="w-full max-w-[400px] border-2 border-primary/20 shadow-lg">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center">
                        <div className="relative h-20 w-20">
                            <Image
                                src="/pet-logo.svg"
                                alt="Pet Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Đăng ký tài khoản</CardTitle>
                    <CardDescription className="text-center">
                        Điền thông tin của bạn để tạo tài khoản mới
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Họ tên</Label>
                            <div className="relative">
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Nguyễn Văn A"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="pl-10"
                                />
                                <div className="absolute left-3 top-2.5">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="pl-10"
                                />
                                <div className="absolute left-3 top-2.5">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                        />
                                    </svg>
                                </div>
                            </div>
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="pl-10"
                                />
                                <div className="absolute left-3 top-2.5">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="pl-10"
                                />
                                <div className="absolute left-3 top-2.5">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Đang xử lý..." : "Đăng ký"}
                        </Button>
                    </form>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Hoặc đăng ký với
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" type="button" className="relative">
                            <Image
                                src="/google.svg"
                                alt="Google"
                                width={20}
                                height={20}
                                className="absolute left-4"
                            />
                            Google
                        </Button>
                        <Button variant="outline" type="button" className="relative">
                            <Image
                                src="/facebook.svg"
                                alt="Facebook"
                                width={20}
                                height={20}
                                className="absolute left-4"
                            />
                            Facebook
                        </Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="text-center text-sm">
                        Đã có tài khoản?{" "}
                        <Link href="/dang-nhap" className="text-primary hover:underline">
                            Đăng nhập
                        </Link>
                    </div>
                </CardFooter>
            </Card>

            {/* Decorative elements */}
            <div className="absolute bottom-4 left-4 hidden md:block">
                <div className="relative h-32 w-32 animate-bounce-slow">
                    <Image
                        src="/cat-playing.svg"
                        alt="Cat"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>
            <div className="absolute bottom-4 right-4 hidden md:block">
                <div className="relative h-32 w-32 animate-bounce-slow-delayed">
                    <Image
                        src="/dog-playing.svg"
                        alt="Dog"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>
        </div>
    )
} 