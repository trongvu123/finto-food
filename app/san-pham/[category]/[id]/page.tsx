"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/contexts/cart-context"
import {
  ShoppingCart,
  Minus,
  Plus,
  Heart,
  Share2,
  ChevronRight,
  Star,
  Check,
  Truck,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Info,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { use } from "react"
import { motion, AnimatePresence } from "framer-motion"

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

interface ProductResponse {
  product: Product
  relatedProducts: Product[]
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

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>
}) {
  const { category, id } = use(params)
  const router = useRouter()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Tạo rating giả
  const rating = 4.5
  const reviewCount = 124

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch product")
        }
        const data: ProductResponse = await response.json()
        setProduct(data.product)
        setRelatedProducts(data.relatedProducts)
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin sản phẩm",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, toast])

  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images?.[0] || "/placeholder.svg",
      quantity,
      category: product.category.name,
    })

    toast({
      title: "Thành công",
      description: "Đã thêm sản phẩm vào giỏ hàng",
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push("/gio-hang")
  }

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    toast({
      title: isWishlisted ? "Đã xóa khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích",
      description: isWishlisted
        ? "Sản phẩm đã được xóa khỏi danh sách yêu thích của bạn"
        : "Sản phẩm đã được thêm vào danh sách yêu thích của bạn",
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Đã sao chép",
        description: "Đường dẫn sản phẩm đã được sao chép vào clipboard",
      })
    }
  }

  const nextImage = () => {
    if (!product?.images) return
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    if (!product?.images) return
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
          <p className="text-gray-500 mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={() => router.push("/san-pham")}>Quay lại trang sản phẩm</Button>
        </div>
      </div>
    )
  }

  const discount = calculateDiscount(product.price, product.salePrice)
  const allImages = product.images?.length > 0 ? product.images : ["/placeholder.svg"]
  const selectedImage = allImages[selectedImageIndex]
  const soldPercentage = Math.min(100, (product.sold / (product.sold + product.stock)) * 100)

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">
          Trang chủ
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/san-pham" className="hover:text-primary">
          Sản phẩm
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href={`/san-pham/${category}`} className="hover:text-primary">
          {product.category.name}
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-700 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-white">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full"
              >
                <Image
                  src={selectedImage || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {discount > 0 && <Badge className="absolute top-4 left-4 bg-red-500 text-white">-{discount}%</Badge>}

            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-xl">Hết hàng</span>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full opacity-80 pointer-events-auto"
                onClick={prevImage}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full opacity-80 pointer-events-auto"
                onClick={nextImage}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {allImages.map((image, index) => (
              <div
                key={index}
                className={`aspect-square relative overflow-hidden rounded-lg border cursor-pointer ${selectedImageIndex === index ? "ring-2 ring-primary" : ""
                  }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.category.name}</Badge>
              <Badge variant="secondary">{product.brand.name}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
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
              <span className="text-sm text-gray-500">
                {rating} ({reviewCount} đánh giá)
              </span>
              <span className="text-sm text-gray-500">Đã bán: {product.sold}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-primary">{formatCurrency(product.salePrice)}</span>
                  <span className="text-xl text-gray-500 line-through">{formatCurrency(product.price)}</span>
                  <Badge className="bg-red-500 text-white">-{discount}%</Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                  <span>Đã bán: {product.sold}</span>
                  <span>Còn lại: {product.stock}</span>
                </div>
                <Progress value={soldPercentage} className="h-2" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">Còn {product.stock} sản phẩm</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="h-5 w-5" />
                <span>Giao hàng nhanh</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <ShieldCheck className="h-5 w-5" />
                <span>Bảo hành chính hãng</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Số lượng</h2>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-r-none h-10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.stock === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(product.stock, Number.parseInt(e.target.value) || 1)))
                  }
                  className="w-16 text-center h-10 border-0 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={product.stock === 0}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-l-none h-10"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={product.stock === 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="flex-1" size="lg" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Mua ngay
              </Button>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={handleToggleWishlist}>
                <Heart className={`mr-2 h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                {isWishlisted ? "Đã thêm vào yêu thích" : "Thêm vào yêu thích"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share2 className="mr-2 h-5 w-5" />
                Chia sẻ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="description"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent h-12"
            >
              Mô tả sản phẩm
            </TabsTrigger>
            {(product.nutritionalInfo || product.ingredients) && (
              <TabsTrigger
                value="nutrition"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent h-12"
              >
                Thông tin dinh dưỡng
              </TabsTrigger>
            )}
            <TabsTrigger
              value="reviews"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent h-12"
            >
              Đánh giá ({reviewCount})
            </TabsTrigger>
            <TabsTrigger
              value="shipping"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent h-12"
            >
              Vận chuyển & Đổi trả
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-6">
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">Mô tả sản phẩm</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Thông tin chi tiết:</h4>
                <ul className="space-y-2">
                  <li className="flex">
                    <span className="font-medium w-40">Thương hiệu:</span>
                    <span>{product.brand.name}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-40">Danh mục:</span>
                    <span>{product.category.name}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-40">Tình trạng:</span>
                    <span>{product.stock > 0 ? "Còn hàng" : "Hết hàng"}</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {(product.nutritionalInfo || product.ingredients) && (
            <TabsContent value="nutrition" className="pt-6">
              <div className="bg-white rounded-lg p-6 border">
                {product.nutritionalInfo && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4">Thông tin dinh dưỡng</h3>
                    <p className="text-gray-700 whitespace-pre-line">{product.nutritionalInfo}</p>
                  </div>
                )}

                {product.ingredients && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Thành phần</h3>
                    <p className="text-gray-700 whitespace-pre-line">{product.ingredients}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          <TabsContent value="reviews" className="pt-6">
            <div className="bg-white rounded-lg p-6 border">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-5xl font-bold text-primary mb-2">{rating}</div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${star <= Math.floor(rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : star - 0.5 <= rating
                                ? "fill-yellow-400/50 text-yellow-400"
                                : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">{reviewCount} đánh giá</div>
                    <Button>Viết đánh giá</Button>
                  </div>
                </div>

                <div className="md:w-2/3">
                  <h3 className="text-xl font-semibold mb-4">Đánh giá từ khách hàng</h3>

                  <div className="space-y-6">
                    {/* Sample reviews */}
                    <div className="border-b pb-6">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                          <div>
                            <div className="font-medium">Nguyễn Văn A</div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">2 ngày trước</div>
                      </div>
                      <p className="text-gray-700">
                        Sản phẩm rất tốt, thú cưng nhà mình rất thích. Giao hàng nhanh, đóng gói cẩn thận.
                      </p>
                    </div>

                    <div className="border-b pb-6">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                          <div>
                            <div className="font-medium">Trần Thị B</div>
                            <div className="flex">
                              {[1, 2, 3, 4].map((star) => (
                                <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                              <Star className="h-4 w-4 text-gray-300" />
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">1 tuần trước</div>
                      </div>
                      <p className="text-gray-700">Chất lượng sản phẩm tốt, giá cả hợp lý. Sẽ mua lại lần sau.</p>
                    </div>

                    <Button variant="outline" className="w-full">
                      Xem thêm đánh giá
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="pt-6">
            <div className="bg-white rounded-lg p-6 border">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Thông tin vận chuyển
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Giao hàng nhanh trong vòng 24h đối với các đơn hàng nội thành</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Giao hàng tiêu chuẩn từ 2-3 ngày đối với các đơn hàng ngoại thành</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Phí vận chuyển tiêu chuẩn: 30.000đ</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    Chính sách đổi trả
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Đổi trả miễn phí trong vòng 7 ngày nếu sản phẩm lỗi do nhà sản xuất</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Hoàn tiền 100% nếu sản phẩm không đúng mô tả</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Bảo hành chính hãng theo quy định của nhà sản xuất</span>
                    </li>
                    <li className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <span>Lưu ý: Sản phẩm thực phẩm đã mở bao bì không được đổi trả</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => {
              const relatedDiscount = calculateDiscount(relatedProduct.price, relatedProduct.salePrice)

              return (
                <div
                  key={relatedProduct.id}
                  className="group bg-white rounded-lg border overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="relative aspect-square">
                    <Link href={`/san-pham/${relatedProduct.category.id}/${relatedProduct.id}`}>
                      <Image
                        src={relatedProduct.images?.[0] || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {relatedDiscount > 0 && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">-{relatedDiscount}%</Badge>
                      )}
                    </Link>
                  </div>
                  <div className="p-4">
                    <Link href={`/san-pham/${relatedProduct.category.id}/${relatedProduct.id}`}>
                      <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <div className="mb-2">
                      {relatedProduct.salePrice ? (
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-primary mr-2">
                            {formatCurrency(relatedProduct.salePrice)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(relatedProduct.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-primary">{formatCurrency(relatedProduct.price)}</span>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        if (!relatedProduct) return

                        addToCart({
                          id: relatedProduct.id,
                          name: relatedProduct.name,
                          price: relatedProduct.salePrice || relatedProduct.price,
                          image: relatedProduct.images?.[0] || "/placeholder.svg",
                          quantity: 1,
                          category: relatedProduct.category.name,
                        })

                        toast({
                          title: "Thành công",
                          description: "Đã thêm sản phẩm vào giỏ hàng",
                        })
                      }}
                      disabled={relatedProduct.stock === 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {relatedProduct.stock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
