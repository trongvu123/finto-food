"use client"

import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Star, ArrowRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { motion, useInView } from "framer-motion"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"

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
  const { toast } = useToast()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  const handleAddToCart = (product: any) => {
    addToCart({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: product.category,
    })

    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} đã được thêm vào giỏ hàng của bạn.`,
    })
  }

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold md:text-4xl text-gray-900 mb-2">Sản phẩm nổi bật</h2>
          <p className="text-gray-600 max-w-2xl">
            Những sản phẩm chất lượng cao được nhiều khách hàng tin dùng và đánh giá tốt
          </p>
        </div>
        <Link href="/san-pham" className="mt-4 md:mt-0">
          <Button variant="outline" className="group">
            Xem tất cả
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </motion.div>

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4"
      >
        {featuredProducts.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md"
          >
            <Link href={`/san-pham/${product.category}/${product.id}`} className="block overflow-hidden">
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  fill
                />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-md"
                    onClick={(e) => {
                      e.preventDefault()
                      toast({
                        title: "Đã thêm vào yêu thích",
                        description: `${product.name} đã được thêm vào danh sách yêu thích.`,
                      })
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
            <div className="p-4">
              <div className="flex items-center mb-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">(24)</span>
              </div>

              <Link href={`/san-pham/${product.category}/${product.id}`} className="block">
                <h3 className="mb-2 text-lg font-semibold line-clamp-2 group-hover:text-teal-600 transition-colors">
                  {product.name}
                </h3>
              </Link>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-bold text-teal-600">{formatCurrency(product.price)}</span>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                  <span>Đã bán: {product.sold}</span>
                  <span>{Math.round((product.sold / product.total) * 100)}%</span>
                </div>
                <Progress value={(product.sold / product.total) * 100} className="h-1.5" />
              </div>

              <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => handleAddToCart(product)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Thêm vào giỏ hàng
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
