"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Star,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Heart,
    Share2,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    AlertCircle,
    Package,
    FileText,
    Users,
    Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import BookingModal from "./booking-modal"
import ReviewModal from "./review-modal"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

interface Review {
    id: string
    userName: string
    userAvatar: string
    rating: number
    content: string
    createdAt: string
}

interface CompletedOrder {
    id: string
    serviceId: string
    serviceName: string
    orderCode: string
    status: "COMPLETED"
    hasReviewed: boolean
}

interface Supplier {
    id: string
    name: string
    email: string
    phone: string
    address: string
    serviceType: string
    rating?: number
    reviewCount?: number
    description?: string
    imageUrl: string[]
    services: {
        id: string
        name: string
        description: string
        price: number
        salePrice?: number
    }[]
}

// Empty State Components
const EmptyDescription = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
    >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có mô tả</h3>
        <p className="text-gray-500 max-w-md">Nhà cung cấp chưa cập nhật thông tin mô tả chi tiết về dịch vụ của họ.</p>
    </motion.div>
)

const EmptyServices = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
    >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dịch vụ</h3>
        <p className="text-gray-500 max-w-md">
            Nhà cung cấp chưa đăng ký dịch vụ nào. Vui lòng liên hệ trực tiếp để biết thêm thông tin.
        </p>
        <Button variant="outline" className="mt-4">
            <Phone className="h-4 w-4 mr-2" />
            Liên hệ trực tiếp
        </Button>
    </motion.div>
)

const EmptyReviews = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
    >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đánh giá</h3>
        <p className="text-gray-500 max-w-md">
            Hãy là người đầu tiên đánh giá dịch vụ của nhà cung cấp này để giúp cộng đồng có thêm thông tin hữu ích.
        </p>
        <Button variant="outline" className="mt-4">
            <MessageSquare className="h-4 w-4 mr-2" />
            Viết đánh giá đầu tiên
        </Button>
    </motion.div>
)

const LoadingState = () => (
    <div className="min-h-screen bg-gray-50">
        <Skeleton className="w-full h-96" />
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <Skeleton className="h-8 w-64 mb-4" />
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    </div>
)

