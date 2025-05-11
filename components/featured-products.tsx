"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useCart } from "@/contexts/cart-context"

// Dữ liệu mẫu cho sản phẩm nổi bật
const featuredProducts = [
  {
    id: 1,
    name: "Royal Canin Medium Adult",
    price: 750000,
    image: "/placeholder.svg?height=300&width=300",
    category: "cho",
    sold: 120,
    total: 200,
  },
  {
    id: 2,
    name: "Pate Whiskas cho mèo",
    price: 25000,
    image: "/placeholder.svg?height=300&width=300",
    category: "meo",
    sold: 85,
    total: 100,
  },
  {
    id: 3,
    name: "Bánh thưởng Pedigree Dentastix",
    price: 95000,
    image: "/placeholder.svg?height=300&width=300",
    category: "cho",
    sold: 65,
    total: 150,
  },
  {
    id: 4,
    name: "Cát vệ sinh cho mèo",
    price: 120000,
    image: "/placeholder.svg?height=300&width=300",
    category: "meo",
    sold: 200,
    total: 250,
  },
]

// Format giá tiền sang VND
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export default function FeaturedProducts() {
  const { addToCart } = useCart()

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">Sản phẩm nổi bật</h2>
          <Link href="/san-pham">
            <Button variant="outline">Xem tất cả</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
            >
              <Link href={`/san-pham/${product.category}/${product.id}`} className="block overflow-hidden">
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    fill
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/san-pham/${product.category}/${product.id}`} className="block">
                  <h3 className="mb-2 text-lg font-semibold line-clamp-2">{product.name}</h3>
                </Link>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                    <span>Đã bán: {product.sold}</span>
                    <span>{Math.round((product.sold / product.total) * 100)}%</span>
                  </div>
                  <Progress value={(product.sold / product.total) * 100} className="h-2" />
                </div>
                <Button
                  className="w-full"
                  onClick={() => addToCart({
                    id: String(product.id),
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1,
                    category: product.category
                  })}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
