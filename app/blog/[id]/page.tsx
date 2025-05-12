"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, Heart, MessageSquare } from "lucide-react"
import { getBlogPost } from "@/lib/api"

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

export default function BlogPostPage() {
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true)
      try {
        if (id && typeof id === 'string') {
          const blogPost = await getBlogPost(id);
          setPost(blogPost);
        } else {
          router.push("/blog");
        }
      } catch (error) {
        console.error("Error fetching post:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [id, router])

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <div className="animate-pulse">
            <div className="h-8 w-3/4 rounded bg-gray-200 mb-4"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200 mb-8"></div>
            <div className="h-96 rounded bg-gray-200 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 w-5/6 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Bài viết không tồn tại</h1>
        <Button onClick={() => router.push("/blog")}>Quay lại trang blog</Button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 py-20">
        <div className="absolute inset-0 opacity-30">
          <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
        </div>
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className="mb-4">{post.category}</Badge>
              <h1 className="mb-6 text-3xl font-bold md:text-5xl">{post.title}</h1>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatDate(new Date(post.createdAt))}</span>
                </div>
                {/* <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{post.readTime} phút đọc</span>
                </div> */}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push("/blog")} className="group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Quay lại
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={isLiked ? "text-red-500" : ""}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={isBookmarked ? "text-primary" : ""}
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-primary" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="mb-8 flex items-center">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={ "/placeholder.svg"} />
            </Avatar>
            <div>
              <h3 className="font-semibold">Admin</h3>
              <p className="text-sm text-gray-500">admin</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }}></div>

            {/* <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div> */}

            <div className="mt-12 rounded-xl bg-gray-50 p-6">
              <h3 className="mb-4 text-xl font-semibold">Chia sẻ ý kiến của bạn</h3>
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>G</AvatarFallback>
                </Avatar>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Viết bình luận..."
                    className="w-full rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-3">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Bình luận
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