export default function SupplierDetail() {
    const params = useParams()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [selectedService, setSelectedService] = useState<any>(null)
    const [serviceToReview, setServiceToReview] = useState<CompletedOrder | null>(null)
    const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([])
    const [reviews, setReviews] = useState<Review[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoggedIn, setIsLoggedIn] = useState(true)
    const [supplier, setSupplier] = useState<Supplier | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFavorite, setIsFavorite] = useState(false)
    const reviewsPerPage = 5

    useEffect(() => {
        fetchSupplierDetails()
        fetchCompletedOrders()
        // Load favorite status from localStorage
        const favorites = JSON.parse(localStorage.getItem("favoriteSuppliers") || "[]")
        setIsFavorite(favorites.includes(params.id))
    }, [params.id])

    useEffect(() => {
        if (supplier) {
            fetchReviews()
        }
    }, [supplier, currentPage])

    const fetchSupplierDetails = async () => {
        try {
            const response = await fetch(`/api/suppliers/${params.id}`)
            if (!response.ok) throw new Error("Failed to fetch supplier details")
            const data = await response.json()
            setSupplier(data)
            if (data.services?.length > 0) {
                setSelectedService(data.services[0])
            }
        } catch (error) {
            console.error("Error fetching supplier details:", error)
            toast.error("Failed to fetch supplier details")
        } finally {
            setLoading(false)
        }
    }

    const fetchCompletedOrders = async () => {
        try {
            const response = await fetch(`/api/service-orders?status=COMPLETED&supplierId=${params.id}`)
            if (!response.ok) throw new Error("Failed to fetch completed orders")
            const data = await response.json()
            setCompletedOrders(data)
        } catch (error) {
            console.error("Error fetching completed orders:", error)
        }
    }

    const fetchReviews = async () => {
        try {
            const response = await fetch(`/api/reviews?supplierId=${params.id}&page=${currentPage}&limit=${reviewsPerPage}`)
            if (!response.ok) throw new Error("Failed to fetch reviews")
            const data = await response.json()
            setReviews(data.reviews || [])
        } catch (error) {
            console.error("Error fetching reviews:", error)
        }
    }

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem("favoriteSuppliers") || "[]")
        let newFavorites

        if (isFavorite) {
            newFavorites = favorites.filter((id: string) => id !== params.id)
            toast.success("Đã xóa khỏi danh sách yêu thích")
        } else {
            newFavorites = [...favorites, params.id]
            toast.success("Đã thêm vào danh sách yêu thích")
        }

        localStorage.setItem("favoriteSuppliers", JSON.stringify(newFavorites))
        setIsFavorite(!isFavorite)
    }

    const nextImage = () => {
        if (!supplier?.imageUrl?.length) return
        setCurrentImageIndex((prev) => (prev + 1) % supplier.imageUrl.length)
    }

    const prevImage = () => {
        if (!supplier?.imageUrl?.length) return
        setCurrentImageIndex((prev) => (prev - 1 + supplier.imageUrl.length) % supplier.imageUrl.length)
    }

    const handleBookService = (service?: any) => {
        if (service) {
            setSelectedService(service)
        }
        setShowBookingModal(true)
    }

    const handleOpenReviewModal = (service: CompletedOrder) => {
        setServiceToReview(service)
        setShowReviewModal(true)
    }

    const handleSubmitReview = async (rating: number, content: string) => {
        if (!serviceToReview) return

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const newReview: Review = {
                    id: `review${Date.now()}`,
                    userName: "Bạn",
                    userAvatar: "/placeholder.svg?height=40&width=40&text=B",
                    rating,
                    content,
                    createdAt: new Date().toISOString().split("T")[0],
                }

                setReviews([newReview, ...reviews])
                setCompletedOrders(
                    completedOrders.map((order) => (order.id === serviceToReview.id ? { ...order, hasReviewed: true } : order)),
                )

                resolve()
            }, 1000)
        })
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const hasCompletedOrdersToReview = completedOrders.some((order) => !order.hasReviewed)
    const indexOfLastReview = currentPage * reviewsPerPage
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview)
    const totalPages = Math.ceil(reviews.length / reviewsPerPage)

    if (loading) {
        return <LoadingState />
    }

    if (!supplier) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy nhà cung cấp</h2>
                    <p className="text-gray-500">Nhà cung cấp này có thể đã bị xóa hoặc không tồn tại.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-96 overflow-hidden">
                {supplier.imageUrl?.length > 0 ? (
                    <>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentImageIndex}
                                className="relative w-full h-full"
                                initial={{ opacity: 0, x: 300 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -300 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Image
                                    src={supplier.imageUrl[currentImageIndex] || "/placeholder.svg?height=384&width=1200"}
                                    alt={supplier.name}
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                        </AnimatePresence>

                        <div className="absolute inset-0 bg-black/20" />

                        {supplier.imageUrl.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>

                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                    {supplier.imageUrl.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? "bg-white" : "bg-white/50"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <Package className="h-16 w-16 mx-auto mb-4" />
                            <p>Chưa có hình ảnh</p>
                        </div>
                    </div>
                )}

                <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className={`rounded-full w-10 h-10 p-0 ${isFavorite ? "bg-rose-100 text-rose-500 hover:bg-rose-200" : "bg-white/80 hover:bg-white"
                            }`}
                        onClick={toggleFavorite}
                    >
                        <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500" : ""}`} />
                    </Button>
                    <Button size="sm" variant="ghost" className="bg-white/80 hover:bg-white rounded-full w-10 h-10 p-0">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-3">{supplier.name}</h1>
                                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                                        {supplier.rating && supplier.reviewCount ? (
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{supplier.rating}</span>
                                                <span>({supplier.reviewCount} đánh giá)</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <Star className="h-4 w-4" />
                                                <span className="text-sm">Chưa có đánh giá</span>
                                            </div>
                                        )}
                                        <Badge variant="secondary">{supplier.serviceType}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 text-gray-600">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <span>{supplier.address}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <span>{supplier.phone}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <span>{supplier.email}</span>
                                </div>
                            </div>

                            {/* Alert for completed orders */}
                            {isLoggedIn && hasCompletedOrdersToReview && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                                    <Alert className="bg-blue-50 border-blue-200">
                                        <AlertCircle className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">
                                            Bạn có dịch vụ đã hoàn thành. Hãy đánh giá để giúp người khác có trải nghiệm tốt hơn!
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}

                            <Tabs defaultValue="description" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="description" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Mô tả
                                    </TabsTrigger>
                                    <TabsTrigger value="services" className="flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Dịch vụ ({supplier.services?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="reviews" className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Đánh giá ({reviews.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="description" className="mt-6">
                                    {supplier.description ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                                            <Card>
                                                <CardContent className="p-6">
                                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{supplier.description}</p>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ) : (
                                        <EmptyDescription />
                                    )}
                                </TabsContent>

                                <TabsContent value="services" className="mt-6">
                                    {supplier.services?.length > 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="space-y-4"
                                        >
                                            {supplier.services.map((service, index) => (
                                                <motion.div
                                                    key={service.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 * index }}
                                                >
                                                    <Card className="hover:shadow-md transition-shadow">
                                                        <CardContent className="p-6">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                                                                    <p className="text-gray-600 mb-4">{service.description}</p>
                                                                    <div className="flex items-center gap-2">
                                                                        {service.salePrice && (
                                                                            <span className="text-gray-500 line-through">
                                                                                {service.price.toLocaleString()}đ
                                                                            </span>
                                                                        )}
                                                                        <span className="text-xl font-bold text-emerald-600">
                                                                            {(service.salePrice || service.price).toLocaleString()}đ
                                                                        </span>
                                                                        {service.salePrice && (
                                                                            <Badge variant="destructive" className="text-xs">
                                                                                Giảm {Math.round(((service.price - service.salePrice) / service.price) * 100)}%
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-2 ml-4">
                                                                    <Button onClick={() => handleBookService(service)}>
                                                                        <Calendar className="h-4 w-4 mr-2" />
                                                                        Đặt lịch
                                                                    </Button>
                                                                    {isLoggedIn &&
                                                                        completedOrders.some(
                                                                            (order) => order.serviceId === service.id && !order.hasReviewed,
                                                                        ) && (
                                                                            <Button
                                                                                variant="outline"
                                                                                onClick={() =>
                                                                                    handleOpenReviewModal(
                                                                                        completedOrders.find(
                                                                                            (order) => order.serviceId === service.id && !order.hasReviewed,
                                                                                        )!,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                                                Đánh giá
                                                                            </Button>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <EmptyServices />
                                    )}
                                </TabsContent>

                                <TabsContent value="reviews" className="mt-6">
                                    {reviews.length > 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="space-y-6"
                                        >
                                            {currentReviews.map((review, index) => (
                                                <motion.div
                                                    key={review.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 * index }}
                                                >
                                                    <Card>
                                                        <CardContent className="p-6">
                                                            <div className="flex items-start gap-4">
                                                                <Avatar>
                                                                    <AvatarImage src={"https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light"} />
                                                                    <AvatarFallback>{review.userName}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <h4 className="font-medium">{review.userName}</h4>
                                                                        <div className="flex items-center">
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <Star
                                                                                    key={i}
                                                                                    className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                                                                        }`}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                            <Clock className="h-3 w-3" />
                                                                            {review.createdAt}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-gray-700">{review.content}</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}

                                            {totalPages > 1 && (
                                                <Pagination className="mt-8">
                                                    <PaginationContent>
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                            />
                                                        </PaginationItem>

                                                        {Array.from({ length: totalPages }).map((_, index) => {
                                                            const pageNumber = index + 1
                                                            if (
                                                                pageNumber === 1 ||
                                                                pageNumber === totalPages ||
                                                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                                            ) {
                                                                return (
                                                                    <PaginationItem key={pageNumber}>
                                                                        <PaginationLink
                                                                            isActive={pageNumber === currentPage}
                                                                            onClick={() => handlePageChange(pageNumber)}
                                                                        >
                                                                            {pageNumber}
                                                                        </PaginationLink>
                                                                    </PaginationItem>
                                                                )
                                                            }

                                                            if (
                                                                (pageNumber === 2 && currentPage > 3) ||
                                                                (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                                                            ) {
                                                                return (
                                                                    <PaginationItem key={pageNumber}>
                                                                        <span className="px-2">...</span>
                                                                    </PaginationItem>
                                                                )
                                                            }

                                                            return null
                                                        })}

                                                        <PaginationItem>
                                                            <PaginationNext
                                                                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                                                className={
                                                                    currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                                                                }
                                                            />
                                                        </PaginationItem>
                                                    </PaginationContent>
                                                </Pagination>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <EmptyReviews />
                                    )}
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="sticky top-8 space-y-6"
                        >
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">Đặt lịch nhanh</h3>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button className="w-full" size="lg" onClick={() => handleBookService()}>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Đặt lịch ngay
                                    </Button>
                                    <div className="text-center text-sm text-gray-500">
                                        Hoặc gọi trực tiếp:
                                        <a href={`tel:${supplier.phone}`} className="text-blue-600 hover:underline ml-1">
                                            {supplier.phone}
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>

                            {isLoggedIn && hasCompletedOrdersToReview && (
                                <Card>
                                    <CardHeader>
                                        <h3 className="text-lg font-semibold">Dịch vụ cần đánh giá</h3>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {completedOrders
                                            .filter((order) => !order.hasReviewed)
                                            .map((order) => (
                                                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{order.serviceName}</p>
                                                        <p className="text-xs text-gray-500">Mã đơn: {order.orderCode}</p>
                                                    </div>
                                                    <Button size="sm" variant="outline" onClick={() => handleOpenReviewModal(order)}>
                                                        <MessageSquare className="h-3 w-3 mr-1" />
                                                        Đánh giá
                                                    </Button>
                                                </div>
                                            ))}
                                    </CardContent>
                                </Card>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                supplier={supplier}
                service={selectedService}
            />

            {serviceToReview && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    order={serviceToReview}
                    onReviewSubmitted={fetchReviews}
                />
            )}
        </div>
    )
}
