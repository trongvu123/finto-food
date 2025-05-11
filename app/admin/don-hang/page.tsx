"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { OrderStatus } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Order {
  id: string
  status: OrderStatus
  total: number
  createdAt: string
  userId: string
  phone: string
  fullName: string
  email: string
  shippingAddress: string
  shippingProvince: string
  shippingDistrict: string
  shippingWard: string
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

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL")
  const [search, setSearch] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [page, status, search])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(status && { status }),
        ...(search && { search })
      })

      const response = await fetch(`/api/admin/orders?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()
      setOrders(data.orders)
      setTotalPages(data.totalPages)
    } catch (error) {
      setError("Failed to load orders")
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      toast.success("Order status updated")
      fetchOrders()
    } catch (error) {
      toast.error("Failed to update order status")
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={status} onValueChange={(value: OrderStatus | "ALL") => setStatus(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {Object.entries(statusMap).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" onClick={() => setSelectedOrder(order)}>
                        {order.id}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Chi tiết đơn hàng #{order.id}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[80vh]">
                        <div className="space-y-6">
                          {/* Thông tin khách hàng */}
                          <div>
                            <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Họ tên</p>
                                <p>{order.fullName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p>{order.email}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Số điện thoại</p>
                                <p>{order.phone}</p>
                              </div>
                            </div>
                          </div>

                          {/* Địa chỉ giao hàng */}
                          <div>
                            <h3 className="font-semibold mb-2">Địa chỉ giao hàng</h3>
                            <p>{order.shippingAddress}</p>
                            <p>{order.shippingWard}, {order.shippingDistrict}, {order.shippingProvince}</p>
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
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.fullName}</p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                  </div>
                </TableCell>
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
                <TableCell className="text-right">
                  <Select
                    value={order.status}
                    onValueChange={(value: OrderStatus) => handleUpdateStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusMap).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center gap-2 mt-8">
        <Button
          variant="outline"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
