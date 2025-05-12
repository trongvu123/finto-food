"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export default function PromotionBanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1200')] opacity-10 bg-cover bg-center"></div>

          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
            <div className="text-white text-center md:text-left mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Ưu đãi đặc biệt</h2>
              <p className="text-white/90 text-lg mb-4">Giảm giá 20% cho tất cả sản phẩm thức ăn cho chó và mèo</p>

              <div className="flex items-center justify-center md:justify-start">
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-medium">Còn lại: 2 ngày 5 giờ 30 phút</span>
              </div>
            </div>

            <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-white/90">
              <Link href="/san-pham">Mua ngay</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
