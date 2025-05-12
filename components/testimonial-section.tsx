"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const testimonials = [
    {
      id: 1,
      name: "Nguyễn Thị Hương",
      role: "Chủ của Milu",
      avatar: "/placeholder.svg?height=100&width=100",
      content:
        "Tôi rất hài lòng với chất lượng thức ăn cho chó của Finto. Milu nhà tôi rất thích và khỏe mạnh hơn nhiều kể từ khi sử dụng sản phẩm này.",
    },
    {
      id: 2,
      name: "Trần Văn Nam",
      role: "Chủ của Kitty",
      avatar: "/placeholder.svg?height=100&width=100",
      content:
        "Dịch vụ giao hàng nhanh chóng và sản phẩm chất lượng cao. Tôi đặc biệt thích cát vệ sinh cho mèo, rất hiệu quả và không có mùi hôi.",
    },
    {
      id: 3,
      name: "Lê Minh Anh",
      role: "Chủ của Bông",
      avatar: "/placeholder.svg?height=100&width=100",
      content:
        "Finto có đa dạng sản phẩm cho thú cưng và giá cả rất hợp lý. Tôi sẽ tiếp tục mua sắm ở đây và giới thiệu cho bạn bè.",
    },
  ]

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold md:text-4xl text-gray-900 mb-4">Đánh giá từ khách hàng</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khách hàng của chúng tôi nói gì về sản phẩm và dịch vụ của Finto
          </p>
        </motion.div>

        <div ref={ref} className="relative max-w-4xl mx-auto">
          <div className="absolute -left-4 -top-4 text-teal-500 opacity-20">
            <Quote size={60} />
          </div>

          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-lg relative z-10"
          >
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-teal-100">
                  <Image
                    src={testimonials[activeIndex].avatar || "/placeholder.svg"}
                    alt={testimonials[activeIndex].name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{testimonials[activeIndex].name}</h3>
                <p className="text-gray-500">{testimonials[activeIndex].role}</p>
              </div>

              <div className="md:w-2/3">
                <p className="text-lg text-gray-700 italic leading-relaxed">"{testimonials[activeIndex].content}"</p>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeIndex ? "bg-teal-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <div className="absolute -bottom-4 md:bottom-1/2 md:translate-y-1/2 left-0 right-0 flex justify-between">
            <Button variant="outline" size="icon" className="rounded-full bg-white shadow-md" onClick={prevTestimonial}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full bg-white shadow-md" onClick={nextTestimonial}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
