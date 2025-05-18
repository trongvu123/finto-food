"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react'
import { getInvoice } from "@/lib/api"
import { useAppStore } from "@/components/app-provider"
import { InvoiceViewer } from "@/components/invoice-viewer"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

export interface Invoice {
  id: string;
  email: string;
  fullName: string;
  paymentMethod: string;
  phone: string;
  shippingAddress: string;
  shippingDistrict: string;
  shippingProvince: string;
  shippingWard: string;
  total: number;
  createdAt: Date;
  items: Item[];
}

export interface Item {
  product: Product;
  quantity: number;
}

export interface Product {
  name: string;
  images: string[];
  price: number;
}

function PaymentConfirmation() {
  const code = useSearchParams().get("code")
  const user = useAppStore((state) => state.user)
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!code) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const invoiceData = await getInvoice(code)
        setInvoice(invoiceData)
      } catch (err) {
        console.error("Error fetching invoice:", err)
        setError("Không thể tải thông tin hóa đơn. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchInvoiceData()
  }, [code])

  // Hiệu ứng confetti khi trang được tải
  useEffect(() => {
    // Bạn có thể thêm hiệu ứng confetti ở đây nếu muốn
    // Ví dụ: import confetti from 'canvas-confetti'
    // confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-3xl mx-auto shadow-lg border-primary/10">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
              </motion.div>
              <CardTitle className="text-3xl font-bold">Đặt hàng thành công!</CardTitle>
              <p className="text-gray-600 mt-2">
                Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : error ? (
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <p className="text-red-600">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
                  Quay lại trang chủ
                </Button>
              </div>
            ) : invoice ? (
              <AnimatePresence>
                <InvoiceViewer invoice={invoice} />
              </AnimatePresence>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Mã đơn hàng của bạn sẽ được gửi qua email. Vui lòng kiểm tra email của bạn để biết thêm chi tiết.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2" 
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại trang chủ
              </Button>
              
              <Button 
                className="flex items-center gap-2" 
                onClick={() => router.push("/san-pham")}
              >
                <ShoppingBag className="h-4 w-4" />
                Tiếp tục mua sắm
              </Button>
              
              {user && (
                <Button 
                  variant="secondary" 
                  onClick={() => router.push("/don-hang")}
                >
                  Xem đơn hàng của tôi
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function PaymentConfirmationPage(){
  return (
    <Suspense>
      <PaymentConfirmation />
    </Suspense>
  )
}