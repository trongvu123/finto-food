"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function PaymentConfirmationPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl">Đặt hàng thành công!</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
            </p>
            <p className="text-gray-600">
              Mã đơn hàng của bạn sẽ được gửi qua email. Vui lòng kiểm tra email của bạn để biết thêm chi tiết.
            </p>
            <div className="pt-4 space-x-4">
              <Button onClick={() => router.push("/san-pham")}>
                Tiếp tục mua sắm
              </Button>
              <Button variant="outline" onClick={() => router.push("/don-hang")}>
                Xem đơn hàng của tôi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
