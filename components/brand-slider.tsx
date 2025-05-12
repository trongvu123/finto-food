"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BrandSlider() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [currentIndex, setCurrentIndex] = useState(0)

  const brands = [
    { name: "Royal Canin", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Whiskas", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Pedigree", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Purina", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Hill's", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Friskies", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Nutro", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Iams", logo: "/placeholder.svg?height=60&width=120" },
  ]

  const visibleBrands = 5 // Số lượng thương hiệu hiển thị cùng lúc
  const maxIndex = brands.length - visibleBrands

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) return 0
        return prev + 1
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [maxIndex])

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold text-gray-900">Thương hiệu đối tác</h2>
        </motion.div>

        <div ref={ref} className="relative max-w-5xl mx-auto">
          <div className="overflow-hidden px-10">
            <motion.div
              animate={{ x: `-${currentIndex * (100 / visibleBrands)}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex"
            >
              {brands.map((brand, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex-shrink-0 w-1/${visibleBrands} px-4`}
                >
                  <div className="bg-white rounded-lg p-6 h-24 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                    <Image
                      src={brand.logo || "/placeholder.svg"}
                      alt={brand.name}
                      width={120}
                      height={60}
                      className="max-h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-md"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-md"
            onClick={nextSlide}
            disabled={currentIndex === maxIndex}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
