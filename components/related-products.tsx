"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

// Dữ liệu mẫu cho sản phẩm liên quan
const dogProducts = [
  {
    id: 2,
    name: "Pedigree Adult vị bò và rau củ",
    price: 650000,
    image: "/placeholder.svg?height=300&width=300",
    category: "cho",
    subcategory: "thuc-an-hat",
    sold: 90,
    total: 150,
  },
  {
    id: 3,
    name: "Bánh thưởng Pedigree Dentastix",
    price: 95000,
    image: "/placeholder.svg?height=300&width=300",
    category: "cho",
    subcategory: "banh-thuong",
    sold: 65,
    total: 150,
  },
  {
    id: 4,
    name: "Pate Pedigree cho chó",
    price: 35000,
    image: "/placeholder.svg?height=300&width=300",
    category: "cho",
    subcategory: "pate",
    sold: 80,
    total: 120,
  },
]

const catProducts = [
  {
    id: 7,
    name: "Pate Whiskas cho mèo",
    price: 25000,
    image: "/placeholder.svg?height=300&width=300",
    category: "meo",
    subcategory: "pate",
    sold: 85,
    total: 100,
  },
  {
    id: 8,
    name: "Cát vệ sinh cho mèo",
    price: 120000,
    image: "/placeholder.svg?height=300&width=300",
    category: "meo",
    subcategory: "cat-ve-sinh",
    sold: 200,
    total: 250,
  },
  {
    id: 9,
    name: "Đồ chơi chuột cho mèo",
    price: 35000,
    image: "/placeholder.svg?height=300&width=300",
    category: "meo",
    subcategory: "do-choi",
    sold: 60,
    total: 100,
  },
]

interface Product {
  id: number
  name: string
  price: number
  images: string[]
  category: string
  subcategory: string
  rating: number
  reviews: number
}

interface RelatedProductsProps {
  category: string
  currentProductId: number
}

export default function RelatedProducts({ category, currentProductId }: RelatedProductsProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [quantity] = useState(1)

  // Lấy sản phẩm liên quan dựa trên danh mục và loại trừ sản phẩm hiện tại
  const relatedProducts =
    category === "cho"
      ? dogProducts.filter((p) => p.id !== currentProductId)
      : catProducts.filter((p) => p.id !== currentProductId)

  const handleAddToCart = (product: any) => {
    addToCart({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      category: product.category
    })
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} (${quantity} sản phẩm)`,
    })
  }

  return (
    <section className="mt-12 py-8">
      <h2 className="mb-6 text-2xl font-bold">Sản phẩm tương tự</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {relatedProducts.map((product) => (
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
              <Button
                className="w-full"
                onClick={() => handleAddToCart(product)}
              >
                Thêm vào giỏ
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
