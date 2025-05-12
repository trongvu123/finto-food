"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from "@/lib/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { Plus, Search, Edit, Trash2, MoreHorizontal, Eye, Filter } from 'lucide-react'
import BlogModal from "@/components/admin/blog-modal"

import { formatDate, formatDateBlog } from "@/lib/utils"
import DeleteConfirmModal from "@/components/admin/delete-confirm-modal"

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

// Danh sách các danh mục blog
const CATEGORIES = [
  "Chăm sóc chó",
  "Chăm sóc mèo",
  "Dinh dưỡng",
  "Huấn luyện",
  "Sức khỏe",
]

export default function BlogsPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentBlog, setCurrentBlog] = useState<BlogPost | null>(null)

  // Lấy dữ liệu blog
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const blogPosts = await getBlogPosts({ category: categoryFilter === "all" ? undefined : categoryFilter })
        setBlogs(blogPosts)
        setTotalPages(Math.ceil(blogPosts.length / 10))
      } catch (error) {
        console.error("Error fetching blogs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [categoryFilter])

  // Lọc blogs dựa trên các bộ lọc
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter ? blog.category === categoryFilter : true
    const matchesStatus = statusFilter
      ? (statusFilter === "published" ? blog.published : !blog.published)
      : true

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Phân trang
  const itemsPerPage = 10
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Xử lý thêm blog mới
  const handleAddBlog = async (blog: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => {
    try {
      setLoading(true)
      const newBlog = await createBlogPost({
        ...blog,
        excerpt: blog.excerpt || undefined,
        image: blog.image || undefined,
      })
      setBlogs([newBlog, ...blogs])
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Error creating blog post:", error)
    } finally {
      setLoading(false)
    }
  }

  // Xử lý cập nhật blog
  const handleUpdateBlog = async (updatedBlog: BlogPost) => {
    try {
      setLoading(true)
      const updated = await updateBlogPost(updatedBlog.id, {
        title: updatedBlog.title,
        content: updatedBlog.content,
        excerpt: updatedBlog.excerpt || undefined,
        image: updatedBlog.image || undefined,
        published: updatedBlog.published,
      })
      setBlogs(blogs.map(blog =>
        blog.id === updatedBlog.id ? updated : blog
      ))
      setIsEditModalOpen(false)
      setCurrentBlog(null)
    } catch (error) {
      console.error("Error updating blog post:", error)
    } finally {
      setLoading(false)
    }
  }

  // Xử lý xóa blog
  const handleDeleteBlog = async () => {
    if (currentBlog) {
      try {
        setLoading(true)
        await deleteBlogPost(currentBlog.id)
        setBlogs(blogs.filter(blog => blog.id !== currentBlog.id))
        setIsDeleteModalOpen(false)
        setCurrentBlog(null)
      } catch (error) {
        console.error("Error deleting blog post:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  // Mở modal chỉnh sửa
  const openEditModal = (blog: BlogPost) => {
    setCurrentBlog(blog)
    setIsEditModalOpen(true)
  }

  // Mở modal xác nhận xóa
  const openDeleteModal = (blog: BlogPost) => {
    setCurrentBlog(blog)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
          <p className="text-gray-500">Quản lý tất cả bài viết trên blog của bạn</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm bài viết mới
        </Button>
      </div>

      {/* Bộ lọc */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Lọc theo danh mục" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Lọc theo trạng thái" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="published">Đã xuất bản</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bảng hiển thị blog */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Tiêu đề</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Ngày cập nhật</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex justify-center">
                    <svg
                      className="animate-spin h-6 w-6 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <p className="text-gray-500">Không tìm thấy bài viết nào</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBlogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell>{blog.category}</TableCell>
                  <TableCell>
                    <Badge variant={blog.published ? "default" : "secondary"}>
                      {blog.published ? "Đã xuất bản" : "Bản nháp"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateBlog(blog.createdAt)}</TableCell>
                  <TableCell>{formatDateBlog(blog.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/blog/${blog.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(blog)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteModal(blog)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Phân trang */}
      {!loading && filteredBlogs.length > 0 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Modal thêm/sửa blog */}
      <BlogModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBlog}
        categories={CATEGORIES}
        title="Thêm bài viết mới"
      />

      <BlogModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setCurrentBlog(null)
        }}
        onSubmit={handleUpdateBlog}
        categories={CATEGORIES}
        title="Chỉnh sửa bài viết"
        blog={currentBlog}
      />

      {/* Modal xác nhận xóa */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setCurrentBlog(null)
        }}
        onConfirm={handleDeleteBlog}
        title="Xóa bài viết"
        description={`Bạn có chắc chắn muốn xóa bài viết "${currentBlog?.title}" không? Hành động này không thể hoàn tác.`}
      />
    </div>
  )
}
