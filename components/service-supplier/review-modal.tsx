"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useAppStore } from "../app-provider"

interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    order: {
        id: string
        serviceId: string
        serviceName: string
        orderCode: string
    }
    onReviewSubmitted: () => void
}

export default function ReviewModal({ isOpen, onClose, order, onReviewSubmitted }: ReviewModalProps) {
    const [rating, setRating] = useState(5)
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const user = useAppStore((state) => state.user)
    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.error("Vui lòng nhập nội dung đánh giá")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch("/api/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user?.id,
                    serviceId: order.serviceId,
                    rating,
                    content,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to submit review")
            }

            toast.success("Đánh giá đã được gửi thành công")
            onReviewSubmitted()
            onClose()
        } catch (error) {
            console.error("Error submitting review:", error)
            toast.error("Không thể gửi đánh giá. Vui lòng thử lại sau.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg p-6 w-full max-w-lg mx-4"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Đánh giá dịch vụ</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="mb-6">
                    <h3 className="font-medium mb-2">Dịch vụ: {order.serviceName}</h3>
                    <p className="text-sm text-gray-500">Mã đơn hàng: {order.orderCode}</p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Đánh giá của bạn</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                            >
                                <Star
                                    className={`h-8 w-8 ${star <= rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="review" className="block text-sm font-medium mb-2">
                        Nội dung đánh giá
                    </label>
                    <Textarea
                        id="review"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
                        className="min-h-[120px]"
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
