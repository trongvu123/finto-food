"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderStatus } from "@prisma/client"

// Map trạng thái đơn hàng sang tiếng Việt
const statusMap = {
    PENDING: "Chờ xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy"
}

// Format giá tiền sang VND
function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount)
}

interface OrderModalProps {
    isOpen: boolean
    onClose: () => void
    order: any
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void
}

export default function OrderModal({ isOpen, onClose, order, onUpdateStatus }: OrderModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Chi tiết đơn hàng #{order.id}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Thông tin khách hàng */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Thông tin khách hàng</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Họ tên</p>
                                <p className="font-medium">{order.user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{order.user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Số điện thoại</p>
                                <p className="font-medium">{order.user.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Địa chỉ</p>
                                <p className="font-medium">
                                    {order.shippingAddress}, {order.shippingWard}, {order.shippingDistrict}, {order.shippingProvince}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Sản phẩm</h3>
                        <div className="space-y-4">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="w-16 h-16 relative">
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            className="object-cover rounded-md"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{item.product.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatCurrency(item.price)} x {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {formatCurrency(item.price * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tổng tiền và trạng thái */}
                    <div className="flex items-center justify-between border-t pt-4">
                        <div>
                            <p className="text-sm text-gray-500">Trạng thái đơn hàng</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge
                                    variant={
                                        order.status === "DELIVERED"
                                            ? "default"
                                            : order.status === "CANCELLED"
                                                ? "destructive"
                                                : "secondary"
                                    }
                                >
                                    {statusMap[order.status as keyof typeof statusMap]}
                                </Badge>
                                <Select
                                    value={order.status}
                                    onValueChange={(value: OrderStatus) => onUpdateStatus(order.id, value)}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Cập nhật trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(statusMap).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Tổng tiền</p>
                            <p className="text-xl font-bold">{formatCurrency(order.total)}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 