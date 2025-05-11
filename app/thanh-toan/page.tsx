"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { createOrder } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Danh sách tỉnh/thành phố
const provinces = [
  { id: "hcm", name: "TP. Hồ Chí Minh" },
  { id: "hn", name: "Hà Nội" },
  { id: "dn", name: "Đà Nẵng" }
]

// Danh sách quận/huyện theo tỉnh/thành phố
const districts = {
  hcm: [
    { id: "q1", name: "Quận 1" },
    { id: "q2", name: "Quận 2" },
    { id: "q3", name: "Quận 3" }
  ],
  hn: [
    { id: "hbt", name: "Hai Bà Trưng" },
    { id: "hk", name: "Hoàn Kiếm" },
    { id: "cg", name: "Cầu Giấy" }
  ],
  dn: [
    { id: "hs", name: "Hải Châu" },
    { id: "lt", name: "Liên Chiểu" },
    { id: "ng", name: "Ngũ Hành Sơn" }
  ]
}

// Danh sách phường/xã theo quận/huyện
const wards = {
  q1: [
    { id: "bnt", name: "Bến Nghé" },
    { id: "bn", name: "Bến Thành" }
  ],
  q2: [
    { id: "td", name: "Thảo Điền" },
    { id: "an", name: "An Phú" }
  ],
  q3: [
    { id: "vt", name: "Võ Thị Sáu" },
    { id: "nt", name: "Nguyễn Thị Minh Khai" }
  ],
  hbt: [
    { id: "bt", name: "Bách Khoa" },
    { id: "mb", name: "Minh Khai" }
  ],
  hk: [
    { id: "ht", name: "Hàng Trống" },
    { id: "hd", name: "Hàng Đào" }
  ],
  cg: [
    { id: "dt", name: "Dịch Vọng" },
    { id: "nt", name: "Nghĩa Tân" }
  ],
  hs: [
    { id: "tt", name: "Thanh Bình" },
    { id: "hb", name: "Hòa Cường Bắc" }
  ],
  lt: [
    { id: "hc", name: "Hòa Khánh Bắc" },
    { id: "hn", name: "Hòa Khánh Nam" }
  ],
  ng: [
    { id: "mb", name: "Mỹ An" },
    { id: "kb", name: "Khuê Mỹ" }
  ]
}

export default function PaymentPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    paymentMethod: "cod"
  })

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createOrder({
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingAddress: shippingInfo.address,
        shippingProvince: shippingInfo.province,
        shippingDistrict: shippingInfo.district,
        shippingWard: shippingInfo.ward,
        phone: shippingInfo.phone,
        paymentMethod: shippingInfo.paymentMethod,
        fullName: shippingInfo.name,
        email: shippingInfo.email
      })
      await fetch('/api/products/update-stock', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity
          })),
          action: 'decrease'
        })
      })
      toast.success("Đặt hàng thành công!")
      clearCart()
      router.push("/thanh-toan/xac-nhan")
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đặt hàng")
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
          <p className="mb-4">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <Button onClick={() => router.push("/san-pham")}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Thanh toán</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    value={shippingInfo.name}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={shippingInfo.email}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Địa chỉ chi tiết</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="province">Tỉnh/Thành phố</Label>
                  <Select
                    value={shippingInfo.province}
                    onValueChange={(value) =>
                      setShippingInfo({
                        ...shippingInfo,
                        province: value,
                        district: "",
                        ward: ""
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="district">Quận/Huyện</Label>
                  <Select
                    value={shippingInfo.district}
                    onValueChange={(value) =>
                      setShippingInfo({
                        ...shippingInfo,
                        district: value,
                        ward: ""
                      })
                    }
                    disabled={!shippingInfo.province}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Quận/Huyện" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingInfo.province &&
                        districts[shippingInfo.province as keyof typeof districts]?.map(
                          (district) => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          )
                        )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ward">Phường/Xã</Label>
                  <Select
                    value={shippingInfo.ward}
                    onValueChange={(value) =>
                      setShippingInfo({ ...shippingInfo, ward: value })
                    }
                    disabled={!shippingInfo.district}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Phường/Xã" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingInfo.district &&
                        wards[shippingInfo.district as keyof typeof wards]?.map((ward) => (
                          <SelectItem key={ward.id} value={ward.id}>
                            {ward.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phương thức thanh toán</Label>
                  <RadioGroup
                    value={shippingInfo.paymentMethod}
                    onValueChange={(value) =>
                      setShippingInfo({ ...shippingInfo, paymentMethod: value })
                    }
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod">Thanh toán khi nhận hàng (COD)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="banking" id="banking" />
                      <Label htmlFor="banking">Chuyển khoản ngân hàng</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Đặt hàng"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Tổng cộng:</span>
                    <span>{total.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
