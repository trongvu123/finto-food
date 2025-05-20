"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { monthlySales } from "@/lib/api"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  growthRate: number
  revenueChange: number
  ordersChange: number
  growthChange: number
  revenueMessage: string
  revenueSubMessage: string
  ordersMessage: string
  ordersSubMessage: string
  growthMessage: string
  growthSubMessage: string
}

interface ChartItem {
  month: number
  totalOrders: number
  totalRevenue: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    growthRate: 0,
    revenueChange: 0,
    ordersChange: 0,
    growthChange: 0,
    revenueMessage: "",
    revenueSubMessage: "",
    ordersMessage: "",
    ordersSubMessage: "",
    growthMessage: "",
    growthSubMessage: "",
  })

  const [chartData, setChartData] = useState<ChartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("12months")

  // Lấy dữ liệu từ API và tính toán các chỉ số
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await monthlySales()
        setChartData(data)

        // Lấy tháng hiện tại (0-11)
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1 // Chuyển sang 1-12

        // Tìm dữ liệu của tháng hiện tại và tháng trước
        const currentMonthData = data.find((item : ChartItem) => item.month === currentMonth) || { totalOrders: 0, totalRevenue: 0 }
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
        const previousMonthData = data.find((item : ChartItem) => item.month === previousMonth) || {
          totalOrders: 0,
          totalRevenue: 0,
        }

        // Tính tổng doanh thu và đơn hàng
        const totalRevenue = data.reduce((sum : number, item : ChartItem) => sum + item.totalRevenue, 0)
        const totalOrders = data.reduce((sum : number, item : ChartItem) => sum + item.totalOrders, 0)

        // Tính tổng doanh thu và đơn hàng 6 tháng gần nhất
        const last6Months: number[] = []
        for (let i = 0; i < 6; i++) {
          let month = currentMonth - i
          if (month <= 0) month += 12
          last6Months.push(month)
        }

        const last6MonthsData = data.filter((item : ChartItem) => last6Months.includes(item.month))
        const last6MonthsRevenue = last6MonthsData.reduce((sum : number, item : ChartItem) => sum + item.totalRevenue, 0)
        const last6MonthsOrders = last6MonthsData.reduce((sum : number, item : ChartItem) => sum + item.totalOrders, 0)

        // Tính % thay đổi doanh thu so với tháng trước
        let revenueChange = 0
        if (previousMonthData.totalRevenue > 0) {
          revenueChange =
            ((currentMonthData.totalRevenue - previousMonthData.totalRevenue) / previousMonthData.totalRevenue) * 100
        } else if (currentMonthData.totalRevenue > 0) {
          revenueChange = 100 // Nếu tháng trước = 0 và tháng này > 0, tăng 100%
        }

        // Tính % thay đổi đơn hàng so với tháng trước
        let ordersChange = 0
        if (previousMonthData.totalOrders > 0) {
          ordersChange =
            ((currentMonthData.totalOrders - previousMonthData.totalOrders) / previousMonthData.totalOrders) * 100
        } else if (currentMonthData.totalOrders > 0) {
          ordersChange = 100 // Nếu tháng trước = 0 và tháng này > 0, tăng 100%
        }

        // Tính tỷ lệ tăng trưởng (so sánh 3 tháng gần đây với 3 tháng trước đó)
        const last3Months: number[] = []
        const previous3Months: number[] = []

        for (let i = 0; i < 3; i++) {
          let month = currentMonth - i
          if (month <= 0) month += 12
          last3Months.push(month)
        }

        for (let i = 3; i < 6; i++) {
          let month = currentMonth - i
          if (month <= 0) month += 12
          previous3Months.push(month)
        }

        const last3MonthsData = data.filter((item : ChartItem) => last3Months.includes(item.month))
        const previous3MonthsData = data.filter((item : ChartItem) => previous3Months.includes(item.month))

        const last3MonthsRevenue = last3MonthsData.reduce((sum : number, item : ChartItem) => sum + item.totalRevenue, 0)
        const previous3MonthsRevenue = previous3MonthsData.reduce((sum : number, item : ChartItem) => sum + item.totalRevenue, 0)

        let growthRate = 0
        let growthChange = 0

        if (previous3MonthsRevenue > 0) {
          growthRate = ((last3MonthsRevenue - previous3MonthsRevenue) / previous3MonthsRevenue) * 100
          growthChange = growthRate
        } else if (last3MonthsRevenue > 0) {
          growthRate = 100
          growthChange = 100
        }

        // Tạo thông báo dựa trên dữ liệu
        let revenueMessage = "Không có thay đổi"
        let revenueSubMessage = "Không có dữ liệu trong 6 tháng qua"

        if (revenueChange > 0) {
          revenueMessage = "Tăng trưởng trong tháng này"
          revenueSubMessage = `Doanh thu ${last6MonthsRevenue > 0 ? "tích cực" : "bắt đầu phát sinh"} trong 6 tháng qua`
        } else if (revenueChange < 0) {
          revenueMessage = "Giảm trong tháng này"
          revenueSubMessage = "Cần xem xét chiến lược bán hàng"
        }

        let ordersMessage = "Không có thay đổi"
        let ordersSubMessage = "Không có đơn hàng mới"

        if (ordersChange > 0) {
          ordersMessage = "Tăng trưởng trong kỳ này"
          ordersSubMessage = "Chiến lược thu hút khách hàng hiệu quả"
        } else if (ordersChange < 0) {
          ordersMessage = `Giảm ${Math.abs(ordersChange).toFixed(1)}% trong kỳ này`
          ordersSubMessage = "Cần chú ý đến khách hàng mới"
        }

        let growthMessage = "Hiệu suất ổn định"
        let growthSubMessage = "Duy trì đà tăng trưởng"

        if (growthRate > 10) {
          growthMessage = "Tăng trưởng mạnh"
          growthSubMessage = "Vượt dự báo tăng trưởng"
        } else if (growthRate < 0) {
          growthMessage = "Tăng trưởng chậm lại"
          growthSubMessage = "Cần điều chỉnh chiến lược"
        }

        // Cập nhật state với các giá trị đã tính
        setStats({
          totalRevenue,
          totalOrders,
          growthRate: Number.parseFloat(growthRate.toFixed(1)),
          revenueChange: Number.parseFloat(revenueChange.toFixed(1)),
          ordersChange: Number.parseFloat(ordersChange.toFixed(1)),
          growthChange: Number.parseFloat(growthChange.toFixed(1)),
          revenueMessage,
          revenueSubMessage,
          ordersMessage,
          ordersSubMessage,
          growthMessage,
          growthSubMessage,
        })
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error)
      } finally {
        setTimeout(() => setLoading(false), 1000)
      }
    }

    fetchData()
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  if (loading) {
    return (
      <div className="space-y-8 bg-white p-6 min-h-screen">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-5 w-32 bg-gray-200" />
                <Skeleton className="h-8 w-24 mt-2 bg-gray-200" />
                <Skeleton className="h-4 w-32 mt-2 bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-48 bg-gray-200" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 bg-gray-200" />
                <Skeleton className="h-8 w-24 bg-gray-200" />
                <Skeleton className="h-8 w-24 bg-gray-200" />
              </div>
            </div>
            <Skeleton className="h-[350px] w-full bg-gray-200" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div className="space-y-8 bg-white p-6 min-h-screen" initial="hidden" animate="show" variants={container}>
      <motion.div className="grid gap-4 md:grid-cols-3" variants={container}>
        <motion.div variants={item}>
          <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-500">Tổng doanh thu</p>
                <div
                  className={`flex items-center text-xs px-2 py-1 rounded-full ${stats.revenueChange > 0 ? "bg-green-100 text-green-700" : stats.revenueChange < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                >
                  {stats.revenueChange > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : stats.revenueChange < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : null}
                  {stats.revenueChange > 0 ? "+" : ""}
                  {stats.revenueChange}%
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(stats.totalRevenue)}
              </h2>
              <div className="mt-2 text-sm text-gray-600 flex items-center">
                {stats.revenueChange > 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                ) : stats.revenueChange < 0 ? (
                  <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
                ) : null}
                {stats.revenueMessage}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.revenueSubMessage}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-500">Tổng đơn hàng</p>
                <div
                  className={`flex items-center text-xs px-2 py-1 rounded-full ${stats.ordersChange > 0 ? "bg-green-100 text-green-700" : stats.ordersChange < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                >
                  {stats.ordersChange > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : stats.ordersChange < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : null}
                  {stats.ordersChange > 0 ? "+" : ""}
                  {stats.ordersChange}%
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{stats.totalOrders.toLocaleString("vi-VN")}</h2>
              <div className="mt-2 text-sm text-gray-600 flex items-center">
                {stats.ordersChange > 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                ) : stats.ordersChange < 0 ? (
                  <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
                ) : null}
                {stats.ordersMessage}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.ordersSubMessage}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-500">Tỷ lệ tăng trưởng</p>
                <div
                  className={`flex items-center text-xs px-2 py-1 rounded-full ${stats.growthChange > 0 ? "bg-green-100 text-green-700" : stats.growthChange < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                >
                  {stats.growthChange > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : stats.growthChange < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : null}
                  {stats.growthChange > 0 ? "+" : ""}
                  {stats.growthChange}%
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{stats.growthRate}%</h2>
              <div className="mt-2 text-sm text-gray-600 flex items-center">
                {stats.growthChange > 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                ) : stats.growthChange < 0 ? (
                  <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
                ) : null}
                {stats.growthMessage}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.growthSubMessage}</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Biểu đồ doanh thu và đơn hàng</h3>
                <p className="text-sm text-gray-500">Dữ liệu theo tháng trong năm 2024</p>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button
                  variant={timeFilter === "12months" ? "default" : "outline"}
                  onClick={() => setTimeFilter("12months")}
                  className={timeFilter !== "12months" ? "border-gray-200 bg-white hover:bg-gray-50 text-gray-700" : ""}
                >
                  12 tháng
                </Button>
                <Button
                  variant={timeFilter === "6months" ? "default" : "outline"}
                  onClick={() => setTimeFilter("6months")}
                  className={timeFilter !== "6months" ? "border-gray-200 bg-white hover:bg-gray-50 text-gray-700" : ""}
                >
                  6 tháng
                </Button>
                <Button
                  variant={timeFilter === "3months" ? "default" : "outline"}
                  onClick={() => setTimeFilter("3months")}
                  className={timeFilter !== "3months" ? "border-gray-200 bg-white hover:bg-gray-50 text-gray-700" : ""}
                >
                  3 tháng
                </Button>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]
                      return monthNames[value - 1]
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#e5e7eb",
                      color: "#111827",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                    formatter={(value, name) => {
                      if (name === "totalRevenue") {
                        return [
                          new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                            value as number,
                          ),
                          "Doanh thu",
                        ]
                      }
                      return [value, name === "totalOrders" ? "Đơn hàng" : name]
                    }}
                    labelFormatter={(value) => {
                      const monthNames = [
                        "Tháng 1",
                        "Tháng 2",
                        "Tháng 3",
                        "Tháng 4",
                        "Tháng 5",
                        "Tháng 6",
                        "Tháng 7",
                        "Tháng 8",
                        "Tháng 9",
                        "Tháng 10",
                        "Tháng 11",
                        "Tháng 12",
                      ]
                      return monthNames[value - 1]
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalOrders"
                    name="Đơn hàng"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                    animationDuration={1500}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalRevenue"
                    name="Doanh thu"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
