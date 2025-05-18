"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { OrderStatus } from "@prisma/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  RefreshCw,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  CreditCard,
  FileText,
  ExternalLink,
  Info,
  Filter,
} from "lucide-react"

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
  paymentMethod: string
  fullName: string
  email: string
  shipCode?: string
  carrier?: string
  updatedAt?: string
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
  CANCELLED: "Đã hủy",
}

// Map biểu tượng cho trạng thái
const statusIcons = {
  PENDING: <Clock className="h-4 w-4" />,
  PROCESSING: <Package className="h-4 w-4" />,
  SHIPPED: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle2 className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
}

// Map màu sắc cho trạng thái
const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  DELIVERED: "bg-green-100 text-green-800 hover:bg-green-200",
  CANCELLED: "bg-red-100 text-red-800 hover:bg-red-200",
}

export default function UserOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Tính toán tổng số trang
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  // Lấy các đơn hàng cho trang hiện tại
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Hàm lọc đơn hàng
  const filterOrders = useCallback(() => {
    let result = [...orders]

    // Lọc theo trạng thái
    if (statusFilter !== "ALL") {
      result = result.filter((order) => order.status === statusFilter)
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (order) => order.id.toLowerCase().includes(query) || order.fullName.toLowerCase().includes(query),
      )
    }

    setFilteredOrders(result)
    // Reset về trang đầu tiên khi thay đổi bộ lọc
    setCurrentPage(1)
  }, [orders, statusFilter, searchQuery])

  // Cập nhật bộ lọc khi thay đổi orders, statusFilter, hoặc searchQuery
  useEffect(() => {
    filterOrders()
  }, [orders, statusFilter, searchQuery, filterOrders])

  // Fetch đơn hàng từ API
  const fetchOrders = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/orders/user")
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }
      const data = await response.json()
      setOrders(data)
      setError(null)
    } catch (error) {
      setError("Không thể tải danh sách đơn hàng")
      toast.error("Không thể tải danh sách đơn hàng")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch đơn hàng khi component mount
  useEffect(() => {
    fetchOrders()
  }, [])

  // Hàm hủy đơn hàng
  const handleCancelOrder = async (order: Order) => {
    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to cancel order")
      }

      // Cập nhật state
      setOrders(orders.map((o) => (o.id === order.id ? { ...o, status: "CANCELLED" as OrderStatus } : o)))

      toast.success("Đã hủy đơn hàng thành công")
      setOrderToCancel(null)
    } catch (error) {
      toast.error("Không thể hủy đơn hàng")
    }
  }

  // Kiểm tra xem đơn hàng có thể hủy không
  const canCancelOrder = (status: OrderStatus) => {
    return ["PENDING", "PROCESSING"].includes(status)
  }

  // Hiển thị skeleton loading khi đang tải
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Đã xảy ra lỗi</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={fetchOrders}>Thử lại</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Đơn hàng của tôi</h1>
            <p className="text-gray-500 mt-1">Quản lý và theo dõi đơn hàng của bạn</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm đơn hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-[250px]"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: OrderStatus | "ALL") => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Tất cả trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                {Object.entries(statusMap).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {statusIcons[value as OrderStatus]}
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={fetchOrders} disabled={isRefreshing} className="shrink-0">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center">
                <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Không tìm thấy đơn hàng</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || statusFilter !== "ALL"
                    ? "Không tìm thấy đơn hàng phù hợp với bộ lọc của bạn."
                    : "Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!"}
                </p>
                {searchQuery || statusFilter !== "ALL" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setStatusFilter("ALL")
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                ) : (
                  <Button onClick={() => router.push("/san-pham")}>Mua sắm ngay</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách đơn hàng</CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
                    trên {filteredOrders.length} đơn hàng
                  </p>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border mt-4 overflow-hidden">
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
                    <AnimatePresence mode="wait">
                      {currentOrders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`${order.status === "CANCELLED" ? "bg-gray-50" : ""}`}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {statusIcons[order.status]}
                              <span>{order.id.substring(0, 8)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatDate(new Date(order.createdAt))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatCurrency(order.total)}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status]}>{statusMap[order.status]}</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                  className="h-8"
                                >
                                  Chi tiết
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Chi tiết đơn hàng #{order.id}
                                  </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-[80vh]">
                                  <Tabs defaultValue="info" className="w-full">
                                    <TabsList className="grid grid-cols-3 mb-4">
                                      <TabsTrigger value="info">Thông tin đơn hàng</TabsTrigger>
                                      <TabsTrigger value="products">Sản phẩm</TabsTrigger>
                                      <TabsTrigger value="shipping">Vận chuyển</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="info" className="space-y-6">
                                      {/* Thông tin khách hàng */}
                                      <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                          <User className="h-4 w-4" />
                                          Thông tin khách hàng
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="flex items-start gap-2">
                                            <User className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-500">Họ tên</p>
                                              <p className="font-medium">{order.fullName}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-2">
                                            <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-500">Email</p>
                                              <p className="font-medium">{order.email || "Không có"}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-2">
                                            <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-500">Số điện thoại</p>
                                              <p className="font-medium">{order.phone}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                                              <p className="font-medium">{formatDate(new Date(order.createdAt))}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Thông tin thanh toán */}
                                      <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                          <CreditCard className="h-4 w-4" />
                                          Thông tin thanh toán
                                        </h3>
                                        <div className="space-y-3">
                                          <div className="flex items-start gap-2">
                                            <CreditCard className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                                              <p className="font-medium">{order.paymentMethod}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-2">
                                            <Info className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-500">Trạng thái đơn hàng</p>
                                              <Badge className={`mt-1 ${statusColors[order.status]}`}>
                                                {statusMap[order.status]}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="products" className="space-y-6">
                                      {/* Sản phẩm */}
                                      <div className="space-y-4">
                                        {order.items.map((item, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center gap-4 border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                                          >
                                            <div className="w-16 h-16 relative rounded-md overflow-hidden">
                                              <Image
                                                src={item.product.images[0] || "/placeholder.svg"}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                              />
                                            </div>
                                            <div className="flex-1">
                                              <p className="font-medium">{item.product.name}</p>
                                              <p className="text-sm text-gray-500">
                                                Số lượng: {item.quantity} x {formatCurrency(item.price)}
                                              </p>
                                            </div>
                                            <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Tổng tiền */}
                                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Tạm tính:</span>
                                          <span>{formatCurrency(order.total)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Phí vận chuyển:</span>
                                          <span>
                                            {
                                              order.total > 500000 ?
                                                `Miễn phí`
                                                :
                                                formatCurrency(30000)
                                            }
                                          </span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                          <span>Tổng cộng:</span>
                                          <span className="text-primary">{formatCurrency(order.total + 30000)}</span>
                                        </div>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="shipping" className="space-y-6">
                                      {/* Địa chỉ giao hàng */}
                                      <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                          <MapPin className="h-4 w-4" />
                                          Địa chỉ giao hàng
                                        </h3>
                                        <div className="space-y-2">
                                          <p className="font-medium">{order.fullName}</p>
                                          <p>{order.shippingAddress}</p>
                                          <p>
                                            {order.shippingWard}, {order.shippingDistrict}, {order.shippingProvince}
                                          </p>
                                          <p>Số điện thoại: {order.phone}</p>
                                        </div>
                                      </div>

                                      {/* Thông tin vận chuyển */}
                                      <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                          <Truck className="h-4 w-4" />
                                          Thông tin vận chuyển
                                        </h3>

                                        {order.status === "SHIPPED" && (
                                          <>
                                            {order.shipCode && order.carrier ? (
                                              <div className="space-y-3">
                                                <div className="flex items-start gap-2">
                                                  <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                                                  <div>
                                                    <p className="text-sm text-gray-500">Mã vận đơn</p>
                                                    <p className="font-medium">{order.shipCode}</p>
                                                  </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                  <Truck className="h-4 w-4 text-gray-400 mt-0.5" />
                                                  <div>
                                                    <p className="text-sm text-gray-500">Đơn vị vận chuyển</p>
                                                    <p className="font-medium">{order.carrier}</p>
                                                  </div>
                                                </div>
                                                <div className="mt-4">
                                                  <Button variant="outline" className="w-full">
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Theo dõi đơn hàng
                                                  </Button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="text-center py-4">
                                                <p className="text-gray-500">
                                                  Đơn hàng đang được vận chuyển. Thông tin vận chuyển sẽ được cập nhật
                                                  sớm.
                                                </p>
                                              </div>
                                            )}
                                          </>
                                        )}

                                        {order.status !== "SHIPPED" && (
                                          <div className="text-center py-4">
                                            <p className="text-gray-500">
                                              {order.status === "PENDING" || order.status === "PROCESSING"
                                                ? "Đơn hàng đang được xử lý. Thông tin vận chuyển sẽ được cập nhật khi đơn hàng được giao cho đơn vị vận chuyển."
                                                : order.status === "DELIVERED"
                                                  ? "Đơn hàng đã được giao thành công."
                                                  : "Đơn hàng đã bị hủy."}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </TabsContent>
                                  </Tabs>
                                </ScrollArea>

                                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                  <div className="flex items-center gap-2">
                                    <Badge className={statusColors[order.status]}>{statusMap[order.status]}</Badge>
                                    <span className="text-sm text-gray-500">
                                      Cập nhật: {formatDate(order.updatedAt ? new Date(order.updatedAt) : new Date(order.createdAt))}
                                    </span>
                                  </div>

                                  {canCancelOrder(order.status) && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        setOrderToCancel(order)
                                        setSelectedOrder(null)
                                      }}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Hủy đơn hàng
                                    </Button>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {canCancelOrder(order.status) && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setOrderToCancel(order)}
                                className="h-8"
                              >
                                Hủy
                              </Button>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>

            {/* Phân trang */}
            {totalPages > 1 && (
              <CardFooter className="flex justify-between items-center border-t pt-6">
                <div className="text-sm text-gray-500">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <ChevronLeft className="h-4 w-4 -ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Hiển thị 5 trang xung quanh trang hiện tại
                      let pageToShow
                      if (totalPages <= 5) {
                        pageToShow = i + 1
                      } else if (currentPage <= 3) {
                        pageToShow = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageToShow = totalPages - 4 + i
                      } else {
                        pageToShow = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={i}
                          variant={currentPage === pageToShow ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(pageToShow)}
                          className="h-8 w-8"
                        >
                          {pageToShow}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 -ml-2" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        )}
      </motion.div>

      {/* Dialog xác nhận hủy đơn hàng */}
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
