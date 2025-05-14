"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import type { OrderStatus } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  RefreshCw,
  Eye,
  FileText,
  Loader2,
} from "lucide-react"

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
  paymentMethod: string
  shipCode?: string
  carrier?: string,
  paid: boolean,
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

// Map trạng thái đơn hàng sang màu sắc và biểu tượng
const statusConfig = {
  PENDING: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <Clock className="h-4 w-4" />,
  },
  PROCESSING: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Package className="h-4 w-4" />,
  },
  SHIPPED: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <Truck className="h-4 w-4" />,
  },
  DELIVERED: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  CANCELLED: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="h-4 w-4" />,
  },
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [limit, setLimit] = useState(10)
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL")
  const [search, setSearch] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isShipInfoDialogOpen, setIsShipInfoDialogOpen] = useState(false)
  const [shipInfo, setShipInfo] = useState({ shipCode: "", carrier: "" })
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [page, status, search, limit])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status !== "ALL" && { status }),
        ...(search && { search }),
      })

      const response = await fetch(`/api/admin/orders?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()
      setOrders(data.orders)
      setTotalPages(data.totalPages)
      setTotalOrders(data.total)
    } catch (error: any) {
      setError("Failed to load orders")
      console.error("Failed to fetch orders:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đơn hàng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setActiveOrderId(orderId)
    setIsUpdating(true)

    // Nếu trạng thái mới là SHIPPED và không có thông tin vận chuyển
    if (newStatus === "SHIPPED") {
      const order = orders.find((o) => o.id === orderId)
      if (!order?.shipCode || !order?.carrier) {
        setShipInfo({ shipCode: order?.shipCode || "", carrier: order?.carrier || "" })
        setIsShipInfoDialogOpen(true)
        setIsUpdating(false)
        return
      }
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái đơn hàng",
      })
      fetchOrders()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái đơn hàng",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setActiveOrderId(null)
    }
  }

  const handleSubmitShipInfo = async () => {
    if (!activeOrderId) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/orders/${activeOrderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "SHIPPED",
          shipCode: shipInfo.shipCode,
          carrier: shipInfo.carrier,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update shipping information")
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin vận chuyển",
      })
      setIsShipInfoDialogOpen(false)
      fetchOrders()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin vận chuyển",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setActiveOrderId(null)
    }
  }

  const handleRefresh = () => {
    fetchOrders()
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset về trang đầu tiên khi tìm kiếm
    fetchOrders()
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
  }

  const getStatusBadge = (status: OrderStatus | undefined) => {
    const safeStatus: OrderStatus = status || "PENDING";

    if (!statusConfig[safeStatus]) {
      console.error(`Invalid order status: ${safeStatus}`);
      return (
        <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1 font-medium">
          <AlertCircle className="h-4 w-4" />
          <span>{safeStatus}</span>
        </Badge>
      );
    }

    const config = statusConfig[safeStatus];

    return (
      <Badge className={`${config.color} flex items-center gap-1 font-medium`}>
        {config.icon}
        <span>{statusMap[safeStatus]}</span>
      </Badge>
    );
  }

  const renderPagination = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị <span className="font-medium">{(page - 1) * limit + 1}</span> đến{" "}
          <span className="font-medium">{Math.min(page * limit, totalOrders)}</span> trong{" "}
          <span className="font-medium">{totalOrders}</span> đơn hàng
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-2" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((number) => (
            <Button
              key={number}
              variant={page === number ? "default" : "outline"}
              size="icon"
              onClick={() => handlePageChange(number)}
            >
              {number}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  const renderSkeletonRows = () => {
    return Array(limit)
      .fill(0)
      .map((_, index) => (
        <TableRow key={index}>
          {Array(7)
            .fill(0)
            .map((_, cellIndex) => (
              <TableCell key={cellIndex}>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </TableCell>
            ))}
        </TableRow>
      ))
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi tất cả đơn hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Danh sách đơn hàng</CardTitle>
            <div className="flex flex-col gap-4 sm:flex-row">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo mã đơn hàng, tên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-full md:w-[250px]"
                />
              </form>
              <div className="flex gap-2">
                <Select
                  value={status}
                  onValueChange={(value: OrderStatus | "ALL") => {
                    setStatus(value)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Trạng thái" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                    {Object.entries(statusMap).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          {statusConfig[value as OrderStatus].icon}
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => {
                    setLimit(Number(value))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[100px]">
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  renderSkeletonRows()
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-10 w-10 text-muted-foreground" />
                        <p className="text-lg font-medium">Không tìm thấy đơn hàng nào</p>
                        <p className="text-sm text-muted-foreground">
                          Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence initial={false} mode="popLayout">
                    {orders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <TableCell className="font-medium">
                          <Button variant="link" onClick={() => handleViewOrder(order)}>
                            #{order.id.substring(0, 8)}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.fullName}</span>
                            <span className="text-sm text-muted-foreground">{order.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span>{order.paymentMethod}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status || "PENDING")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Chi tiết
                            </Button>
                            <Select
                              value={order.status}
                              onValueChange={(value: OrderStatus) => handleUpdateStatus(order.id, value)}
                              disabled={isUpdating && activeOrderId === order.id}
                            >
                              <SelectTrigger className="w-[140px] h-9">
                                {isUpdating && activeOrderId === order.id ? (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Đang cập nhật</span>
                                  </div>
                                ) : (
                                  <SelectValue placeholder="Cập nhật" />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(statusMap).map(([value, label]) => (
                                  <SelectItem key={value} value={value} disabled={value === (order.status || "PENDING")}>
                                    <div className="flex items-center gap-2">
                                      {statusConfig[value as OrderStatus].icon}
                                      <span>{label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>{!loading && orders.length > 0 && renderPagination()}</CardFooter>
      </Card>

      {/* Chi tiết đơn hàng */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Chi tiết đơn hàng #{selectedOrder?.id.substring(0, 8)}
            </DialogTitle>
            <DialogDescription>
              Đặt ngày {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 p-1">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Thông tin đơn hàng</TabsTrigger>
                  <TabsTrigger value="products">Sản phẩm</TabsTrigger>
                  <TabsTrigger value="shipping">Vận chuyển</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thông tin khách hàng */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Thông tin khách hàng
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">{selectedOrder?.fullName}</p>
                            <p className="text-sm text-muted-foreground">Khách hàng</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">{selectedOrder?.phone}</p>
                            <p className="text-sm text-muted-foreground">Số điện thoại</p>
                          </div>
                        </div>
                        {selectedOrder?.email && (
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">{selectedOrder.email}</p>
                              <p className="text-sm text-muted-foreground">Email</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Thông tin thanh toán */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Thông tin thanh toán
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">{selectedOrder?.paymentMethod} &nbsp;
                              {selectedOrder?.paymentMethod === "banking" && selectedOrder?.paid === true ?
                                <Badge variant="outline">Đã thanh toán</Badge>
                                :
                                <Badge variant="outline">Chưa thanh toán</Badge>

                              }

                            </p>
                            <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium">{getStatusBadge(selectedOrder ? selectedOrder.status : "PENDING")}</span>
                            <p className="text-sm text-muted-foreground">Trạng thái đơn hàng</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">
                              {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                            <p className="text-sm text-muted-foreground">Ngày đặt hàng</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Địa chỉ giao hàng */}
                    <Card className="md:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Địa chỉ giao hàng
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">{selectedOrder?.shippingAddress}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedOrder?.shippingWard}, {selectedOrder?.shippingDistrict},{" "}
                              {selectedOrder?.shippingProvince}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Danh sách sản phẩm</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedOrder?.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                            <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                              <Image
                                src={item.product.images[0] || "/placeholder.svg"}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Số lượng: {item.quantity} x {formatCurrency(item.price)}
                              </p>
                            </div>
                            <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tạm tính:</span>
                          <span>{formatCurrency(selectedOrder?.total || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Phí vận chuyển:</span>
                          <span>Miễn phí</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium">
                          <span>Tổng cộng:</span>
                          <span className="text-lg">{formatCurrency(selectedOrder?.total || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="shipping" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Thông tin vận chuyển
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Mã vận đơn</Label>
                          <div className="font-medium mt-1">{selectedOrder?.shipCode || "Chưa có thông tin"}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Đơn vị vận chuyển</Label>
                          <div className="font-medium mt-1">{selectedOrder?.carrier || "Chưa có thông tin"}</div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Trạng thái</Label>
                        <div className="font-medium mt-1">{getStatusBadge(selectedOrder?.status || "PENDING")}</div>
                      </div>

                      {selectedOrder?.status === "SHIPPED" && (!selectedOrder.shipCode || !selectedOrder.carrier) && (
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5" />
                          <div>
                            <p className="font-medium">Thông tin vận chuyển chưa đầy đủ</p>
                            <p>Vui lòng cập nhật mã vận đơn và đơn vị vận chuyển</p>
                          </div>
                        </div>
                      )}

                      {selectedOrder?.status === "SHIPPED" && (
                        <Button
                          onClick={() => {
                            setActiveOrderId(selectedOrder.id)
                            setShipInfo({
                              shipCode: selectedOrder.shipCode || "",
                              carrier: selectedOrder.carrier || "",
                            })
                            setIsShipInfoDialogOpen(true)
                          }}
                          className="w-full"
                        >
                          {selectedOrder.shipCode && selectedOrder.carrier
                            ? "Cập nhật thông tin vận chuyển"
                            : "Thêm thông tin vận chuyển"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog thêm thông tin vận chuyển */}
      <Dialog open={isShipInfoDialogOpen} onOpenChange={setIsShipInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thông tin vận chuyển</DialogTitle>
            <DialogDescription>Nhập thông tin vận chuyển cho đơn hàng</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shipCode">Mã vận đơn</Label>
              <Input
                id="shipCode"
                value={shipInfo.shipCode}
                onChange={(e) => setShipInfo({ ...shipInfo, shipCode: e.target.value })}
                placeholder="Nhập mã vận đơn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrier">Đơn vị vận chuyển</Label>
              <Input
                id="carrier"
                value={shipInfo.carrier}
                onChange={(e) => setShipInfo({ ...shipInfo, carrier: e.target.value })}
                placeholder="Nhập đơn vị vận chuyển"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShipInfoDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitShipInfo} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu
                </>
              ) : (
                "Lưu thông tin"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
