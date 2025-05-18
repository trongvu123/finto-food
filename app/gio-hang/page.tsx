"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, ShoppingCart } from 'lucide-react'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity } = useCart()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [removingItemId, setRemovingItemId] = useState<string | null>(null)
  const [updatingQuantity, setUpdatingQuantity] = useState<Record<string, boolean>>({})

  // Tránh hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = () => {
    router.push("/thanh-toan")
  }

  const handleRemoveItem = (id: string) => {
    setRemovingItemId(id)
    // Thêm độ trễ nhỏ để animation hoàn thành trước khi xóa
    setTimeout(() => {
      removeFromCart(id)
      setRemovingItemId(null)
    }, 300)
  }

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setUpdatingQuantity(prev => ({ ...prev, [id]: true }))
    updateQuantity(id, newQuantity)
    // Xóa trạng thái cập nhật sau khi animation hoàn thành
    setTimeout(() => {
      setUpdatingQuantity(prev => ({ ...prev, [id]: false }))
    }, 300)
  }

  // Nếu chưa mounted, hiển thị skeleton loading
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200 mb-8"></div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 rounded-lg border p-4">
                <div className="h-24 w-24 animate-pulse rounded-md bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-3/4 animate-pulse rounded-md bg-gray-200"></div>
                  <div className="h-4 w-1/4 animate-pulse rounded-md bg-gray-200"></div>
                  <div className="h-8 w-1/2 animate-pulse rounded-md bg-gray-200"></div>
                </div>
                <div className="h-6 w-24 animate-pulse rounded-md bg-gray-200"></div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border p-6 space-y-4">
            <div className="h-6 w-3/4 animate-pulse rounded-md bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded-md bg-gray-200"></div>
              <div className="h-4 w-full animate-pulse rounded-md bg-gray-200"></div>
              <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6 flex justify-center"
        >
          <ShoppingCart className="h-24 w-24 text-gray-300" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 text-2xl font-bold"
        >
          Giỏ hàng trống
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 text-gray-600"
        >
          Hãy thêm sản phẩm vào giỏ hàng của bạn
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/san-pham">
            <Button className="group">
              Tiếp tục mua sắm
              <motion.span
                initial={{ x: 0 }}
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.8 }}
              >
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.span>
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-2xl font-bold"
      >
        Giỏ hàng
      </motion.h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <AnimatePresence>
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1,
                    exit: { duration: 0.2 }
                  }}
                  className={`flex gap-4 rounded-lg border p-4 ${removingItemId === item.id ? 'border-red-300 bg-red-50' : ''}`}
                  layout
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="relative h-24 w-24 overflow-hidden rounded-md"
                  >
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
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
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </motion.div>
                        <motion.div
                          animate={updatingQuantity[item.id] ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))
                            }
                            className="w-16 text-center"
                          />
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Xóa
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <motion.div 
                    className="text-right"
                    animate={updatingQuantity[item.id] ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="font-medium">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND"
                      }).format(item.price * item.quantity)}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="mb-4 text-xl font-semibold">Thông tin đơn hàng</h2>
          <div className="space-y-4">
            <div className="border-t pt-4">
              <motion.div 
                className="mb-2 flex justify-between"
                animate={{ opacity: [0.8, 1] }}
                transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
              >
                <span>Tạm tính:</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND"
                  }).format(total)}
                </span>
              </motion.div>
              <motion.div 
                className="mb-4 flex justify-between font-semibold"
                initial={{ backgroundColor: "rgba(0,0,0,0)" }}
                animate={{ backgroundColor: ["rgba(0,0,0,0)", "rgba(0,0,0,0.03)", "rgba(0,0,0,0)"] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                style={{ padding: "8px", borderRadius: "4px" }}
              >
                <span>Tổng cộng:</span>
                <motion.span 
                  className="text-primary"
                  key={total}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND"
                  }).format(total)}
                </motion.span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleCheckout} 
                  className="w-full group relative overflow-hidden"
                  size="lg"
                >
                  <motion.span
                    initial={{ x: 0 }}
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.8 }}
                    className="flex items-center justify-center"
                  >
                    Tiến hành thanh toán
                    <ShoppingBag className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </motion.span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
