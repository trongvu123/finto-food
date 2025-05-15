"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { register } from "@/lib/api"
import { toast } from "sonner"
import { Eye, EyeOff, User, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, Facebook, Github } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [activeTab, setActiveTab] = useState("email")

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        // Calculate password strength
        if (!formData.password) {
            setPasswordStrength(0)
            return
        }

        let strength = 0
        // Length check
        if (formData.password.length >= 8) strength += 25
        // Contains number
        if (/\d/.test(formData.password)) strength += 25
        // Contains lowercase
        if (/[a-z]/.test(formData.password)) strength += 25
        // Contains uppercase or special char
        if (/[A-Z]/.test(formData.password) || /[^A-Za-z0-9]/.test(formData.password)) strength += 25

        setPasswordStrength(strength)
    }, [formData.password])

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

        if (!acceptTerms) {
            newErrors.terms = "Bạn cần đồng ý với điều khoản dịch vụ"
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
                toast.success("Đăng ký thành công!", {
                    description: "Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn."
                })
                router.push("/dang-nhap")
            } catch (error) {
                toast.error("Đăng ký thất bại", {
                    description: "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau."
                })
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

    const getPasswordStrengthText = () => {
        if (passwordStrength === 0) return "Chưa nhập mật khẩu"
        if (passwordStrength <= 25) return "Yếu"
        if (passwordStrength <= 50) return "Trung bình"
        if (passwordStrength <= 75) return "Khá"
        return "Mạnh"
    }

    const getPasswordStrengthColor = () => {
        if (passwordStrength === 0) return "bg-gray-200"
        if (passwordStrength <= 25) return "bg-red-500"
        if (passwordStrength <= 50) return "bg-orange-500"
        if (passwordStrength <= 75) return "bg-yellow-500"
        return "bg-green-500"
    }

    if (!mounted) {
        return null // Prevent hydration mismatch
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
            <div className="container relative flex min-h-screen flex-col items-center justify-center py-10">
                {/* Background decoration */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute left-0 top-0 h-32 w-32 animate-float opacity-10">
                        <Image
                            src="/paw-print.svg"
                            alt="Paw print"
                            width={128}
                            height={128}
                        />
                    </div>
                    <div className="absolute bottom-0 right-0 h-32 w-32 animate-float-delayed opacity-10">
                        <Image
                            src="/paw-print.svg"
                            alt="Paw print"
                            width={128}
                            height={128}
                        />
                    </div>
                </div>

                <div className="grid w-full max-w-[1000px] grid-cols-1 gap-8 lg:grid-cols-5">
                    {/* Left side - Illustration (hidden on mobile) */}
                    <motion.div
                        className="hidden lg:col-span-2 lg:flex lg:flex-col lg:items-center lg:justify-center"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="relative h-80 w-80">
                            <Image
                                src="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg"
                                alt="Pet illustration"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="mt-8 space-y-4 text-center">
                            <h2 className="text-2xl font-bold">Chào mừng đến với Finto</h2>
                            <p className="text-muted-foreground">
                                Nơi cung cấp những sản phẩm tốt nhất cho thú cưng của bạn
                            </p>
                            <div className="flex justify-center space-x-2">
                                <span className="h-2 w-2 rounded-full bg-primary"></span>
                                <span className="h-2 w-2 rounded-full bg-primary/60"></span>
                                <span className="h-2 w-2 rounded-full bg-primary/30"></span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right side - Registration form */}
                    <motion.div
                        className="lg:col-span-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="border-2 border-primary/20 shadow-lg">
                            <CardHeader className="space-y-1">
                                <div className="flex justify-center">
                                    <motion.div
                                        className="relative h-20 w-20"
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.4 }}
                                    >
                                        <Image
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dog_Breeds.jpg/1024px-Dog_Breeds.jpg"
                                            alt="Pet Logo"
                                            fill
                                            className="object-contain"
                                        />
                                    </motion.div>
                                </div>
                                <CardTitle className="text-center text-2xl">Đăng ký tài khoản</CardTitle>
                                <CardDescription className="text-center">
                                    Điền thông tin của bạn để tạo tài khoản mới
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="email">Đăng ký với Email</TabsTrigger>
                                        <TabsTrigger value="social">Đăng ký nhanh</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="email" key="email">
                                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    className="space-y-2"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.1 }}
                                                >
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
                                                            className={`pl-10 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                                        />
                                                        <div className="absolute left-3 top-2.5 text-gray-400">
                                                            <User size={18} />
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {errors.name && (
                                                            <motion.p
                                                                className="text-sm text-red-500 flex items-center gap-1"
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                            >
                                                                <AlertCircle size={14} /> {errors.name}
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>

                                                <motion.div
                                                    className="space-y-2"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.2 }}
                                                >
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
                                                            className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                                        />
                                                        <div className="absolute left-3 top-2.5 text-gray-400">
                                                            <Mail size={18} />
                                                        </div>
                                                    </div>
                                                    <AnimatePresence key="email">
                                                        {errors.email && (
                                                            <motion.p
                                                                className="text-sm text-red-500 flex items-center gap-1"
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                            >
                                                                <AlertCircle size={14} /> {errors.email}
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>

                                                <motion.div
                                                    className="space-y-2"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.3 }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="password">Mật khẩu</Label>
                                                        <span className="text-xs text-muted-foreground">
                                                            {getPasswordStrengthText()}
                                                        </span>
                                                    </div>
                                                    <div className="relative">
                                                        <Input
                                                            id="password"
                                                            name="password"
                                                            type={showPassword ? "text" : "password"}
                                                            value={formData.password}
                                                            onChange={handleChange}
                                                            required
                                                            className={`pl-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                                        />
                                                        <div className="absolute left-3 top-2.5 text-gray-400">
                                                            <Lock size={18} />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </Button>
                                                    </div>
                                                    <Progress value={passwordStrength} className={`h-1 ${getPasswordStrengthColor()}`} />
                                                    <AnimatePresence key="password">
                                                        {errors.password && (
                                                            <motion.p
                                                                className="text-sm text-red-500 flex items-center gap-1"
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                            >
                                                                <AlertCircle size={14} /> {errors.password}
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>

                                                <motion.div
                                                    className="space-y-2"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.4 }}
                                                >
                                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="confirmPassword"
                                                            name="confirmPassword"
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            value={formData.confirmPassword}
                                                            onChange={handleChange}
                                                            required
                                                            className={`pl-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                                        />
                                                        <div className="absolute left-3 top-2.5 text-gray-400">
                                                            <Lock size={18} />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </Button>
                                                    </div>
                                                    <AnimatePresence key="confirmPassword">
                                                        {errors.confirmPassword && (
                                                            <motion.p
                                                                className="text-sm text-red-500 flex items-center gap-1"
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                            >
                                                                <AlertCircle size={14} /> {errors.confirmPassword}
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>

                                                <motion.div
                                                    className="flex items-start space-x-2 pt-2"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.5 }}
                                                >
                                                    <Checkbox
                                                        id="terms"
                                                        checked={acceptTerms}
                                                        onCheckedChange={(checked) => {
                                                            setAcceptTerms(checked as boolean)
                                                            if (errors.terms) {
                                                                setErrors((prev) => ({
                                                                    ...prev,
                                                                    terms: "",
                                                                }))
                                                            }
                                                        }}
                                                    />
                                                    <div className="grid gap-1.5 leading-none">
                                                        <label
                                                            htmlFor="terms"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Tôi đồng ý với{" "}
                                                            <Link href="#" className="text-primary hover:underline">
                                                                Điều khoản dịch vụ
                                                            </Link>{" "}
                                                            và{" "}
                                                            <Link href="#" className="text-primary hover:underline">
                                                                Chính sách bảo mật
                                                            </Link>
                                                        </label>
                                                        <AnimatePresence key="terms">
                                                            {errors.terms && (
                                                                <motion.p
                                                                    className="text-sm text-red-500 flex items-center gap-1"
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                >
                                                                    <AlertCircle size={14} /> {errors.terms}
                                                                </motion.p>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>

                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.6 }}
                                                >
                                                    <Button
                                                        type="submit"
                                                        className="mt-6 w-full"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <div className="flex items-center">
                                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                                                                Đang xử lý...
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center">
                                                                Đăng ký
                                                                <ArrowRight className="ml-2 h-4 w-4" />
                                                            </div>
                                                        )}
                                                    </Button>
                                                </motion.div>
                                            </AnimatePresence>
                                        </form>
                                    </TabsContent>
                                    <TabsContent value="social" key="social">
                                        <div className="space-y-4 py-4">
                                            <div className="grid gap-4">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.1 }}
                                                >
                                                    <Button variant="outline" className="w-full relative h-12" type="button">
                                                        <Image
                                                            src="https://www.breatheazy.co.uk/wp-content/uploads/2023/09/Untitled-design-35-1080x675.png"
                                                            alt="Google"
                                                            width={20}
                                                            height={20}
                                                            className="absolute left-4"
                                                        />
                                                        <span>Đăng ký với Google</span>
                                                    </Button>
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.2 }}
                                                >
                                                    <Button variant="outline" className="w-full relative h-12" type="button">
                                                        <Facebook className="absolute left-4 h-5 w-5 text-blue-600" />
                                                        <span>Đăng ký với Facebook</span>
                                                    </Button>
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.3 }}
                                                >
                                                    <Button variant="outline" className="w-full relative h-12" type="button">
                                                        <Github className="absolute left-4 h-5 w-5" />
                                                        <span>Đăng ký với Github</span>
                                                    </Button>
                                                </motion.div>
                                            </div>
                                            <div className="mt-6 text-center text-sm">
                                                <p className="text-muted-foreground">
                                                    Bằng cách đăng ký, bạn đồng ý với{" "}
                                                    <Link href="#" className="text-primary hover:underline">
                                                        Điều khoản dịch vụ
                                                    </Link>{" "}
                                                    và{" "}
                                                    <Link href="#" className="text-primary hover:underline">
                                                        Chính sách bảo mật
                                                    </Link>{" "}
                                                    của chúng tôi.
                                                </p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4">
                                <div className="text-center text-sm">
                                    Đã có tài khoản?{" "}
                                    <Link href="/dang-nhap" className="text-primary hover:underline inline-flex items-center">
                                        Đăng nhập
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </div>
                                <div className="text-center text-xs text-muted-foreground">
                                    <p>© 2024 Finto Pet Food. Tất cả các quyền được bảo lưu.</p>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>

                {/* Decorative elements */}
                <div className="absolute bottom-4 left-4 hidden md:block">
                    <motion.div
                        className="relative h-32 w-32"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            duration: 0.5,
                            delay: 0.8,
                            y: {
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }
                        }}
                    >
                        <Image
                            src="/cat-playing.svg"
                            alt="Cat"
                            fill
                            className="object-contain"
                        />
                    </motion.div>
                </div>
                <div className="absolute bottom-4 right-4 hidden md:block">
                    <motion.div
                        className="relative h-32 w-32"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            duration: 0.5,
                            delay: 1,
                            y: {
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }
                        }}
                    >
                        <Image
                            src="/dog-playing.svg"
                            alt="Dog"
                            fill
                            className="object-contain"
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
