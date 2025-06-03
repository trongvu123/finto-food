"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    Calendar,
    Clock,
    Heart,
    Mail,
    MapPin,
    Phone,
    User,
    Package,
    CheckCircle,
    XCircle,
    AlertCircle,
    CreditCard,
    Star,
    ZoomIn,
    Download,
    Maximize2,
    Minimize2,
    X,
    MessageSquare,
    Info,
    Truck,
    Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import InvoicePDFGenerator from "@/components/service-supplier/invoice-pdf-generator"
import ReviewModal from "@/components/service-supplier/review-modal"

interface ServiceOrder {
    id: string
    serviceId: string
    userId: string
    userName: string
    userPhone: string
    userAddress: string
    userEmail: string
    userNote?: string
    petName: string
    petBreed: string
    petAge: number
    petWeight: number
    petGender: "male" | "female"
    petImage: string
    petNote?: string
    petStatus: string
    orderTime: string
    orderCode: string
    paid: boolean
    status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
    paymentMethod: string
    total: number
    createdAt: string
    updatedAt: string
    hasReviewed: boolean
    service: {
        name: string
        supplier: {
            name: string
        }
    }
}

const statusConfig = {
    PENDING: {
        label: "Chờ xác nhận",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        progress: 25,
        description: "Đơn hàng đang chờ được xác nhận từ nhà cung cấp",
    },
    CONFIRMED: {
        label: "Đã xác nhận",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
        progress: 50,
        description: "Đơn hàng đã được xác nhận và sẽ được thực hiện",
    },
    IN_PROGRESS: {
        label: "Đang thực hiện",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Truck,
        progress: 75,
        description: "Dịch vụ đang được thực hiện",
    },
    COMPLETED: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        progress: 100,
        description: "Dịch vụ đã hoàn thành thành công",
    },
    CANCELLED: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        progress: 0,
        description: "Đơn hàng đã bị hủy",
    },
}

