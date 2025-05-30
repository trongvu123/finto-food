"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle, RefreshCw, MessageCircle, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Link from "next/link"

export default function PaymentCancelled() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Có thể thêm analytics tracking ở đây
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-none shadow-lg">
                    <CardHeader className="pb-0">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.1,
                            }}
                            className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4"
                        >
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold text-center text-gray-800"
                        >
                            Thanh toán đã bị hủy
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500 text-center mt-2"
                        >
                            Giao dịch của bạn đã bị hủy hoặc không hoàn thành
                        </motion.p>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6"
                        >
                            <p className="text-amber-800 text-sm">
                                Không có khoản phí nào được tính cho bạn. Nếu bạn gặp vấn đề khi thanh toán, vui lòng thử lại hoặc liên
                                hệ với chúng tôi để được hỗ trợ.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.15,
                                    },
                                },
                            }}
                            initial="hidden"
                            animate="show"
                            className="space-y-4"
                        >
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    show: { opacity: 1, x: 0 },
                                }}
                                className="flex items-start space-x-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <RefreshCw className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-800">Thử lại thanh toán</h3>
                                    <p className="text-sm text-gray-500">Quay lại trang thanh toán và thử lại với phương thức khác</p>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    show: { opacity: 1, x: 0 },
                                }}
                                className="flex items-start space-x-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-800">Liên hệ hỗ trợ</h3>
                                    <p className="text-sm text-gray-500">Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp đỡ bạn</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-3">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="w-full"
                        >
                            <Button
                                className="w-full bg-primary hover:bg-primary/90 text-white"
                                onClick={() => window.history.back()}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" /> Thử lại thanh toán
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="w-full flex space-x-3"
                        >
                            <Button variant="outline" className="flex-1" asChild>
                                <Link href="/">
                                    <Home className="mr-2 h-4 w-4" /> Trang chủ
                                </Link>
                            </Button>
                            <Button variant="outline" className="flex-1" asChild>
                                <Link href="/contact">
                                    <MessageCircle className="mr-2 h-4 w-4" /> Liên hệ hỗ trợ
                                </Link>
                            </Button>
                        </motion.div>
                    </CardFooter>
                </Card>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 text-center"
                >
                    <p className="text-sm text-gray-500">
                        Mã giao dịch:{" "}
                        <span className="font-mono">TXN-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}
