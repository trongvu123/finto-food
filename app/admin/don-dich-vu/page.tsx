"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Calendar,
    DollarSign,
    Clock,
    Heart,
    User,
    Package,
    ZoomIn,
    X,
    Download,
    Maximize2,
    Minimize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import Image from "next/image"

interface ServiceOrder {
    id: string
    orderCode: string
    service: {
        name: string
        supplier: {
            name: string
        }
    }
    supplierName: string
    userName: string
    userPhone: string
    userEmail: string
    userAddress: string
    petName: string
    petBreed: string
    petImage: string
    orderTime: string
    total: number
    status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
    paid: boolean
    paymentMethod: string
    createdAt: string
    userNote?: string
    petNote?: string
}

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
}

const statusLabels = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    IN_PROGRESS: "Đang thực hiện",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
}

const statusIcons = {
    PENDING: Clock,
    CONFIRMED: CheckCircle,
    IN_PROGRESS: Clock,
    COMPLETED: CheckCircle,
    CANCELLED: XCircle,
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

export default function OrderManagement() {
    const [orders, setOrders] = useState<ServiceOrder[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterPayment, setFilterPayment] = useState("all")
    const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
    const [loading, setLoading] = useState(true)
    const [previewImage, setPreviewImage] = useState<{ url: string; petName: string } | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [searchTerm, filterStatus, filterPayment])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (searchTerm) params.append("search", searchTerm)
            if (filterStatus !== "all") params.append("status", filterStatus)
            if (filterPayment !== "all") params.append("paid", filterPayment === "paid" ? "true" : "false")

            const response = await fetch(`/api/service-orders?${params.toString()}`)
            if (!response.ok) throw new Error("Failed to fetch orders")
            const data = await response.json()
            setOrders(data)
        } catch (error) {
            console.error("Error fetching orders:", error)
            toast.error("Failed to fetch orders")
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId: string, newStatus: ServiceOrder["status"]) => {
        try {
            const response = await fetch("/api/service-orders", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: orderId,
                    status: newStatus,
                }),
            })

            if (!response.ok) throw new Error("Failed to update order status")

            await fetchOrders()
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus })
            }
            toast.success("Cập nhật trạng thái đơn hàng thành công")
        } catch (error) {
            console.error("Error updating order status:", error)
            toast.error("Failed to update order status")
        }
    }

    const togglePaymentStatus = async (orderId: string) => {
        try {
            const order = orders.find((o) => o.id === orderId)
            if (!order) throw new Error("Order not found")

            const response = await fetch("/api/service-orders", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: orderId,
                    paid: !order.paid,
                }),
            })

            if (!response.ok) throw new Error("Failed to update payment status")

            await fetchOrders()
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, paid: !order.paid })
            }
            toast.success("Cập nhật trạng thái thanh toán thành công")
        } catch (error) {
            console.error("Error updating payment status:", error)
            toast.error("Failed to update payment status")
        }
    }

    const deleteOrder = async (orderId: string) => {
        try {
            const response = await fetch(`/api/service-orders?id=${orderId}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Failed to delete order")

            await fetchOrders()
            toast.success("Xóa đơn hàng thành công")
        } catch (error) {
            console.error("Error deleting order:", error)
            toast.error("Failed to delete order")
        }
    }

    const openImagePreview = (url: string, petName: string) => {
        if (!url) {
            toast.error("Không có ảnh thú cưng")
            return
        }
        setPreviewImage({ url, petName })
    }

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.petName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === "all" || order.status === filterStatus
        const matchesPayment =
            filterPayment === "all" || (filterPayment === "paid" && order.paid) || (filterPayment === "unpaid" && !order.paid)

        return matchesSearch && matchesStatus && matchesPayment
    })

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
                    <p className="text-gray-600">Quản lý các đơn đặt dịch vụ từ khách hàng</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                        Tổng: <span className="font-medium">{filteredOrders.length}</span> đơn hàng
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Tìm kiếm theo mã đơn, tên khách hàng, dịch vụ, tên thú cưng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-[200px]">
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
                        <Select value={filterPayment} onValueChange={setFilterPayment}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Thanh toán" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="paid">Đã thanh toán</SelectItem>
                                <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách đơn hàng ({filteredOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã đơn</TableHead>
                                <TableHead>Khách hàng & Thú cưng</TableHead>
                                <TableHead>Dịch vụ</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>Tổng tiền</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Thanh toán</TableHead>
                                <TableHead>Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {filteredOrders.map((order) => (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group hover:bg-gray-50"
                                    >
                                        <TableCell>
                                            <div className="font-medium">{order.orderCode}</div>
                                            <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`relative h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 ${order.petImage ? "cursor-pointer hover:opacity-80" : ""
                                                        }`}
                                                    onClick={() => order.petImage && openImagePreview(order.petImage, order.petName)}
                                                    title={order.petImage ? "Xem ảnh thú cưng" : "Không có ảnh"}
                                                >
                                                    <Avatar className="h-full w-full">
                                                        <AvatarImage src={order.petImage || "/placeholder.svg"} alt={order.petName} />
                                                        <AvatarFallback>
                                                            <Heart className="h-4 w-4" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {order.petImage && (
                                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                            <ZoomIn className="h-4 w-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{order.userName}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {order.petName} ({order.petBreed})
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{order.service.name}</div>
                                            <div className="text-xs text-gray-500">{order.service.supplier.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span className="text-sm">{new Date(order.orderTime).toLocaleString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                {order.total.toLocaleString()}đ
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[order.status]} variant="outline">
                                                {React.createElement(statusIcons[order.status], { className: "h-3 w-3 mr-1" })}
                                                {statusLabels[order.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={order.paid ? "default" : "outline"}>
                                                {order.paid ? "Đã thanh toán" : "Chưa thanh toán"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Xem chi tiết
                                                    </DropdownMenuItem>
                                                    {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                                                        <>
                                                            {order.status === "PENDING" && (
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "CONFIRMED")}>
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Xác nhận đơn
                                                                </DropdownMenuItem>
                                                            )}
                                                            {order.status === "CONFIRMED" && (
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "IN_PROGRESS")}>
                                                                    <Clock className="h-4 w-4 mr-2" />
                                                                    Bắt đầu thực hiện
                                                                </DropdownMenuItem>
                                                            )}
                                                            {order.status === "IN_PROGRESS" && (
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "COMPLETED")}>
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Hoàn thành
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "CANCELLED")}>
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Hủy đơn
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuItem onClick={() => togglePaymentStatus(order.id)}>
                                                        {order.paid ? "Đánh dấu chưa thanh toán" : "Đánh dấu đã thanh toán"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Order Detail Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Chi tiết đơn hàng {selectedOrder?.orderCode}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="py-4">
                            <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <Badge className={statusColors[selectedOrder.status]} variant="outline">
                                        {React.createElement(statusIcons[selectedOrder.status], { className: "h-3 w-3 mr-1" })}
                                        {statusLabels[selectedOrder.status]}
                                    </Badge>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <Badge variant={selectedOrder.paid ? "default" : "outline"}>
                                        {selectedOrder.paid ? "Đã thanh toán" : "Chưa thanh toán"}
                                    </Badge>
                                    <p className="text-sm text-gray-500 mt-1">{selectedOrder.paymentMethod}</p>
                                </div>
                            </div>

                            <Tabs defaultValue="order-info">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="order-info" className="flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Thông tin đơn hàng
                                    </TabsTrigger>
                                    <TabsTrigger value="customer-info" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Thông tin khách hàng
                                    </TabsTrigger>
                                    <TabsTrigger value="pet-info" className="flex items-center gap-2">
                                        <Heart className="h-4 w-4" />
                                        Thông tin thú cưng
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="order-info" className="mt-6 space-y-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-gray-700">Dịch vụ</h3>
                                                    <p className="text-lg">{selectedOrder.service.name}</p>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-gray-700">Nhà cung cấp</h3>
                                                    <p className="text-lg">{selectedOrder.service.supplier.name}</p>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-gray-700">Thời gian đặt lịch</h3>
                                                    <p className="text-lg">{new Date(selectedOrder.orderTime).toLocaleString("vi-VN")}</p>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-gray-700">Tổng tiền</h3>
                                                    <p className="font-bold text-2xl text-emerald-600">{selectedOrder.total.toLocaleString()}đ</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="flex gap-4 flex-wrap">
                                        {selectedOrder.status !== "COMPLETED" && selectedOrder.status !== "CANCELLED" && (
                                            <>
                                                {selectedOrder.status === "PENDING" && (
                                                    <Button onClick={() => updateOrderStatus(selectedOrder.id, "CONFIRMED")}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Xác nhận đơn
                                                    </Button>
                                                )}
                                                {selectedOrder.status === "CONFIRMED" && (
                                                    <Button onClick={() => updateOrderStatus(selectedOrder.id, "IN_PROGRESS")}>
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        Bắt đầu thực hiện
                                                    </Button>
                                                )}
                                                {selectedOrder.status === "IN_PROGRESS" && (
                                                    <Button onClick={() => updateOrderStatus(selectedOrder.id, "COMPLETED")}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Hoàn thành
                                                    </Button>
                                                )}
                                                <Button variant="destructive" onClick={() => updateOrderStatus(selectedOrder.id, "CANCELLED")}>
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Hủy đơn
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            variant={selectedOrder.paid ? "outline" : "default"}
                                            onClick={() => togglePaymentStatus(selectedOrder.id)}
                                        >
                                            {selectedOrder.paid ? "Đánh dấu chưa thanh toán" : "Đánh dấu đã thanh toán"}
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="customer-info" className="mt-6">
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-gray-700">Tên khách hàng</h3>
                                                    <p className="text-lg">{selectedOrder.userName}</p>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-gray-700">Số điện thoại</h3>
                                                    <p className="text-lg">
                                                        <a href={`tel:${selectedOrder.userPhone}`} className="text-blue-600 hover:underline">
                                                            {selectedOrder.userPhone}
                                                        </a>
                                                    </p>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-gray-700">Email</h3>
                                                    <p className="text-lg">
                                                        <a href={`mailto:${selectedOrder.userEmail}`} className="text-blue-600 hover:underline">
                                                            {selectedOrder.userEmail}
                                                        </a>
                                                    </p>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-gray-700">Địa chỉ</h3>
                                                    <p className="text-lg">{selectedOrder.userAddress}</p>
                                                </div>
                                                {selectedOrder.userNote && (
                                                    <div className="col-span-2">
                                                        <h3 className="font-semibold mb-2 text-gray-700">Ghi chú từ khách hàng</h3>
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <p className="text-gray-700">{selectedOrder.userNote}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="pet-info" className="mt-6">
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="flex gap-6">
                                                {/* Pet Image */}
                                                <div className="flex-shrink-0">
                                                    <div
                                                        className={`w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 ${selectedOrder.petImage ? "cursor-pointer hover:opacity-90" : ""
                                                            }`}
                                                        onClick={() =>
                                                            selectedOrder.petImage && openImagePreview(selectedOrder.petImage, selectedOrder.petName)
                                                        }
                                                    >
                                                        {selectedOrder.petImage ? (
                                                            <div className="relative w-full h-full">
                                                                <Image
                                                                    src={selectedOrder.petImage || "/placeholder.svg"}
                                                                    alt={selectedOrder.petName}
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
                                                        {selectedOrder.petImage ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-xs text-blue-600"
                                                                onClick={() => openImagePreview(selectedOrder.petImage, selectedOrder.petName)}
                                                            >
                                                                <ZoomIn className="h-3 w-3 mr-1" />
                                                                Xem ảnh
                                                            </Button>
                                                        ) : (
                                                            <p className="text-xs text-gray-500">Chưa có ảnh</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Pet Information */}
                                                <div className="flex-1 grid grid-cols-2 gap-6">
                                                    <div>
                                                        <h3 className="font-semibold mb-2 text-gray-700">Tên thú cưng</h3>
                                                        <p className="text-lg font-medium text-blue-600">{selectedOrder.petName}</p>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold mb-2 text-gray-700">Giống loài</h3>
                                                        <p className="text-lg">{selectedOrder.petBreed}</p>
                                                    </div>
                                                    {selectedOrder.petNote && (
                                                        <div className="col-span-2">
                                                            <h3 className="font-semibold mb-2 text-gray-700">Ghi chú về thú cưng</h3>
                                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                                <p className="text-gray-700">{selectedOrder.petNote}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Image Preview Modal */}
            {previewImage && (
                <ImagePreview
                    imageUrl={previewImage.url}
                    petName={previewImage.petName}
                    isOpen={!!previewImage}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </motion.div>
    )
}
