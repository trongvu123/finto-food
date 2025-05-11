"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { use } from "react"

// Dữ liệu mẫu cho danh sách sản phẩm
const products = [
  {
    id: 1,
    name: "Royal Canin Medium Adult",
    price: 750000,
    image: "/placeholder.svg?height=300&width=300",
    category: "cho",
    subcategory: "thuc-an-hat",
    rating: 4.5,
    reviews: 120,
  },
  {
    id: 2,
    name: "Pedigree Adult vị bò và rau củ",
    price: 650000,
    image: "/placeholder.svg?height=300&width=300",
    category: "cho",
    subcategory: "thuc-an-hat",
    rating: 4.3,
    reviews: 85,
  },
  {
    id: 3,
    name: "Bánh thưởng Pedigree Dentastix",
    price: 95000,
    image: "/placeholder.svg?height=300&width=300",
    category: "cho",
    subcategory: "banh-thuong",
    rating: 4.7,
    reviews: 150,
  },
  {
    id: 4,
    name: "Pate Pedigree cho chó",
    price: 35000,
    image: "/placeholder.svg?height=300&width=300",
    category: "cho",
    subcategory: "pate",
    rating: 4.4,
    reviews: 95,
  },
  {
    id: 5,
    name: "Xương gặm sạch răng cho chó",
    price: 45000,
    image: "/placeholder.svg?height=300&width=300",
    category: "cho",
    subcategory: "do-nhai",
    rating: 4.6,
    reviews: 110,
  },
  {
    id: 6,
    name: "Royal Canin Indoor Adult",
    price: 650000,
    image: "/placeholder.svg?height=300&width=300",
    category: "meo",
    subcategory: "thuc-an-hat",
    rating: 4.7,
    reviews: 85,
  },
  {
    id: 7,
    name: "Pate Whiskas cho mèo",
    price: 25000,
    image: "/placeholder.svg?height=300&width=300",
    category: "meo",
    subcategory: "pate",
    rating: 4.5,
    reviews: 120,
  },
  {
    id: 8,
    name: "Cát vệ sinh cho mèo",
    price: 120000,
    image: "/placeholder.svg?height=300&width=300",
    category: "meo",
    subcategory: "cat-ve-sinh",
    rating: 4.4,
    reviews: 95,
  },
  {
    id: 9,
    name: "Đồ chơi chuột cho mèo",
    price: 35000,
    image: "/placeholder.svg?height=300&width=300",
    category: "meo",
    subcategory: "do-choi",
    rating: 4.6,
    reviews: 110,
  },
]

// Format giá tiền sang VND
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export default function ProductCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  // Kiểm tra xem danh mục có tồn tại không
  if (!["cho", "meo"].includes(id)) {
    notFound()
  }

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("all")
  const [sortBy, setSortBy] = useState("default")

  // Lọc sản phẩm dựa trên danh mục, từ khóa tìm kiếm và danh mục con
  const filteredProducts = products.filter((product) => {
    const matchesCategory = product.category === id
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubcategory = selectedSubcategory === "all" || product.subcategory === selectedSubcategory
    return matchesCategory && matchesSearch && matchesSubcategory
  })

  // Sắp xếp sản phẩm
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      default:
        return 0
    }
  })

  // Lấy danh sách danh mục con dựa trên danh mục chính
  const subcategories = [
    { value: "all", label: "Tất cả" },
    { value: "thuc-an-hat", label: "Thức ăn hạt" },
    { value: "pate", label: "Pate" },
    { value: "banh-thuong", label: "Bánh thưởng" },
    { value: "do-nhai", label: "Đồ nhai" },
    ...(id === "meo" ? [{ value: "cat-ve-sinh", label: "Cát vệ sinh" }] : []),
    { value: "do-choi", label: "Đồ chơi" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">
          {id === "cho" ? "Sản phẩm cho chó" : "Sản phẩm cho mèo"}
        </h1>
        <p className="text-gray-500">
          {id === "cho"
            ? "Khám phá các sản phẩm chất lượng cao dành cho chó của chúng tôi"
            : "Khám phá các sản phẩm chất lượng cao dành cho mèo của chúng tôi"}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Danh mục con" />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.value} value={subcategory.value}>
                    {subcategory.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Mặc định</SelectItem>
              <SelectItem value="price-asc">Giá tăng dần</SelectItem>
              <SelectItem value="price-desc">Giá giảm dần</SelectItem>
              <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/san-pham/${id}/${product.id}`}
            className="group overflow-hidden rounded-lg border transition-all hover:border-primary"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                className="object-cover transition-transform group-hover:scale-105"
                fill
              />
            </div>
            <div className="p-4">
              <h3 className="mb-2 line-clamp-2 font-semibold group-hover:text-primary">{product.name}</h3>
              <div className="mb-2 flex items-center">
                <div className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                          }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">({product.reviews})</span>
              </div>
              <div className="font-bold text-primary">{formatCurrency(product.price)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
