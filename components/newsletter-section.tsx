"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const { toast } = useToast()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ email của bạn",
        variant: "destructive",
      })
      return
    }

    // Xử lý đăng ký nhận bản tin
    toast({
      title: "Đăng ký thành công!",
      description: "Cảm ơn bạn đã đăng ký nhận bản tin từ Finto",
    })

    setEmail("")
  }

  return (
    <section className="py-16 bg-gradient-to-r from-teal-500 to-blue-500 relative overflow-hidden">
      <div className="absolute right-0 bottom-0 w-64 h-64 md:w-80 md:h-80">
        <Image src="/placeholder.svg?height=300&width=300" alt="Cat" fill className="object-contain" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Đăng ký nhận bản tin</h2>
              <p className="text-gray-600">
                Nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và lời khuyên hữu ích về chăm sóc thú cưng
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                Đăng ký ngay
              </Button>
            </form>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Bằng cách đăng ký, bạn đồng ý với chính sách bảo mật của chúng tôi. Bạn có thể hủy đăng ký bất cứ lúc nào.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
