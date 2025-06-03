"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Calendar,
    Clock,
    Heart,
    Package,
    CheckCircle,
    XCircle,
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
    Eye,
    Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import { useAppStore } from "@/components/app-provider"

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

// Order Card Component
const OrderCard = ({
    order,
    onImagePreview,
}: {
    order: ServiceOrder
    onImagePreview: (url: string, petName: string) => void
}) => {
    const statusInfo = statusConfig[order.status]

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                {/* Header with Status */}
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg">#{order.orderCode}</h3>
                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <Badge className={statusInfo.color} variant="outline">
                            {React.createElement(statusInfo.icon, { className: "h-3 w-3 mr-1" })}
                            {statusInfo.label}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Confirmed Order Alert */}
                    {order.status === "CONFIRMED" && (
                        <Alert className="bg-blue-50 border-blue-200 py-2">
                            <Info className="h-3 w-3 text-blue-600" />
                            <AlertDescription className="text-xs text-blue-800">Sẽ được liên hệ trong 24h</AlertDescription>
                        </Alert>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">{statusInfo.label}</span>
                            <span className="text-xs text-gray-500">{statusInfo.progress}%</span>
                        </div>
                        <Progress value={statusInfo.progress} className="h-1.5" />
                    </div>

                    {/* Service Info */}
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="font-medium text-sm line-clamp-2">{order.service.name}</p>
                                <p className="text-xs text-gray-500">{order.service.supplier.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Pet & Customer Info */}
                    <div className="flex items-center gap-3">
                        <div
                            className={`relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 ${order.petImage ? "cursor-pointer hover:opacity-80" : ""
                                }`}
                            onClick={() => order.petImage && onImagePreview(order.petImage, order.petName)}
                        >
                            {order.petImage ? (
                                <div className="relative w-full h-full">
                                    <Image
                                        src={order.petImage || "/placeholder.svg"}
                                        alt={order.petName}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <ZoomIn className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <Heart className="h-4 w-4 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm">{order.petName}</p>
                            <p className="text-xs text-gray-500">{order.petBreed}</p>
                            <p className="text-xs text-gray-500">{order.userName}</p>
                        </div>
                    </div>

                    {/* Schedule & Payment */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(order.orderTime)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-3 w-3 text-gray-400" />
                                <Badge variant={order.paid ? "default" : "outline"} className="text-xs">
                                    {order.paid ? "Đã thanh toán" : "Chưa thanh toán"}
                                </Badge>
                            </div>
                            <span className="font-bold text-emerald-600">{formatCurrency(order.total)}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button asChild size="sm" className="flex-1">
                            <Link href={`/don-dich-vu/${order.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                Xem chi tiết
                            </Link>
                        </Button>
                        {order.status === "COMPLETED" && !order.hasReviewed && (
                            <Button size="sm" variant="outline">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Đánh giá
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default function ServiceOrdersList() {
    const [orders, setOrders] = useState<ServiceOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [paymentFilter, setPaymentFilter] = useState("all")
    const [sortBy, setSortBy] = useState<string>("newest")
    const [previewImage, setPreviewImage] = useState<{ url: string; petName: string } | null>(null)
    const user = useAppStore((state) => state.user)
    // const userId = "user123"


    useEffect(() => {
        fetchOrders()
    }, [searchTerm, statusFilter, paymentFilter, sortBy, user?.id])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await fetch(
                `/api/service-orders?userId=${user?.id}&search=${searchTerm}&status=${statusFilter === "all" ? "" : statusFilter}&paid=${paymentFilter === "paid" ? "true" : paymentFilter === "unpaid" ? "false" : ""
                }`
            )

            if (!response.ok) {
                throw new Error(`Failed to fetch service orders: ${response.status}`)
            }

            const data = await response.json()
            setOrders(data)
        } catch (error) {
            console.error("Error fetching orders:", error)
            toast.error("Không thể tải danh sách đơn hàng")
        } finally {
            setLoading(false)
        }
    }

    const openImagePreview = (url: string, petName: string) => {
        if (!url || url.includes("placeholder")) {
            toast.error("Không có ảnh thú cưng")
            return
        }
        setPreviewImage({ url, petName })
    }

    const filteredAndSortedOrders = orders

    const confirmedOrdersCount = orders.filter((order) => order.status === "CONFIRMED").length

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Đơn hàng dịch vụ</h1>
                            <p className="text-gray-600 mt-1">Quản lý và theo dõi các đơn hàng dịch vụ thú cưng</p>
                        </div>
                        <Button asChild>
                            <Link href="/dich-vu">
                                <Plus className="h-4 w-4 mr-2" />
                                Đặt dịch vụ mới
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Confirmed Orders Alert */}
                {confirmedOrdersCount > 0 && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                        <Alert className="bg-blue-50 border-blue-200">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                <strong>Bạn có {confirmedOrdersCount} đơn hàng đã được xác nhận!</strong> Chúng tôi sẽ liên hệ với bạn
                                trong vòng 24 giờ tới để sắp xếp lịch hẹn cụ thể.
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                {/* Filters and Search */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="lg:col-span-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Tìm kiếm theo mã đơn, tên khách hàng, thú cưng..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                                        <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                                        <SelectItem value="IN_PROGRESS">Đang thực hiện</SelectItem>
                                        <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                                        <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Thanh toán" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="paid">Đã thanh toán</SelectItem>
                                        <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sắp xếp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Mới nhất</SelectItem>
                                        <SelectItem value="oldest">Cũ nhất</SelectItem>
                                        <SelectItem value="amount-high">Giá cao nhất</SelectItem>
                                        <SelectItem value="amount-low">Giá thấp nhất</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Orders Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="overflow-hidden">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                                        </div>
                                        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="flex gap-3">
                                        <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-600">
                                Hiển thị <span className="font-medium">{filteredAndSortedOrders.length}</span> đơn hàng
                            </p>
                        </div>

                        {filteredAndSortedOrders.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16 bg-white rounded-lg shadow-sm"
                            >
                                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-800 mb-2">Không tìm thấy đơn hàng</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">
                                    Không có đơn hàng nào phù hợp với bộ lọc của bạn. Thử điều chỉnh bộ lọc hoặc tạo đơn hàng mới.
                                </p>
                                <Button asChild>
                                    <Link href="/dich-vu">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Đặt dịch vụ mới
                                    </Link>
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {filteredAndSortedOrders.map((order, index) => (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <OrderCard order={order} onImagePreview={openImagePreview} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </>
                )}
            </div>

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
