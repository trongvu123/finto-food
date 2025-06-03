"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Edit, Trash2, Eye, DollarSign, Tag, Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

interface Service {
    id: string
    name: string
    description: string
    price: number
    salePrice?: number
    supplierId: string
    supplier: {
        id: string
        name: string
    }
    category: string
    status: string
    images: string[]
    createdAt: string
}

interface Supplier {
    id: string
    name: string
}

export default function ServiceManagement() {
    const [services, setServices] = useState<Service[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filterSupplier, setFilterSupplier] = useState("all")
    const [filterCategory, setFilterCategory] = useState("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)
    const [newService, setNewService] = useState({
        name: "",
        description: "",
        price: "",
        salePrice: "",
        supplierId: "",
        category: "",
    })
    const [uploadedImages, setUploadedImages] = useState<File[]>([])
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

    useEffect(() => {
        fetchServices()
        fetchSuppliers()
    }, [])

    const fetchServices = async () => {
        try {
            const response = await fetch("/api/services")
            const data = await response.json()
            setServices(data)
        } catch (error) {
            toast.error("Failed to fetch services")
        }
    }

    const fetchSuppliers = async () => {
        try {
            const response = await fetch("/api/suppliers")
            const data = await response.json()
            setSuppliers(data)
        } catch (error) {
            toast.error("Failed to fetch suppliers")
        }
    }

    const filteredServices = services.filter((service) => {
        const matchesSearch =
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSupplier = filterSupplier === "all" || service.supplierId === filterSupplier
        const matchesCategory = filterCategory === "all" || service.category === filterCategory

        return matchesSearch && matchesSupplier && matchesCategory
    })

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        // Giới hạn tối đa 5 ảnh
        const remainingSlots = 5 - uploadedImages.length
        const filesToAdd = files.slice(0, remainingSlots)

        // Upload each file to Cloudinary
        for (const file of filesToAdd) {
            try {
                const formData = new FormData()
                formData.append("file", file)

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) throw new Error("Failed to upload image")

                const data = await response.json()
                setImagePreviewUrls((prev) => [...prev, data.url])
                setUploadedImages((prev) => [...prev, file])
            } catch (error) {
                console.error("Error uploading image:", error)
                toast.error("Failed to upload image")
            }
        }
    }

    const removeImage = (index: number) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index))
        setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
    }

    const resetForm = () => {
        setNewService({
            name: "",
            description: "",
            price: "",
            salePrice: "",
            supplierId: "",
            category: "",
        })
        setUploadedImages([])
        setImagePreviewUrls([])
    }

    const handleAddService = async () => {
        try {
            // Upload all images to Cloudinary first
            const uploadedImageUrls = await Promise.all(
                uploadedImages.map(async (file) => {
                    const formData = new FormData()
                    formData.append("file", file)

                    const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                    })

                    if (!response.ok) throw new Error("Failed to upload image")
                    const data = await response.json()
                    return data.url
                })
            )

            // Combine existing preview URLs with newly uploaded URLs
            const allImageUrls = [...imagePreviewUrls, ...uploadedImageUrls]

            // Add the service with all image URLs
            const response = await fetch("/api/services", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...newService,
                    price: Number(newService.price),
                    salePrice: newService.salePrice ? Number(newService.salePrice) : undefined,
                    images: allImageUrls,
                }),
            })

            if (!response.ok) throw new Error("Failed to add service")

            await fetchServices()
            resetForm()
            setIsAddDialogOpen(false)
            toast.success("Service added successfully")
        } catch (error) {
            console.error("Error adding service:", error)
            toast.error("Failed to add service")
        }
    }

    const handleEditService = (service: Service) => {
        setEditingService(service)
        setNewService({
            name: service.name,
            description: service.description,
            price: service.price.toString(),
            salePrice: service.salePrice?.toString() || "",
            supplierId: service.supplierId,
            category: service.category,
        })
        setImagePreviewUrls(service.images)
        setUploadedImages([]) // Reset uploaded files for editing
    }

    const handleUpdateService = async () => {
        if (!editingService) return

        try {
            const response = await fetch("/api/services", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: editingService.id,
                    ...newService,
                    price: Number(newService.price),
                    salePrice: newService.salePrice ? Number(newService.salePrice) : undefined,
                    images: imagePreviewUrls,
                }),
            })

            if (!response.ok) throw new Error("Failed to update service")

            await fetchServices()
            setEditingService(null)
            resetForm()
            toast.success("Service updated successfully")
        } catch (error) {
            toast.error("Failed to update service")
        }
    }

    const handleDeleteService = async (id: string) => {
        try {
            const response = await fetch(`/api/services/?id=${id}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Failed to delete service")

            // Update local state after successful API call
            setServices(services.filter((s) => s.id !== id))
            toast.success("Service deleted successfully")
        } catch (error) {
            console.error("Error deleting service:", error)
            toast.error("Failed to delete service")
        }
    }

    const toggleServiceStatus = async (id: string) => {
        try {
            const service = services.find(s => s.id === id)
            if (!service) return

            const newStatus = service.status === "active" ? "inactive" : "active"

            const response = await fetch(`/api/services/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!response.ok) throw new Error("Failed to update service status")

            // Update local state after successful API call
            setServices(
                services.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
            )

            toast.success(`Service ${newStatus === "active" ? "activated" : "deactivated"} successfully`)
        } catch (error) {
            console.error("Error updating service status:", error)
            toast.error("Failed to update service status")
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Quản lý dịch vụ</h2>
                    <p className="text-gray-600">Quản lý các dịch vụ của nhà cung cấp</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm dịch vụ
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Thêm dịch vụ mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-6 py-4">
                            {/* Left Column - Service Info */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Tên dịch vụ *</Label>
                                    <Input
                                        id="name"
                                        value={newService.name}
                                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                        placeholder="Nhập tên dịch vụ"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="supplier">Nhà cung cấp *</Label>
                                    <Select
                                        value={newService.supplierId}
                                        onValueChange={(value) => setNewService({ ...newService, supplierId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn nhà cung cấp" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id}>
                                                    {supplier.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="category">Danh mục *</Label>
                                    <Select
                                        value={newService.category}
                                        onValueChange={(value) => setNewService({ ...newService, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="spa">Spa</SelectItem>
                                            <SelectItem value="khách sạn thú cưng">Khách sạn thú cưng</SelectItem>
                                            <SelectItem value="chăm sóc sức khỏe">Chăm sóc sức khỏe</SelectItem>
                                            <SelectItem value="chải lông">Chải lông</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="price">Giá gốc (VNĐ) *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={newService.price}
                                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                            placeholder="Nhập giá gốc"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="salePrice">Giá khuyến mãi (VNĐ)</Label>
                                        <Input
                                            id="salePrice"
                                            type="number"
                                            value={newService.salePrice}
                                            onChange={(e) => setNewService({ ...newService, salePrice: e.target.value })}
                                            placeholder="Nhập giá khuyến mãi"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Mô tả dịch vụ *</Label>
                                    <Textarea
                                        id="description"
                                        value={newService.description}
                                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                        placeholder="Nhập mô tả chi tiết về dịch vụ"
                                        rows={4}
                                    />
                                </div>
                            </div>

                            {/* Right Column - Image Upload */}
                            <div className="space-y-4">
                                <div>
                                    <Label>Hình ảnh dịch vụ</Label>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Tải lên tối đa 5 hình ảnh (PNG, JPG, GIF tối đa 10MB mỗi ảnh)
                                    </p>

                                    {/* Upload Area */}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                            disabled={uploadedImages.length >= 5}
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className={`cursor-pointer ${uploadedImages.length >= 5 ? "cursor-not-allowed opacity-50" : ""}`}
                                        >
                                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-sm text-gray-600">
                                                {uploadedImages.length >= 5
                                                    ? "Đã đạt giới hạn tối đa 5 ảnh"
                                                    : "Nhấp để chọn ảnh hoặc kéo thả vào đây"}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{uploadedImages.length}/5 ảnh đã chọn</p>
                                        </label>
                                    </div>

                                    {/* Image Previews */}
                                    {imagePreviewUrls.length > 0 && (
                                        <div className="mt-4">
                                            <Label className="text-sm font-medium">Xem trước ảnh:</Label>
                                            <div className="grid grid-cols-2 gap-3 mt-2">
                                                {imagePreviewUrls.map((url, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="relative group"
                                                    >
                                                        <img
                                                            src={url || "/placeholder.svg"}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg border"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                                            <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Upload Tips */}
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="p-4">
                                        <h4 className="font-medium text-blue-900 mb-2">💡 Mẹo tải ảnh hiệu quả:</h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Sử dụng ảnh có độ phân giải cao (ít nhất 800x600px)</li>
                                            <li>• Ảnh đầu tiên sẽ được dùng làm ảnh đại diện</li>
                                            <li>• Chụp ảnh trong điều kiện ánh sáng tốt</li>
                                            <li>• Tránh ảnh bị mờ hoặc quá tối</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAddDialogOpen(false)
                                    resetForm()
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleAddService}
                                disabled={!newService.name || !newService.supplierId || !newService.category || !newService.price}
                            >
                                Thêm dịch vụ
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Tìm kiếm dịch vụ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Chọn nhà cung cấp" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                                {suppliers.map((supplier) => (
                                    <SelectItem key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Danh mục" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả danh mục</SelectItem>
                                <SelectItem value="spa">Spa</SelectItem>
                                <SelectItem value="khách sạn thú cưng">Khách sạn thú cưng</SelectItem>
                                <SelectItem value="chăm sóc sức khỏe">Chăm sóc sức khỏe</SelectItem>
                                <SelectItem value="chải lông">Chải lông</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Services Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách dịch vụ ({filteredServices.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dịch vụ</TableHead>
                                <TableHead>Nhà cung cấp</TableHead>
                                <TableHead>Danh mục</TableHead>
                                <TableHead>Giá</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {filteredServices.map((service) => (
                                    <motion.tr
                                        key={service.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={service.images[0] || "/placeholder.svg"}
                                                    alt={service.name}
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                                <div>
                                                    <div className="font-medium">{service.name}</div>
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">{service.description}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{service.supplier.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                <Tag className="h-3 w-3 mr-1" />
                                                {service.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {service.salePrice && (
                                                    <div className="text-sm text-gray-500 line-through">{service.price.toLocaleString()}đ</div>
                                                )}
                                                <div className="font-medium flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    {(service.salePrice || service.price).toLocaleString()}đ
                                                </div>
                                                {service.salePrice && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Giảm {Math.round((1 - service.salePrice / service.price) * 100)}%
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={service.status === "active" ? "default" : "secondary"}>
                                                {service.status === "active" ? "Hoạt động" : "Tạm dừng"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Xem chi tiết
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditService(service)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toggleServiceStatus(service.id)}>
                                                        {service.status === "active" ? "Tạm dừng" : "Kích hoạt"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteService(service.id)}>
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                        {/* Left Column - Service Info */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Tên dịch vụ *</Label>
                                <Input
                                    id="edit-name"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                    placeholder="Nhập tên dịch vụ"
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-supplier">Nhà cung cấp *</Label>
                                <Select
                                    value={newService.supplierId}
                                    onValueChange={(value) => setNewService({ ...newService, supplierId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn nhà cung cấp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit-category">Danh mục *</Label>
                                <Select
                                    value={newService.category}
                                    onValueChange={(value) => setNewService({ ...newService, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="spa">Spa</SelectItem>
                                        <SelectItem value="khách sạn thú cưng">Khách sạn thú cưng</SelectItem>
                                        <SelectItem value="chăm sóc sức khỏe">Chăm sóc sức khỏe</SelectItem>
                                        <SelectItem value="chải lông">Chải lông</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-price">Giá gốc (VNĐ) *</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        value={newService.price}
                                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                        placeholder="Nhập giá gốc"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-salePrice">Giá khuyến mãi (VNĐ)</Label>
                                    <Input
                                        id="edit-salePrice"
                                        type="number"
                                        value={newService.salePrice}
                                        onChange={(e) => setNewService({ ...newService, salePrice: e.target.value })}
                                        placeholder="Nhập giá khuyến mãi"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-description">Mô tả dịch vụ *</Label>
                                <Textarea
                                    id="edit-description"
                                    value={newService.description}
                                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                    placeholder="Nhập mô tả chi tiết về dịch vụ"
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Right Column - Image Upload */}
                        <div className="space-y-4">
                            <div>
                                <Label>Hình ảnh dịch vụ</Label>
                                <p className="text-sm text-gray-500 mb-3">Tải lên tối đa 5 hình ảnh</p>

                                {/* Upload Area */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="edit-image-upload"
                                        disabled={uploadedImages.length >= 5}
                                    />
                                    <label
                                        htmlFor="edit-image-upload"
                                        className={`cursor-pointer ${uploadedImages.length >= 5 ? "cursor-not-allowed opacity-50" : ""}`}
                                    >
                                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-sm text-gray-600">
                                            {uploadedImages.length >= 5
                                                ? "Đã đạt giới hạn tối đa 5 ảnh"
                                                : "Nhấp để chọn ảnh hoặc kéo thả vào đây"}
                                        </p>
                                    </label>
                                </div>

                                {/* Image Previews */}
                                {imagePreviewUrls.length > 0 && (
                                    <div className="mt-4">
                                        <Label className="text-sm font-medium">Xem trước ảnh:</Label>
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            {imagePreviewUrls.map((url, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="relative group"
                                                >
                                                    <img
                                                        src={url || "/placeholder.svg"}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditingService(null)
                                resetForm()
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleUpdateService}>Cập nhật</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
