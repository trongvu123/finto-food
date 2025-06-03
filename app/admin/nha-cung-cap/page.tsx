"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Edit, Trash2, Eye, MapPin, Phone, Mail, Upload, X, ImageIcon } from "lucide-react"
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
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Supplier {
    id: string
    name: string
    email: string
    phone: string
    address: string
    city: string
    serviceType: string
    imageUrls: string[]
    description: string
    services: {
        id: string
        name: string
    }[]
    createdAt: string
}

export default function SupplierManagement() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filterCity, setFilterCity] = useState("all")
    const [filterServiceType, setFilterServiceType] = useState("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [newSupplier, setNewSupplier] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        serviceType: "",
        imageUrls: [] as string[],
        description: "",
    })

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const fetchSuppliers = async () => {
        try {
            const response = await fetch("/api/suppliers")
            const data = await response.json()
            setSuppliers(data)
        } catch (error) {
            toast.error("Failed to fetch suppliers")
        }
    }

    const handleImageUpload = async (file: File) => {
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file ảnh")
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước file không được vượt quá 5MB")
            return
        }

        setUploadingImage(true)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Upload failed")
            }

            const data = await response.json()
            // Add the new image URL to the existing array
            setNewSupplier({
                ...newSupplier,
                imageUrls: [...newSupplier.imageUrls, data.url],
            })
            toast.success("Tải ảnh lên thành công")
        } catch (error) {
            toast.error("Lỗi khi tải ảnh lên")
        } finally {
            setUploadingImage(false)
        }
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files || files.length === 0) return

        // Upload each selected file
        Array.from(files).forEach((file) => {
            handleImageUpload(file)
        })

        // Reset the input value to allow selecting the same file again
        event.target.value = ""
    }

    const removeImage = (indexToRemove: number) => {
        setNewSupplier({
            ...newSupplier,
            imageUrls: newSupplier.imageUrls.filter((_, index) => index !== indexToRemove),
        })
    }

    const filteredSuppliers = suppliers.filter((supplier) => {
        const matchesSearch =
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCity = filterCity === "all" || supplier.city === filterCity
        const matchesServiceType = filterServiceType === "all" || supplier.serviceType === filterServiceType

        return matchesSearch && matchesCity && matchesServiceType
    })

    const resetForm = () => {
        setNewSupplier({
            name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            serviceType: "",
            imageUrls: [],
            description: "",
        })
    }

    const handleAddSupplier = async () => {
        try {
            const response = await fetch("/api/suppliers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newSupplier),
            })

            if (!response.ok) throw new Error("Failed to add supplier")

            await fetchSuppliers()
            resetForm()
            setIsAddDialogOpen(false)
            toast.success("Supplier added successfully")
        } catch (error) {
            toast.error("Failed to add supplier")
        }
    }

    const handleEditSupplier = (supplier: Supplier) => {
        setEditingSupplier(supplier)
        setNewSupplier({
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            city: supplier.city,
            serviceType: supplier.serviceType,
            imageUrls: supplier.imageUrls || [],
            description: supplier.description || "",
        })
    }

    const handleUpdateSupplier = async () => {
        if (!editingSupplier) return

        try {
            const response = await fetch("/api/suppliers", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: editingSupplier.id,
                    ...newSupplier,
                }),
            })

            if (!response.ok) throw new Error("Failed to update supplier")

            await fetchSuppliers()
            setEditingSupplier(null)
            resetForm()
            toast.success("Supplier updated successfully")
        } catch (error) {
            toast.error("Failed to update supplier")
        }
    }

    const handleDeleteSupplier = async (id: string) => {
        try {
            const response = await fetch(`/api/suppliers?id=${id}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Failed to delete supplier")

            await fetchSuppliers()
            toast.success("Supplier deleted successfully")
        } catch (error) {
            toast.error("Failed to delete supplier")
        }
    }

    const SupplierForm = () => (
        <div className="grid grid-cols-2 gap-4 py-4">
            {/* Image Upload Section */}
            <div className="col-span-2">
                <Label>Ảnh nhà cung cấp</Label>
                <div className="mt-2">
                    {newSupplier.imageUrls.length > 0 ? (
                        <div>
                            <div className="flex flex-wrap gap-3 mb-3">
                                {newSupplier.imageUrls.map((url, index) => (
                                    <div key={index} className="relative">
                                        <Image
                                            src={url || "/placeholder.svg"}
                                            alt={`Supplier image ${index + 1}`}
                                            width={120}
                                            height={90}
                                            className="rounded-lg object-cover border h-[90px]"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <Label htmlFor="image-upload" className="cursor-pointer">
                                    <span className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        {uploadingImage ? "Đang tải lên..." : "Thêm ảnh"}
                                    </span>
                                    <Input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                        disabled={uploadingImage}
                                        multiple
                                    />
                                </Label>
                            </div>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-2">
                                <Label htmlFor="image-upload" className="cursor-pointer">
                                    <span className="text-sm text-blue-600 hover:text-blue-500">
                                        {uploadingImage ? "Đang tải lên..." : "Chọn ảnh để tải lên"}
                                    </span>
                                    <Input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                        disabled={uploadingImage}
                                        multiple
                                    />
                                </Label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF tối đa 5MB</p>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <Label htmlFor="name">Tên nhà cung cấp *</Label>
                <Input
                    id="name"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    placeholder="Nhập tên nhà cung cấp"
                />
            </div>
            <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                    id="email"
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    placeholder="Nhập email"
                />
            </div>
            <div>
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                    id="phone"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                />
            </div>
            <div>
                <Label htmlFor="city">Thành phố *</Label>
                <Select value={newSupplier.city} onValueChange={(value) => setNewSupplier({ ...newSupplier, city: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                        <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                        <SelectItem value="Thành phố Hồ Chí Minh">TP. Hồ Chí Minh</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="serviceType">Loại dịch vụ *</Label>
                <Select
                    value={newSupplier.serviceType}
                    onValueChange={(value) => setNewSupplier({ ...newSupplier, serviceType: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn loại dịch vụ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="spa">Spa</SelectItem>
                        <SelectItem value="khách sạn thú cưng">Khách sạn thú cưng</SelectItem>
                        <SelectItem value="chăm sóc sức khỏe">Chăm sóc sức khỏe</SelectItem>
                        <SelectItem value="chải lông">Chải lông</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="address">Địa chỉ *</Label>
                <Input
                    id="address"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    placeholder="Nhập địa chỉ chi tiết"
                />
            </div>
            <div className="col-span-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                    id="description"
                    value={newSupplier.description}
                    onChange={(e) => setNewSupplier({ ...newSupplier, description: e.target.value })}
                    placeholder="Nhập mô tả"
                    rows={3}
                />
            </div>
        </div>
    )

    // Component to display image gallery with preview dialog
    const ImageGallery = ({ images }: { images: string[] }) => {
        const [previewOpen, setPreviewOpen] = useState(false)
        const [selectedImageIndex, setSelectedImageIndex] = useState(0)

        if (!images || images.length === 0) {
            return (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                </div>
            )
        }

        return (
            <>
                <div className="flex gap-1">
                    <div
                        className="relative cursor-pointer"
                        onClick={() => {
                            setSelectedImageIndex(0)
                            setPreviewOpen(true)
                        }}
                    >
                        <Image
                            src={images[0] || "/placeholder.svg"}
                            alt="Primary image"
                            width={50}
                            height={50}
                            className="rounded-lg object-cover h-[50px]"
                        />
                        {images.length > 1 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white text-xs font-medium">
                                +{images.length - 1}
                            </div>
                        )}
                    </div>
                </div>

                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Ảnh nhà cung cấp</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-full h-[400px]">
                                <Image
                                    src={images[selectedImageIndex] || "/placeholder.svg"}
                                    alt={`Image ${selectedImageIndex + 1}`}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <ScrollArea className="w-full">
                                <div className="flex gap-2 py-2 px-1">
                                    {images.map((image, index) => (
                                        <div
                                            key={index}
                                            className={`cursor-pointer border-2 rounded-md ${selectedImageIndex === index ? "border-blue-500" : "border-transparent"}`}
                                            onClick={() => setSelectedImageIndex(index)}
                                        >
                                            <Image
                                                src={image || "/placeholder.svg"}
                                                alt={`Thumbnail ${index + 1}`}
                                                width={80}
                                                height={60}
                                                className="rounded object-cover h-[60px]"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Quản lý nhà cung cấp</h2>
                    <p className="text-gray-600">Quản lý thông tin các nhà cung cấp dịch vụ</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm nhà cung cấp
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Thêm nhà cung cấp mới</DialogTitle>
                        </DialogHeader>
                        <SupplierForm />
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAddDialogOpen(false)
                                    resetForm()
                                }}
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleAddSupplier} disabled={uploadingImage}>
                                Thêm nhà cung cấp
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
                                    placeholder="Tìm kiếm nhà cung cấp..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={filterCity} onValueChange={setFilterCity}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Chọn thành phố" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả thành phố</SelectItem>
                                <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                                <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                                <SelectItem value="Thành phố Hồ Chí Minh">TP. Hồ Chí Minh</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterServiceType} onValueChange={setFilterServiceType}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Loại dịch vụ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                                <SelectItem value="spa">Spa</SelectItem>
                                <SelectItem value="khách sạn thú cưng">Khách sạn thú cưng</SelectItem>
                                <SelectItem value="chăm sóc sức khỏe">Chăm sóc sức khỏe</SelectItem>
                                <SelectItem value="chải lông">Chải lông</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Suppliers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách nhà cung cấp ({filteredSuppliers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ảnh</TableHead>
                                <TableHead>Nhà cung cấp</TableHead>
                                <TableHead>Liên hệ</TableHead>
                                <TableHead>Địa chỉ</TableHead>
                                <TableHead>Loại dịch vụ</TableHead>
                                <TableHead>Dịch vụ</TableHead>
                                <TableHead>Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {filteredSuppliers.map((supplier) => (
                                    <motion.tr
                                        key={supplier.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group"
                                    >
                                        <TableCell>
                                            <ImageGallery images={supplier.imageUrls || []} />
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{supplier.name}</div>
                                                <div className="text-sm text-gray-500">ID: {supplier.id}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Phone className="h-3 w-3" />
                                                    {supplier.phone}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Mail className="h-3 w-3" />
                                                    {supplier.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-start gap-1">
                                                <MapPin className="h-3 w-3 mt-1 flex-shrink-0" />
                                                <div className="text-sm">
                                                    <div>{supplier.address}</div>
                                                    <div className="text-gray-500">{supplier.city}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{supplier.serviceType}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{supplier.services.length} dịch vụ</div>
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
                                                    <DropdownMenuItem onClick={() => handleEditSupplier(supplier)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteSupplier(supplier.id)}>
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
            <Dialog
                open={!!editingSupplier}
                onOpenChange={() => {
                    setEditingSupplier(null)
                    resetForm()
                }}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa nhà cung cấp</DialogTitle>
                    </DialogHeader>
                    <SupplierForm />
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditingSupplier(null)
                                resetForm()
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleUpdateSupplier} disabled={uploadingImage}>
                            Cập nhật
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
