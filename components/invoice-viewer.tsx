"use client"

import type { Invoice } from "@/app/thanh-toan/xac-nhan/page"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { InvoicePDF } from "./invoice-pdf"
import { motion } from "framer-motion"
import { CalendarDays, CreditCard, MapPin, Phone, Mail, User } from "lucide-react"

export function InvoiceViewer({ invoice }: { invoice: Invoice }) {
  if (!invoice) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Thông tin đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày đặt hàng</p>
                  <p className="font-medium">
                    {new Date(invoice.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
                  <p className="font-medium">{invoice.paymentMethod}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Họ tên</p>
                  <p className="font-medium">{invoice.fullName}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{invoice.phone}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{invoice.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Địa chỉ giao hàng</p>
                  <p className="font-medium">
                    {invoice.shippingAddress}, {invoice.shippingWard}, {invoice.shippingDistrict},{" "}
                    {invoice.shippingProvince}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Chi tiết sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoice.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-md bg-gray-100 overflow-hidden relative">
                      {item.product.images && item.product.images[0] && (
                        <img
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.product.price)} x {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              ))}
              <Separator className="my-4" />
              <div className="flex justify-between">
                <p className="font-medium">Tổng cộng</p>
                <p className="font-bold text-lg">{formatCurrency(invoice.total)}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-medium">Cần thanh toán</p>
                <p className="font-bold text-lg text-primary">
                  {invoice.paymentMethod.toLowerCase().includes("cod")
                    ? formatCurrency(invoice.total)
                    : formatCurrency(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <InvoicePDF invoice={invoice} />
      </motion.div>
    </motion.div>
  )
}