// Image Preview Component
const ImagePreview = ({
    imageUrl,
    petName,
    isOpen,
    onClose,
}: {
    imageUrl: string
    petName: string
    isOpen: boolean
    onClose: () => void
}) => {
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`)
            })
            setIsFullScreen(true)
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
                setIsFullScreen(false)
            }
        }
    }

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement)
        }

        document.addEventListener("fullscreenchange", handleFullScreenChange)
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange)
        }
    }, [])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        onClick={toggleFullScreen}
                    >
                        {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        onClick={() => {
                            const link = document.createElement("a")
                            link.href = imageUrl
                            link.download = `pet-${petName.toLowerCase().replace(/\s+/g, "-")}.jpg`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                        }}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="relative w-full h-[80vh] flex items-center justify-center">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    )}

                    {error ? (
                        <div className="text-center text-white p-8">
                            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                            <p>Không thể tải ảnh</p>
                            <Button variant="outline" className="mt-4" onClick={onClose}>
                                Đóng
                            </Button>
                        </div>
                    ) : (
                        <Image
                            src={imageUrl || "/placeholder.svg"}
                            alt={`Ảnh thú cưng ${petName}`}
                            fill
                            className="object-contain"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false)
                                setError(true)
                            }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                        />
                    )}
                </div>

                <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/40 py-2 px-4 backdrop-blur-sm">
                    <h3 className="text-lg font-medium">{petName}</h3>
                </div>
            </div>
        </div>
    )
}

interface Props {
    params: { id: string }
}

export default function ServiceOrderView({ params }: Props) {
    const { id: orderId } = params
    const [order, setOrder] = useState<ServiceOrder | null>(null)
    const [loading, setLoading] = useState(true)
    const [previewImage, setPreviewImage] = useState<{ url: string; petName: string } | null>(null)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    useEffect(() => {
        fetchOrderDetails()
    }, [orderId])

    const fetchOrderDetails = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/service-orders/${orderId}`)

            if (!response.ok) {
                throw new Error(`Failed to fetch service order: ${response.status}`)
            }

            const data = await response.json()
            setOrder(data)
        } catch (error) {
            console.error("Error fetching order details:", error)
            toast.error("Không thể tải thông tin đơn hàng")
        } finally {
            setLoading(false)
        }
    }
    const handleSubmitReview = () => {
        fetchOrderDetails()
    }
    const openImagePreview = (url: string, petName: string) => {
        if (!url) {
            toast.error("Không có ảnh thú cưng")
            return
        }
        setPreviewImage({ url, petName })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
                    <p className="text-gray-600 mb-6">Đơn hàng này có thể đã bị xóa hoặc không tồn tại.</p>
                    <Button asChild>
                        <Link href="/don-dich-vu">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại danh sách đơn hàng
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    const statusInfo = statusConfig[order.status]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/don-dich-vu">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Quay lại
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{order.orderCode}</h1>
                                <p className="text-gray-600">Đặt lúc {formatDate(order.createdAt)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className={statusInfo.color} variant="outline">
                                {React.createElement(statusInfo.icon, { className: "h-4 w-4 mr-2" })}
                                {statusInfo.label}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Alert for Confirmed Orders */}
                        {order.status === "CONFIRMED" && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                <Alert className="bg-blue-50 border-blue-200">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800">
                                        <strong>Đơn hàng đã được xác nhận!</strong> Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ tới để
                                        sắp xếp lịch hẹn cụ thể.
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}

                        {/* Order Progress */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Tiến trình đơn hàng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{statusInfo.label}</span>
                                            <span className="text-sm text-gray-500">{statusInfo.progress}%</span>
                                        </div>
                                        <Progress value={statusInfo.progress} className="h-2" />
                                        <p className="text-sm text-gray-600">{statusInfo.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Service Information */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5" />
                                        Thông tin dịch vụ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">{order.service.name}</h3>
                                        <p className="text-gray-600">Nhà cung cấp: {order.service.supplier.name}</p>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Thời gian đặt lịch</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(order.orderTime)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Tổng tiền</p>
                                            <p className="font-bold text-xl text-emerald-600">{formatCurrency(order.total)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Pet Information */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Heart className="h-5 w-5" />
                                        Thông tin thú cưng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-6">
                                        {/* Pet Image */}
                                        <div className="flex-shrink-0">
                                            <div
                                                className={`w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 ${order.petImage ? "cursor-pointer hover:opacity-90" : ""
                                                    }`}
                                                onClick={() => order.petImage && openImagePreview(order.petImage, order.petName)}
                                            >
                                                {order.petImage ? (
                                                    <div className="relative w-full h-full">
                                                        <Image
                                                            src={order.petImage || "/placeholder.svg"}
                                                            alt={order.petName}
                                                            width={128}
                                                            height={128}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                            <ZoomIn className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                        <Heart className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center mt-2">
                                                {order.petImage ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-blue-600"
                                                        onClick={() => openImagePreview(order.petImage, order.petName)}
                                                    >
                                                        <ZoomIn className="h-3 w-3 mr-1" />
                                                        Xem ảnh
                                                    </Button>
                                                ) : (
                                                    <p className="text-xs text-gray-500">Chưa có ảnh</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Pet Details */}
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Tên thú cưng</p>
                                                <p className="font-semibold text-lg text-blue-600">{order.petName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Giống loài</p>
                                                <p className="font-medium">{order.petBreed}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Tuổi</p>
                                                <p className="font-medium">{order.petAge} tháng</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Cân nặng</p>
                                                <p className="font-medium">{order.petWeight} kg</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Giới tính</p>
                                                <p className="font-medium">{order.petGender === "male" ? "Đực" : "Cái"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Tình trạng sức khỏe</p>
                                                <p className="font-medium">{order.petStatus}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {order.petNote && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-sm text-gray-500 mb-2">Ghi chú về thú cưng</p>
                                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                <p className="text-gray-700">{order.petNote}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Customer Information */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Thông tin khách hàng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Tên khách hàng</p>
                                                <p className="font-medium">{order.userName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Số điện thoại</p>
                                                <a href={`tel:${order.userPhone}`} className="font-medium text-blue-600 hover:underline">
                                                    {order.userPhone}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <a href={`mailto:${order.userEmail}`} className="font-medium text-blue-600 hover:underline">
                                                    {order.userEmail}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Địa chỉ</p>
                                                <p className="font-medium">{order.userAddress}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {order.userNote && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm text-gray-500 mb-2">Ghi chú từ khách hàng</p>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-gray-700">{order.userNote}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="sticky top-8 space-y-6"
                        >
                            {/* Payment Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Thanh toán
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Trạng thái</span>
                                        <Badge variant={order.paid ? "default" : "outline"}>
                                            {order.paid ? "Đã thanh toán" : "Chưa thanh toán"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Phương thức</span>
                                        <span className="font-medium">{order.paymentMethod}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between text-lg font-bold">
                                        <span>Tổng cộng</span>
                                        <span className="text-emerald-600">{formatCurrency(order.total)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Hành động</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {order.status === "COMPLETED" && !order.hasReviewed && (
                                        <Button className="w-full" onClick={() => setIsReviewModalOpen(true)}>
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Đánh giá dịch vụ
                                        </Button>
                                    )}
                                    <Button variant="outline" className="w-full">
                                        <Phone className="h-4 w-4 mr-2" />
                                        Liên hệ hỗ trợ
                                    </Button>
                                    <InvoicePDFGenerator order={order as any} />
                                </CardContent>
                            </Card>

                            {/* Security Notice */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-sm">Bảo mật thông tin</h4>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Thông tin của bạn được bảo vệ và chỉ được chia sẻ với nhà cung cấp dịch vụ.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
            <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} order={order as any} onReviewSubmitted={handleSubmitReview} />
            {/* Image Preview Modal */}
            {previewImage && (
                <ImagePreview
                    imageUrl={previewImage.url}
                    petName={previewImage.petName}
                    isOpen={!!previewImage}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </div>
    )
}
