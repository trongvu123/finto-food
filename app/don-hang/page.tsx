"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { OrderStatus } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Order {
    id: string
    status: OrderStatus
    total: number
    createdAt: string
    shippingAddress: string
    shippingProvince: string
    shippingDistrict: string
    shippingWard: string
    phone: string
    items: {
        quantity: number
        price: number
        product: {
            name: string
            images: string[]
        }
    }[]
}

// Map trạng thái đơn hàng sang tiếng Việt
const statusMap = {
    PENDING: "Chờ xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy"
}

export default function UserOrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/orders/user")
            if (!response.ok) {
                throw new Error("Failed to fetch orders")
            }
            const data = await response.json()
            setOrders(data)
        } catch (error) {
            setError("Failed to load orders")
            toast.error("Failed to load orders")
        } finally {
            setLoading(false)
        }
    }

    const handleCancelOrder = async (order: Order) => {
        try {
            const response = await fetch(`/api/orders/${order.id}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to cancel order')
            }

            // Update local state
            setOrders(orders.map(o =>
                o.id === order.id
                    ? { ...o, status: 'CANCELLED' as OrderStatus }
                    : o
            ))

            toast.success('Đã hủy đơn hàng thành công')
            setOrderToCancel(null)
        } catch (error) {
            toast.error('Không thể hủy đơn hàng')
        }
    }

    const canCancelOrder = (status: OrderStatus) => {
        return ['PENDING', 'PROCESSING'].includes(status)
    }

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-8">Đơn hàng của tôi</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã đơn hàng</TableHead>
                            <TableHead>Ngày đặt</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow
                                key={order.id}
                                className={order.status === 'CANCELLED' ? 'opacity-50' : ''}
                            >
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>
                                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                </TableCell>
                                <TableCell>{formatCurrency(order.total)}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            order.status === "DELIVERED"
                                                ? "default"
                                                : order.status === "CANCELLED"
                                                    ? "destructive"
                                                    : "secondary"
                                        }
                                    >
                                        {statusMap[order.status]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="link" onClick={() => setSelectedOrder(order)}>
                                                Xem chi tiết
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl">
                                            <DialogHeader>
                                                <DialogTitle>Chi tiết đơn hàng #{order.id}</DialogTitle>
                                            </DialogHeader>
                                            <ScrollArea className="max-h-[80vh]">
                                                <div className="space-y-6">
                                                    {/* Địa chỉ giao hàng */}
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Địa chỉ giao hàng</h3>
                                                        <p>{order.shippingAddress}</p>
                                                        <p>{order.shippingWard}, {order.shippingDistrict}, {order.shippingProvince}</p>
                                                        <p className="mt-2">Số điện thoại: {order.phone}</p>
                                                    </div>

                                                    {/* Sản phẩm */}
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Sản phẩm</h3>
                                                        <div className="space-y-4">
                                                            {order.items.map((item, index) => (
                                                                <div key={index} className="flex items-center gap-4">
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
                                                                            Số lượng: {item.quantity}
                                                                        </p>
                                                                    </div>
                                                                    <p className="font-medium">
                                                                        {formatCurrency(item.price * item.quantity)}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Tổng tiền */}
                                                    <div className="border-t pt-4">
                                                        <div className="flex justify-between font-bold">
                                                            <span>Tổng cộng:</span>
                                                            <span>{formatCurrency(order.total)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>

                                    {canCancelOrder(order.status) && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setOrderToCancel(order)}
                                        >
                                            Hủy đơn
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!orderToCancel} onOpenChange={() => setOrderToCancel(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Không</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => orderToCancel && handleCancelOrder(orderToCancel)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Hủy đơn hàng
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
} 