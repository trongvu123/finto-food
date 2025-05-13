"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Shield, Truck, Award, Sparkles } from 'lucide-react'

export default function IntroSection() {
  // Tạo ref cho toàn bộ section thay vì chỉ cho grid
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.1  // Giảm xuống 0.1 để kích hoạt sớm hơn
  })
const [isMounted, setIsMounted] = useState(false)

useEffect(() => {
  setIsMounted(true)
}, [])

  const features = [
    {
      icon: <Award className="h-8 w-8 text-teal-600" />,
      title: "Chất lượng cao",
      description: "Chúng tôi chỉ cung cấp thức ăn thú cưng chất lượng cao từ các thương hiệu uy tín.",
      color: "bg-teal-100",
    },
    {
      icon: <Truck className="h-8 w-8 text-blue-600" />,
      title: "Giao hàng nhanh chóng",
      description: "Giao hàng nhanh chóng trong vòng 24 giờ đối với các đơn hàng trong nội thành.",
      color: "bg-blue-100",
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Đảm bảo hài lòng",
      description: "Chúng tôi cam kết hoàn tiền 100% nếu bạn không hài lòng với sản phẩm.",
      color: "bg-purple-100",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-amber-600" />,
      title: "Sản phẩm đa dạng",
      description: "Đa dạng sản phẩm cho mọi nhu cầu và mọi loại thú cưng của bạn.",
      color: "bg-amber-100",
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    // Gắn ref vào toàn bộ section
    <section className="py-16 md:py-24" >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 } }
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold md:text-4xl text-gray-900 mb-4">Tại sao chọn Finto?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cung cấp những sản phẩm tốt nhất cho thú cưng của bạn với dịch vụ chăm sóc khách hàng tuyệt vời.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={"visible"}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col items-center text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`mb-4 rounded-full ${feature.color} p-4`}>{feature.icon}</div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}