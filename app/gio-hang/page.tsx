"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity } = useCart()
  const router = useRouter()

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = () => {
    router.push("/thanh-toan")
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Giỏ hàng trống</h1>
        <p className="mb-8 text-gray-600">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
        <Link href="/san-pham">
          <Button>Tiếp tục mua sắm</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Giỏ hàng</h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-lg border p-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-md">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <Link href={`/san-pham/${item.id}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND"
                    }).format(item.price)}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND"
                    }).format(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Thông tin đơn hàng</h2>
          <div className="space-y-4">
            <div className="border-t pt-4">
              <div className="mb-2 flex justify-between">
                <span>Tạm tính:</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND"
                  }).format(total)}
                </span>
              </div>
              <div className="mb-4 flex justify-between font-semibold">
                <span>Tổng cộng:</span>
                <span className="text-primary">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND"
                  }).format(total)}
                </span>
              </div>
              <Button onClick={handleCheckout} className="w-full">
                Tiến hành thanh toán
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
