"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Calendar, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BlogSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  const blogPosts = [
    {
      id: 1,
      title: "25 bài học huấn luyện chó tại nhà ai cũng làm được",
      excerpt:
        "Huấn luyện chó tại nhà không chỉ giúp tăng cường mối quan hệ giữa chó và chủ, mà còn giúp chó phát triển tốt hơn về tâm lý và hành vi.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wp5-ahw0cXiwYWoslPLWetxcz8p9pIvbVL.jpeg",
      date: "15/05/2023",
      author: "Nguyễn Văn A",
      category: "Huấn luyện",
    },
    {
      id: 2,
      title: "Chỉ từng bước cách cắt móng cho mèo dễ dàng",
      excerpt:
        "Khi nào cần phải cắt móng cho mèo? Thời điểm thích hợp nhất để cắt móng cho mèo? Bạn cần chú ý đến mức độ dài của móng và biết đến những tác...",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wp5-ahw0cXiwYWoslPLWetxcz8p9pIvbVL.jpeg",
      date: "10/05/2023",
      author: "Trần Thị B",
      category: "Chăm sóc mèo",
    },
    {
      id: 3,
      title: "Cách sử dụng thuốc tẩy giun cho mèo hiệu quả",
      excerpt:
        "Trong cuộc sống hàng ngày của người nuôi mèo, việc áp dụng cách trị giun cho mèo tại nhà là một thách thức không nhỏ. Tẩn và bo chết không chỉ khiến...",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wp5-ahw0cXiwYWoslPLWetxcz8p9pIvbVL.jpeg",
      date: "05/05/2023",
      author: "Lê Văn C",
      category: "Sức khỏe",
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl font-bold md:text-4xl text-gray-900 mb-2">Trạm thú cưng</h2>
            <p className="text-gray-600 max-w-2xl">
              Khám phá những bài viết hữu ích về cách chăm sóc và huấn luyện thú cưng của bạn
            </p>
          </div>
          <Link href="/blog" className="mt-4 md:mt-0">
            <Button variant="outline" className="group">
              Xem tất cả
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {blogPosts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <Link href={`/blog/${post.id}`} className="block">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-teal-600 text-white text-xs font-medium px-2 py-1 rounded">
                    {post.category}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <div className="flex items-center mr-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{post.author}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 line-clamp-3 mb-4">{post.excerpt}</p>

                  <div className="flex items-center text-teal-600 font-medium group">
                    <span>Đọc tiếp</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
