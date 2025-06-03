"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Star, MapPin, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { toast } from "sonner"
import Image from "next/image"

interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  serviceType: string
  rating?: number
  reviewCount?: number
  imageUrl: string[]
  services: Service[]
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  images: string[]
}

const serviceTypes = [
  { value: "all", label: "Tất cả dịch vụ" },
  { value: "spa", label: "Spa" },
  { value: "khách sạn thú cưng", label: "Khách sạn thú cưng" },
  { value: "chăm sóc sức khỏe", label: "Chăm sóc sức khỏe" },
  { value: "chải lông", label: "Chải lông" },
]

const cities = [
  { value: "all", label: "Tất cả thành phố" },
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "Đà Nẵng", label: "Đà Nẵng" },
  { value: "Thành phố Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
]

export default function ServicesList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedServiceType, setSelectedServiceType] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSuppliers()
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favoriteServices")
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)))
    }
  }, [])

  useEffect(() => {
    let filtered = suppliers

    if (searchTerm) {
      filtered = filtered.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.services.some((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedServiceType !== "all") {
      filtered = filtered.filter((supplier) => supplier.serviceType === selectedServiceType)
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter((supplier) => supplier.city === selectedCity)
    }

    setFilteredSuppliers(filtered)
  }, [searchTerm, selectedServiceType, selectedCity, suppliers])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/suppliers")
      if (!response.ok) throw new Error("Failed to fetch suppliers")
      const data = await response.json()
      setSuppliers(data)
      setFilteredSuppliers(data)
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast.error("Failed to fetch suppliers")
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
      toast.success("Đã thêm vào danh sách yêu thích")
    }
    setFavorites(newFavorites)
    localStorage.setItem("favoriteServices", JSON.stringify([...newFavorites]))
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dịch vụ thú cưng</h1>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc {showFilters ? "▲" : "▼"}
            </Button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-col lg:flex-row gap-4"
              >
                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Chọn loại dịch vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Chọn thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredSuppliers.map((supplier) => (
                <motion.div
                  key={supplier.id}
                  variants={item}
                  layout
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                    <div className="relative h-48">
                      <Image
                        src={supplier.imageUrl?.[0] || "/placeholder.svg?height=192&width=384"}
                        alt={supplier.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`rounded-full w-8 h-8 p-0 ${favorites.has(supplier.id)
                              ? "bg-rose-100 text-rose-500 hover:bg-rose-200"
                              : "bg-white/80 hover:bg-white"
                            }`}
                          onClick={() => toggleFavorite(supplier.id)}
                        >
                          <Heart className={`h-4 w-4 ${favorites.has(supplier.id) ? "fill-rose-500" : ""}`} />
                        </Button>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Badge variant="secondary" className="bg-white/90">
                          {supplier.serviceType}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="flex-none">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold line-clamp-1">{supplier.name}</h3>
                        {supplier.rating && supplier.reviewCount ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{supplier.rating}</span>
                            <span className="text-sm text-gray-500">({supplier.reviewCount})</span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">Chưa có đánh giá</div>
                        )}
                      </div>
                      <div className="flex items-start text-gray-500 text-sm mt-1">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{supplier.address}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <div className="space-y-2">
                        {supplier.services.slice(0, 1).map((service) => (
                          <div key={service.id} className="flex justify-between items-center">
                            <span className="text-sm line-clamp-1">{service.name}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {service.salePrice && (
                                <span className="text-xs text-gray-500 line-through">
                                  {service.price.toLocaleString()}đ
                                </span>
                              )}
                              <span className="text-sm font-medium text-emerald-600">
                                {(service.salePrice || service.price).toLocaleString()}đ
                              </span>
                            </div>
                          </div>
                        ))}
                        {supplier.services.length > 1 && (
                          <p className="text-xs text-gray-500">+{supplier.services.length - 1} dịch vụ khác</p>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="mt-auto pt-4">
                      <Button asChild className="w-full">
                        <Link href={`/nha-cung-cap/${supplier.id}`}>Xem chi tiết</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredSuppliers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-lg shadow-sm"
          >
            <div className="flex flex-col items-center">
              <Search className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">Không tìm thấy dịch vụ phù hợp</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Vui lòng thử lại với từ khóa khác hoặc điều chỉnh bộ lọc của bạn
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCity("all")
                  setSelectedServiceType("all")
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
