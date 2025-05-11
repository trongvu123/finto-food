"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Product {
    id: number
    name: string
    price: number
    image: string
    category: string
    brand: string
    stock: number
    status: string
    description?: string
}

interface ProductModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (product: Omit<Product, "id">) => void
    product?: Product
}

export default function ProductModal({ isOpen, onClose, onSave, product }: ProductModalProps) {
    const [formData, setFormData] = useState<Omit<Product, "id">>({
        name: "",
        price: 0,
        image: "",
        category: "",
        brand: "",
        stock: 0,
        status: "Còn hàng",
        description: "",
    })

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                brand: product.brand,
                stock: product.stock,
                status: product.status,
                description: product.description || "",
            })
        } else {
            setFormData({
                name: "",
                price: 0,
                image: "",
                category: "",
                brand: "",
                stock: 0,
                status: "Còn hàng",
                description: "",
            })
        }
    }, [product])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên sản phẩm</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Giá</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Danh mục</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Thức ăn cho chó">Thức ăn cho chó</SelectItem>
                                    <SelectItem value="Thức ăn cho mèo">Thức ăn cho mèo</SelectItem>
                                    <SelectItem value="Phụ kiện cho chó">Phụ kiện cho chó</SelectItem>
                                    <SelectItem value="Phụ kiện cho mèo">Phụ kiện cho mèo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Số lượng</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Hình ảnh</Label>
                        <Input
                            id="image"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="Nhập URL hình ảnh"
                            required
                        />
                        {formData.image && (
                            <div className="relative h-40 w-full overflow-hidden rounded-md">
                                <Image
                                    src={formData.image}
                                    alt="Preview"
                                    className="object-cover"
                                    fill
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="submit">
                            {product ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 