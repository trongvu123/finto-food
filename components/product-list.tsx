"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Eye, Star, BarChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import { getReviews } from "@/lib/api"
import { useEffect, useState } from "react"


// Định nghĩa kiểu dữ liệu cho sản phẩm
interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice: number | null
  stock: number
  sold: number
  images: string[]
  categoryId: string
  nutritionalInfo: string | null
  ingredients: string | null
  brandId: string
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
  }
  brand: {
    id: string
    name: string
    description: string
    logo: string | null
    website: string | null
    createdAt: string
    updatedAt: string
  }
}
export interface RatingData {
  rating: number
  count: number
}
// Format giá tiền sang VND
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

// Tính phần trăm giảm giá
function calculateDiscount(price: number, salePrice: number | null): number {
  if (!salePrice) return 0
  return Math.round(((price - salePrice) / price) * 100)
}

// Tính rating giả
async function fetchRating(id: string): Promise<RatingData> {
  const reviews = await getReviews(id)
  const count = reviews.length
  const rating = count > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count : 0
  return { rating, count }
}

interface ProductListProps {
  products: Product[]
  viewMode?: "grid" | "list"
}

export default function ProductList({ products, viewMode = "grid" }: ProductListProps) {
  const { toast } = useToast()
  const { addToCart } = useCart()
  const [ratings, setRatings] = useState<Record<string, RatingData>>({})
  useEffect(() => {
    const load = async () => {
      const entries = await Promise.all(
        products.map(async (p) => [p.id, await fetchRating(p.id)] as const
        ))
      setRatings(Object.fromEntries(entries))
    }
    load()
  }, [products])
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "/placeholder.svg",
      quantity: 1,
      category: product.category.name
    })
    toast({
      title: "Success",
      description: "Product added to cart",
    })
  }
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (viewMode === "list") {
    return (
      <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
        {products.map((product) => {
          const discount = calculateDiscount(product.price, product.salePrice)
          const { rating = 0, count = 0 } = ratings[product.id] || {}
          const soldPercentage = Math.min(100, (product.sold / (product.sold + product.stock)) * 100)

          return (
            <motion.div
              key={product.id}
              variants={item}
              className="group bg-white rounded-lg border overflow-hidden hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-64 h-64">
                  <Link href={`/san-pham/${product.category.name}/${product.id}`} className="block h-full">
                    <Image
                      src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                    />
                    {discount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">-{discount}%</Badge>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">Hết hàng</span>
                      </div>
                    )}
                  </Link>
                </div>

                <div className="flex-1 p-4 flex flex-col">
                  <div className="mb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {product.category.name}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {product.brand.name}
                      </Badge>
                    </div>
                    <Link href={`/san-pham/${product.category.name}/${product.id}`} className="block mt-2">
                      <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.description}</p>

                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.floor(rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : star - 0.5 <= rating
                              ? "fill-yellow-400/50 text-yellow-400"
                              : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {rating} ({count} đánh giá)
                    </span>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        {product.salePrice ? (
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-primary mr-2">
                              {formatCurrency(product.salePrice)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">{formatCurrency(product.price)}</span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <BarChart className="h-4 w-4 mr-1" />
                        <span>Đã bán: {product.sold}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" disabled={product.stock === 0}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Thêm vào giỏ
                      </Button>
                      <Button variant="outline" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/san-pham/${product.category.name}/${product.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {products.map((product) => {
        const discount = calculateDiscount(product.price, product.salePrice)
        const { rating = 0, count = 0 } = ratings[product.id] || {}
        const soldPercentage = Math.min(100, (product.sold / (product.sold + product.stock)) * 100)

        return (
          <motion.div
            key={product.id}
            variants={item}
            className="group bg-white rounded-lg border overflow-hidden hover:shadow-md transition-all"
          >
            <div className="relative aspect-square">
              <Link href={`/san-pham/${product.category.name}/${product.id}`} className="block">
                <Image
                  src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                  alt={product.name}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  fill
                />
                {discount > 0 && <Badge className="absolute top-2 left-2 bg-red-500 text-white">-{discount}%</Badge>}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">Hết hàng</span>
                  </div>
                )}
              </Link>
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full" asChild>
                  <Link href={`/san-pham/${product.category.name}/${product.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {product.category.name}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {product.brand.name}
                </Badge>
              </div>

              <Link href={`/san-pham/${product.category.name}/${product.id}`} className="block">
                <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center my-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : star - 0.5 <= rating
                          ? "fill-yellow-400/50 text-yellow-400"
                          : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-2">({count})</span>
              </div>

              <div className="mb-3">
                {product.salePrice ? (
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-primary mr-2">{formatCurrency(product.salePrice)}</span>
                    <span className="text-sm text-gray-500 line-through">{formatCurrency(product.price)}</span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
                )}
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                  <span>Đã bán: {product.sold}</span>
                  <span>{Math.round(soldPercentage)}%</span>
                </div>
                <Progress value={soldPercentage} className="h-1" />
              </div>

              <Button className="w-full" disabled={product.stock === 0}
                onClick={() => handleAddToCart(product)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Thêm vào giỏ hàng
              </Button>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
