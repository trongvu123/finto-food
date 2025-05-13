"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { formatDate, formatDateBlog } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Search, Calendar, ArrowRight } from 'lucide-react'
import { getBlogPosts } from "@/lib/api"

// Định nghĩa kiểu dữ liệu cho blog
interface BlogPost {
  id: string
  title: string
  category: string
  content: string
  excerpt?: string | null
  image?: string | null
  published: boolean
  createdAt: string
  updatedAt: string
}

const MOCK_CATEGORIES = ["Tất cả", "Chăm sóc chó", "Chăm sóc mèo", "Dinh dưỡng", "Huấn luyện", "Sức khỏe"]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [allPosts, setAllPosts] = useState<BlogPost[]>([])
  const postsPerPage = 6
  const featuredRef = useRef(null)
  const isFeaturedInView = useInView(featuredRef, { once: true, amount: 0.3 })

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogPosts = await getBlogPosts({ category: selectedCategory === "Tất cả" ? undefined : selectedCategory });
        setAllPosts(blogPosts);
        setFilteredPosts(blogPosts);
      } catch (error) {
        console.error("Error fetching blogs:", error)
      }
    }

    fetchBlogs()
  }, [selectedCategory])

  // Filter posts based on search term
  useEffect(() => {
    let result = [...allPosts]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (post) => post.title?.toLowerCase().includes(term) || post.excerpt?.toLowerCase().includes(term)
      )
    }

    setFilteredPosts(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, allPosts])

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)

  const featuredPost = allPosts[0]
  console.log('featuredPost', featuredPost)
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-50 to-blue-50 py-16">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">Blog thú cưng</h1>
            <p className="mb-8 text-lg text-gray-600 md:text-xl">
              Chia sẻ kiến thức và kinh nghiệm chăm sóc thú cưng của bạn
            </p>

            <div className="relative mx-auto mb-8 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-teal-100 opacity-50"></div>
        <div className="absolute -right-12 top-12 h-32 w-32 rounded-full bg-blue-100 opacity-50"></div>
        <div className="absolute -top-6 left-1/4 h-16 w-16 rounded-full bg-amber-100 opacity-50"></div>
      </section>

      <div className="container py-12">
        {/* Categories */}
        <div className="mb-12">
          <Tabs defaultValue="Tất cả" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="mx-auto flex w-full max-w-4xl justify-start overflow-x-auto">
              {MOCK_CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="min-w-max data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Featured Post */}
        {allPosts.length > 0 && featuredPost && (
          <motion.div
            ref={featuredRef}
            initial={{ opacity: 0, y: 30 }}
            animate={ { opacity: 1, y: 0 } }
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
          <div></div>
            <Link href={`/blog/${featuredPost.id}`} className="group block relative overflow-hidden rounded-2xl shadow-lg">
              <div className="aspect-[21/9] w-full">
                <Image
                  src={featuredPost.image || "/placeholder.svg"}
                  alt={featuredPost.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <Badge className="mb-3 bg-primary/80 text-white hover:bg-primary">{featuredPost.category}</Badge>
                <h2 className="mb-3 text-2xl font-bold text-white transition-colors group-hover:text-primary-100 md:text-4xl">
                  {featuredPost.title}
                </h2>
                <p className="mb-4 max-w-3xl text-gray-200 md:text-lg">{featuredPost.excerpt}</p>
                <div className="flex items-center text-gray-300">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatDate(new Date(featuredPost.createdAt))}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Posts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="wait">
            {currentPosts.length > 0 ? (
              currentPosts.map((post) => (
                <motion.div key={post.id} variants={itemVariants} layout>
                  <Link href={`/blog/${post.id}`} className="group block h-full">
                    <article className="h-full overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
                      <div className="relative overflow-hidden">
                        <div className="aspect-[16/9]">
                          <Image
                            src={post.image || "/placeholder.svg"}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 text-primary hover:bg-white/80">{post.category}</Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="mb-3 text-xl font-bold transition-colors group-hover:text-primary">
                          {post.title}
                        </h3>
                        <p className="mb-4 line-clamp-3 text-gray-600">{post.excerpt}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>{formatDateBlog(post.createdAt)}</span>
                          </div>
                          <div className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform duration-300">
                            Đọc tiếp <ArrowRight className="ml-1 inline-block h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full py-12 text-center"
              >
                <p className="text-lg text-gray-500">Không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn.</p>
                <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                  Xóa bộ lọc
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {filteredPosts.length > postsPerPage && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }).map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index + 1 ? "default" : "outline"}
                size="icon"
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-md"
          >
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold">Đăng ký nhận bản tin</h2>
              <p className="mb-6 text-gray-600">
                Nhận thông báo về các bài viết mới và mẹo chăm sóc thú cưng hàng tuần
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input type="email" placeholder="Email của bạn" className="flex-1" />
                <Button>Đăng ký</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
