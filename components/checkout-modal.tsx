"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/utils"

interface Product {
    id: string
    name: string
    price: number
    image: string
}

interface CheckoutModalProps {
    isOpen: boolean
    onClose: () => void
    product: Product
    quantity: number
}

export function CheckoutModal({ isOpen, onClose, product, quantity }: CheckoutModalProps) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        district: "",
        ward: "",
        note: "",
        paymentMethod: "cod",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement checkout logic
        console.log("Checkout with:", { product, quantity, ...formData })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePaymentMethodChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            paymentMethod: value,
        }))
    }

    const total = product.price * quantity

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Thanh toán</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Product Summary */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Thông tin sản phẩm</h3>
                        <div className="flex items-center space-x-4 rounded-lg border p-4">
                            <div className="relative h-20 w-20 flex-shrink-0">
                                <Image
                                    src={product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className="rounded-md object-cover"
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <h4 className="font-medium">{product.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                    Số lượng: {quantity}
                                </p>
                                <p className="font-medium text-primary">
                                    {formatCurrency(product.price * quantity)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Họ và tên</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Địa chỉ</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">Tỉnh/Thành phố</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="district">Quận/Huyện</Label>
                                <Input
                                    id="district"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ward">Phường/Xã</Label>
                                <Input
                                    id="ward"
                                    name="ward"
                                    value={formData.ward}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="note">Ghi chú</Label>
                            <Textarea
                                id="note"
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phương thức thanh toán</Label>
                            <RadioGroup
                                value={formData.paymentMethod}
                                onValueChange={handlePaymentMethodChange}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <RadioGroupItem
                                        value="cod"
                                        id="cod"
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor="cod"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <svg
                                            className="mb-3 h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                        Thanh toán khi nhận hàng
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem
                                        value="banking"
                                        id="banking"
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor="banking"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <svg
                                            className="mb-3 h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                            />
                                        </svg>
                                        Chuyển khoản ngân hàng
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between border-t pt-4">
                                <span className="font-medium">Tổng cộng:</span>
                                <span className="text-lg font-bold text-primary">
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        </div>
                        <Button type="submit" className="w-full">
                            Đặt hàng
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
} 