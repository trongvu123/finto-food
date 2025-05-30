"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Thức ăn chất lượng cao cho thú cưng của bạn",
      description: "Finto cung cấp các sản phẩm dinh dưỡng tốt nhất cho những người bạn bốn chân của bạn.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wp1-D8xflXGGQHkon3oSjaAEfRl1Jc2JgO.jpeg",
      buttonText: "Khám phá ngay",
      buttonLink: "/san-pham",
    },
    {
      title: "Phụ kiện thông minh cho thú cưng",
      description: "Khám phá các thiết bị và phụ kiện thông minh giúp chăm sóc thú cưng dễ dàng hơn.",
      image: "/hero-bg.png",
      buttonText: "Xem sản phẩm",
      buttonLink: "/san-pham",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-teal-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-teal-800">
                {slides[currentSlide].title}
              </h1>
              <p className="mt-4 text-lg text-gray-600 md:text-xl">{slides[currentSlide].description}</p>
            </motion.div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
                <Link href={slides[currentSlide].buttonLink}>
                  {slides[currentSlide].buttonText}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                <Link href="/san-pham/meo">Sản phẩm cho mèo</Link>
              </Button>
            </div>

            <div className="mt-6 flex justify-center md:justify-start gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full ${currentSlide === index ? "bg-teal-600" : "bg-gray-300"}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-80 md:h-[500px] rounded-3xl overflow-hidden">
              <Image
                src={slides[currentSlide].image || "/placeholder.svg"}
                alt="Thú cưng hạnh phúc"
                className="object-cover"
                fill
                priority
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -bottom-5 -left-5 md:-left-10 bg-white rounded-2xl p-4 shadow-lg hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="bg-teal-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-teal-600"
                  >
                    <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"></path>
                    <path d="M14.5 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5"></path>
                    <path d="M8 14v.5"></path>
                    <path d="M16 14v.5"></path>
                    <path d="M11.25 16.25h1.5L12 17l-.75-.75Z"></path>
                    <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Miễn phí vận chuyển</p>
                  <p className="text-sm text-gray-500">Cho đơn hàng từ 500k</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute -top-5 -right-5 md:-right-10 bg-white rounded-2xl p-4 shadow-lg hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-orange-600"
                  >
                    <path d="M19.3 14.8C19.3 14.8 18.3 19 13.8 19C9.3 19 8.5 14.8 8.5 14.8"></path>
                    <path d="M2 9.8C2 9.8 3 5 7.5 5C12 5 13 9.8 13 9.8"></path>
                    <path d="M19.3 9.8C19.3 9.8 18.3 5 13.8 5C9.3 5 8.5 9.8 8.5 9.8"></path>
                    <path d="M2 14.8C2 14.8 3 19 7.5 19C12 19 13 14.8 13 14.8"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Đổi trả dễ dàng</p>
                  <p className="text-sm text-gray-500">Trong vòng 7 ngày</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="absolute -bottom-16 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white"></div>
    </section>
  )
}
