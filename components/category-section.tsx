"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { ChevronRight } from "lucide-react"

export default function CategorySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const categories = [
    {
      title: "Sản phẩm cho chó",
      image: "https://pet1.mauthemewp.com/wp-content/uploads/2024/10/category-03-1536x1536-1.webp",
      color: "from-amber-400 to-orange-500",
      link: "/san-pham",
    },
    {
      title: "Sản phẩm cho mèo",
      image: "https://pet1.mauthemewp.com/wp-content/uploads/2024/10/category-02-1536x1536-1.webp",
      color: "from-purple-400 to-pink-500",
      link: "/san-pham",
    },
    {
      title: "Thiết bị thông minh",
      image: "https://pet1.mauthemewp.com/wp-content/uploads/2024/10/category-01-1536x1536-1.webp",
      color: "from-blue-400 to-teal-500",
      link: "/san-pham",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold md:text-4xl text-gray-900 mb-4">Thư viện sản phẩm</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá các danh mục sản phẩm đa dạng của chúng tôi dành cho thú cưng của bạn
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="relative overflow-hidden rounded-2xl shadow-lg group"
            >
              <Link href={category.link} className="block">
                <div className="aspect-[4/5] relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 z-10`}></div>
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                    <div className="flex items-center text-sm font-medium">
                      <span>Xem sản phẩm</span>
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
