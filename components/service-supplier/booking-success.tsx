"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Calendar, MapPin, Phone, Mail, Download, Share2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import InvoicePDFGenerator from "./invoice-pdf-generator"

interface BookingSuccessProps {
    serviceOrder: any;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ serviceOrder }) => {
    const searchParams = useSearchParams()
    const [mounted, setMounted] = useState(false)

    const orderCode = serviceOrder?.orderCode || searchParams.get("orderId") || "PET123456"
    const serviceName = serviceOrder?.service?.name || searchParams.get("service") || "Dịch vụ thú cưng"
    const total = serviceOrder?.total || searchParams.get("total") || "0"

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const orderInfo = {
        orderCode,
        serviceName,
        supplierName: serviceOrder?.service?.supplier?.name || "Pet Spa Luxury",
        customerName: serviceOrder?.userName || "Nguyễn Văn A",
        customerPhone: serviceOrder?.userPhone || "0123456789",
        customerEmail: serviceOrder?.userEmail || "customer@example.com",
        petName: serviceOrder?.petName || "Buddy",
        orderTime: serviceOrder?.orderTime || "2024-01-20 14:00",
        address: serviceOrder?.userAddress || "123 Nguyễn Trãi, Thanh Xuân, Hà Nội",
        total: serviceOrder?.total || Number.parseInt(total),
        status: serviceOrder?.status || "Đã xác nhận",
        paymentMethod: serviceOrder?.paymentMethod || "Thanh toán sau khi hoàn thành dịch vụ",
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                {/* Success Header */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.1,
                    }}
                    className="text-center mb-8"
                >
                    <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-gray-900 mb-2"
                    >
                        Đặt lịch thành công!
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600"
                    >
                        Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi
                    </motion.p>
                </motion.div>

                {/* Order Details */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <CardTitle className="flex items-center justify-between">
                                <span>Thông tin đặt lịch</span>
                                <Badge variant="secondary" className="bg-white text-blue-600">
                                    {orderInfo.status}
                                </Badge>
                            </CardTitle>
                            <p className="text-blue-100">Mã đơn hàng: {orderInfo.orderCode}</p>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Service Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Thông tin dịch vụ</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm text-gray-500">Dịch vụ</label>
                                            <p className="font-medium">{orderInfo.serviceName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Nhà cung cấp</label>
                                            <p className="font-medium">{orderInfo.supplierName}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <label className="text-sm text-gray-500">Thời gian</label>
                                                <p className="font-medium">{new Date(orderInfo.orderTime).toLocaleString("vi-VN")}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                                            <div>
                                                <label className="text-sm text-gray-500">Địa chỉ</label>
                                                <p className="font-medium">{orderInfo.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Thông tin khách hàng</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm text-gray-500">Tên khách hàng</label>
                                            <p className="font-medium">{orderInfo.customerName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Tên thú cưng</label>
                                            <p className="font-medium">{orderInfo.petName}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <label className="text-sm text-gray-500">Số điện thoại</label>
                                                <p className="font-medium">{orderInfo.customerPhone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <label className="text-sm text-gray-500">Email</label>
                                                <p className="font-medium">{orderInfo.customerEmail}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="mt-6 pt-6 border-t">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-lg">Thông tin thanh toán</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span>Phương thức thanh toán:</span>
                                        <span className="font-medium">{orderInfo.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Tổng tiền:</span>
                                        <span className="text-blue-600">{orderInfo.total.toLocaleString()}đ</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Next Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Bước tiếp theo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-blue-600 font-medium text-xs">1</span>
                                    </div>
                                    <p>Nhà cung cấp sẽ liên hệ với bạn để xác nhận lịch hẹn trong vòng 24 giờ</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-blue-600 font-medium text-xs">2</span>
                                    </div>
                                    <p>Vui lòng đến đúng giờ hẹn và mang theo thú cưng của bạn</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-blue-600 font-medium text-xs">3</span>
                                    </div>
                                    <p>Thanh toán sau khi hoàn thành dịch vụ theo phương thức đã chọn</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6 flex flex-col sm:flex-row gap-3"
                >
                    <Button variant="outline" className="flex-1">
                        <InvoicePDFGenerator order={serviceOrder} />
                    </Button>
                    <Button variant="outline" className="flex-1">
                        <Share2 className="mr-2 h-4 w-4" />
                        Chia sẻ
                    </Button>
                    <Button asChild className="flex-1">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Về trang chủ
                        </Link>
                    </Button>
                </motion.div>

                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-center text-sm text-gray-500"
                >
                    <p>
                        Nếu có thắc mắc, vui lòng liên hệ hotline: <span className="font-medium">1900 1234 567</span>
                    </p>
                    <p>
                        hoặc email: <span className="font-medium">support@petservice.com</span>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default BookingSuccess
