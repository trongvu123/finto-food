"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Calendar, CreditCard, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAppStore } from "../app-provider"

interface BookingModalProps {
    isOpen: boolean
    onClose: () => void
    supplier: any
    service: any
}

interface PetInfo {
    name: string
    breed: string
    age: string
    weight: string
    gender: string
    image: File | null
    imageUrl?: string // Add imageUrl to store the URL from upload API
    note: string
    status: string
}

export default function BookingModal({ isOpen, onClose, supplier, service }: BookingModalProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("user-info")
    const [loading, setLoading] = useState(false)
    const user = useAppStore((state) => state.user)
    const [userInfo, setUserInfo] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        note: "",
    })
    const [petInfo, setPetInfo] = useState<PetInfo>({
        name: "",
        breed: "",
        age: "",
        weight: "",
        gender: "",
        image: null,
        note: "",
        status: "",
    })
    const [orderTime, setOrderTime] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("")

    const handleUserInfoChange = (field: string, value: string) => {
        setUserInfo((prev) => ({ ...prev, [field]: value }))
    }

    const handlePetInfoChange = (field: string, value: string) => {
        setPetInfo((prev) => ({ ...prev, [field]: value }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setPetInfo((prev) => ({ ...prev, image: file }))
        }
    }

    const uploadImage = async (image: File): Promise<string> => {
        const formData = new FormData()
        formData.append("file", image)

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Image upload failed")
            }

            const data = await response.json()
            return data.url
        } catch (error: any) {
            toast({
                title: "Lỗi!",
                description: "Tải ảnh lên thất bại.",
                variant: "destructive",
            })
            throw error // Re-throw to be caught in handleSubmit
        }
    }

    const createServiceOrder = async (imageUrl: string) => {
        try {
            const response = await fetch("/api/service-orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    serviceId: service.id,
                    userId: user?.id, // Replace with actual user ID
                    userName: userInfo.name,
                    userPhone: userInfo.phone,
                    userAddress: userInfo.address,
                    userEmail: userInfo.email,
                    userNote: userInfo.note,
                    petName: petInfo.name,
                    petBreed: petInfo.breed,
                    petAge: petInfo.age,
                    petWeight: petInfo.weight,
                    petGender: petInfo.gender,
                    petImage: imageUrl,
                    petNote: petInfo.note,
                    petStatus: petInfo.status,
                    orderTime: orderTime,
                    total: service.salePrice || service.price,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to create service order")
            }

            const data = await response.json()
            return data
        } catch (error: any) {
            toast({
                title: "Lỗi!",
                description: "Đặt lịch thất bại.",
                variant: "destructive",
            })
            throw error // Re-throw to be caught in handleSubmit
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            if (!petInfo.image) {
                throw new Error("Please upload a pet image")
            }

            const imageUrl = await uploadImage(petInfo.image)
            const orderCode = await createServiceOrder(imageUrl)

            router.push(
                `/thanh-toan-dich-vu?orderId=${orderCode.id}`,
            )
            onClose()
        } catch (error: any) {
            console.error("Error during booking:", error)
            // Error messages are displayed by uploadImage and createServiceOrder
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div>
                            <h2 className="text-xl font-semibold">Đặt lịch dịch vụ</h2>
                            <p className="text-gray-600">
                                {service.name} - {supplier.name}
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="user-info">Thông tin khách hàng</TabsTrigger>
                                <TabsTrigger value="pet-info">Thông tin thú cưng</TabsTrigger>
                            </TabsList>

                            <TabsContent value="user-info" className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <div>
                                        <Label htmlFor="userName">Họ và tên *</Label>
                                        <Input
                                            id="userName"
                                            value={userInfo.name}
                                            onChange={(e) => handleUserInfoChange("name", e.target.value)}
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="userPhone">Số điện thoại *</Label>
                                        <Input
                                            id="userPhone"
                                            value={userInfo.phone}
                                            onChange={(e) => handleUserInfoChange("phone", e.target.value)}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="userEmail">Email</Label>
                                        <Input
                                            id="userEmail"
                                            type="email"
                                            value={userInfo.email}
                                            onChange={(e) => handleUserInfoChange("email", e.target.value)}
                                            placeholder="Nhập email"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="orderTime">Thời gian đặt lịch *</Label>
                                        <Input
                                            id="orderTime"
                                            type="datetime-local"
                                            value={orderTime}
                                            onChange={(e) => setOrderTime(e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="userAddress">Địa chỉ</Label>
                                        <Input
                                            id="userAddress"
                                            value={userInfo.address}
                                            onChange={(e) => handleUserInfoChange("address", e.target.value)}
                                            placeholder="Nhập địa chỉ"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="userNote">Ghi chú</Label>
                                        <Textarea
                                            id="userNote"
                                            value={userInfo.note}
                                            onChange={(e) => handleUserInfoChange("note", e.target.value)}
                                            placeholder="Ghi chú thêm (nếu có)"
                                            rows={3}
                                        />
                                    </div>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="pet-info" className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <div>
                                        <Label htmlFor="petName">Tên thú cưng *</Label>
                                        <Input
                                            id="petName"
                                            value={petInfo.name}
                                            onChange={(e) => handlePetInfoChange("name", e.target.value)}
                                            placeholder="Nhập tên thú cưng"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="petBreed">Giống loài</Label>
                                        <Input
                                            id="petBreed"
                                            value={petInfo.breed}
                                            onChange={(e) => handlePetInfoChange("breed", e.target.value)}
                                            placeholder="Ví dụ: Golden Retriever"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="petAge">Tuổi</Label>
                                        <Input
                                            id="petAge"
                                            type="number"
                                            value={petInfo.age}
                                            onChange={(e) => handlePetInfoChange("age", e.target.value)}
                                            placeholder="Tuổi (tháng)"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="petWeight">Cân nặng (kg)</Label>
                                        <Input
                                            id="petWeight"
                                            type="number"
                                            step="0.1"
                                            value={petInfo.weight}
                                            onChange={(e) => handlePetInfoChange("weight", e.target.value)}
                                            placeholder="Cân nặng"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="petGender">Giới tính</Label>
                                        <Select value={petInfo.gender} onValueChange={(value) => handlePetInfoChange("gender", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn giới tính" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Đực</SelectItem>
                                                <SelectItem value="female">Cái</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="petStatus">Tình trạng sức khỏe</Label>
                                        <Input
                                            id="petStatus"
                                            value={petInfo.status}
                                            onChange={(e) => handlePetInfoChange("status", e.target.value)}
                                            placeholder="Ví dụ: Khỏe mạnh, có dị ứng..."
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="petImage">Hình ảnh thú cưng</Label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label
                                                        htmlFor="petImage"
                                                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                                    >
                                                        <span>Tải lên hình ảnh</span>
                                                        <input
                                                            id="petImage"
                                                            type="file"
                                                            className="sr-only"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                        />
                                                    </label>
                                                    <p className="pl-1">hoặc kéo thả</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                                                {petInfo.image && <p className="text-sm text-green-600">Đã chọn: {petInfo.image.name}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="petNote">Ghi chú về thú cưng</Label>
                                        <Textarea
                                            id="petNote"
                                            value={petInfo.note}
                                            onChange={(e) => handlePetInfoChange("note", e.target.value)}
                                            placeholder="Thông tin đặc biệt về thú cưng (tính cách, sở thích, điều cần lưu ý...)"
                                            rows={3}
                                        />
                                    </div>
                                </motion.div>
                            </TabsContent>
                        </Tabs>

                        {/* Service Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-6"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h4 className="font-medium">{service.name}</h4>
                                            <p className="text-sm text-gray-600">{supplier.name}</p>
                                        </div>
                                        <div className="text-right">
                                            {service.salePrice && (
                                                <div className="text-sm text-gray-500 line-through">{service.price.toLocaleString()}đ</div>
                                            )}
                                            <div className="text-lg font-bold text-blue-600">
                                                {(service.salePrice || service.price).toLocaleString()}đ
                                            </div>
                                        </div>
                                    </div>
                                    {orderTime && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                            <Calendar className="h-4 w-4" />
                                            <span>Thời gian: {new Date(orderTime).toLocaleString("vi-VN")}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center text-lg font-bold">
                                            <span>Tổng cộng:</span>
                                            <span className="text-blue-600">{(service.salePrice || service.price).toLocaleString()}đ</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Payment Methods */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6"
                        >
                            <h3 className="text-lg font-semibold mb-4">Phương thức thanh toán</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card
                                    className={`cursor-pointer transition-all ${paymentMethod === "after_service" ? "ring-2 ring-blue-500" : ""}`}
                                    onClick={() => setPaymentMethod("after_service")}
                                >
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <Banknote className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Thanh toán sau khi hoàn thành</h4>
                                            <p className="text-sm text-gray-600">Thanh toán trực tiếp tại cửa hàng</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card
                                    className={`cursor-pointer transition-all ${paymentMethod === "bank_transfer" ? "ring-2 ring-blue-500" : ""}`}
                                    onClick={() => setPaymentMethod("bank_transfer")}
                                >
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Chuyển khoản ngân hàng</h4>
                                            <p className="text-sm text-gray-600">Thanh toán trước qua ngân hàng</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                        <Button variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <div className="flex gap-3">
                            {activeTab === "user-info" && <Button onClick={() => setActiveTab("pet-info")}>Tiếp theo</Button>}
                            {activeTab === "pet-info" && (
                                <>
                                    <Button variant="outline" onClick={() => setActiveTab("user-info")}>
                                        Quay lại
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!userInfo.name || !userInfo.phone || !petInfo.name || !orderTime || !paymentMethod}
                                    >
                                        Xác nhận đặt lịch
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
