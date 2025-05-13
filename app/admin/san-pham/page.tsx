"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Package,
  Filter,
  ArrowUpDown,
  Loader2,
  X,
  Upload,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"

interface Category {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

interface Brand {
  id: string
  name: string
  description: string
  logo: string | null
  website: string | null
  createdAt: string
  updatedAt: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice: number | null
  stock: number
  sold: number
  images: string[]
  categoryId: string
  nutritionalInfo: string | null
  ingredients: string | null
  brandId: string
  createdAt: string
  updatedAt: string
  category: Category
  brand: Brand
}

interface ProductsResponse {
  products: Product[]
  total: number
  totalPages: number
  currentPage: number
}

// Format giá tiền sang VND
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<string>("updatedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("basic")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    stock: "",
    categoryId: "",
    brandId: "",
    nutritionalInfo: "",
    ingredients: "",
    images: [""],
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
  }, [currentPage, itemsPerPage, sortField, sortOrder, categoryFilter, brandFilter, stockFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Construct query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortField,
        sortOrder,
      })

      if (searchQuery) params.append("search", searchQuery)
      if (categoryFilter && categoryFilter !== "all") params.append("categoryId", categoryFilter)
      if (brandFilter && brandFilter !== "all") params.append("brandId", brandFilter)
      if (stockFilter && stockFilter !== "all") params.append("stock", stockFilter)

      const response = await fetch(`/api/admin/products?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data: ProductsResponse = await response.json()
      setProducts(data.products)
      setTotalPages(data.totalPages)
      setTotalProducts(data.total)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Không thể tải danh sách sản phẩm")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Không thể tải danh mục sản phẩm")
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/admin/brands")
      if (!response.ok) throw new Error("Failed to fetch brands")
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error("Error fetching brands:", error)
      toast.error("Không thể tải thương hiệu")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        stock: Number(formData.stock),
        images: formData.images.filter((img) => img.trim() !== ""),
      }

      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products"

      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) throw new Error("Failed to save product")

      toast.success(editingProduct ? "Sản phẩm đã được cập nhật thành công" : "Sản phẩm đã được thêm thành công")
      setIsDialogOpen(false)
      fetchProducts()
      resetForm()
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Không thể lưu sản phẩm")
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete product")

      toast.success("Sản phẩm đã được xóa thành công")
      fetchProducts()
      setDeleteConfirmOpen(false)
      setProductToDelete(null)
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Không thể xóa sản phẩm")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : "",
      stock: product.stock.toString(),
      categoryId: product.categoryId,
      brandId: product.brandId,
      nutritionalInfo: product.nutritionalInfo || "",
      ingredients: product.ingredients || "",
      images: product.images.length > 0 ? product.images : [""],
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      salePrice: "",
      stock: "",
      categoryId: "",
      brandId: "",
      nutritionalInfo: "",
      ingredients: "",
      images: [""],
    })
    setEditingProduct(null)
    setActiveTab("basic")
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchProducts()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleConfirmDelete = (productId: string) => {
    setProductToDelete(productId)
    setDeleteConfirmOpen(true)
  }

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: "Hết hàng", variant: "destructive" as const }
    if (stock < 10) return { label: "Sắp hết", variant: "warning" as const }
    return { label: "Còn hàng", variant: "success" as const }
  }

  // Pagination controls
  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến {Math.min(currentPage * itemsPerPage, totalProducts)}{" "}
          trong tổng số {totalProducts} sản phẩm
        </div>
        <div className="flex items-center space-x-2">
          {/* <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-2" />
          </Button> */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {startPage > 1 && (
            <>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(1)}
              >
                1
              </Button>
              {startPage > 2 && <span className="mx-1">...</span>}
            </>
          )}

          {pages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="mx-1">...</span>}
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {/* <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-2" />
          </Button> */}

          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="10 / trang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / trang</SelectItem>
              <SelectItem value="10">10 / trang</SelectItem>
              <SelectItem value="20">20 / trang</SelectItem>
              <SelectItem value="50">50 / trang</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Đang tải</CardTitle>
            <CardDescription>Vui lòng đợi trong khi chúng tôi tải dữ liệu...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground mt-1">Quản lý danh sách sản phẩm của cửa hàng</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Cập nhật thông tin sản phẩm trong hệ thống" : "Thêm sản phẩm mới vào hệ thống"}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value="nutrition">Dinh dưỡng</TabsTrigger>
                <TabsTrigger value="images">Hình ảnh</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Tên sản phẩm
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="price" className="text-sm font-medium">
                        Giá (VNĐ)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="salePrice" className="text-sm font-medium">
                        Giá khuyến mãi (VNĐ)
                      </Label>
                      <Input
                        id="salePrice"
                        type="number"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="stock" className="text-sm font-medium">
                        Số lượng
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-sm font-medium">
                        Danh mục
                      </Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="brand" className="text-sm font-medium">
                        Thương hiệu
                      </Label>
                      <Select
                        value={formData.brandId}
                        onValueChange={(value) => setFormData({ ...formData, brandId: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Chọn thương hiệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Mô tả
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 min-h-[120px]"
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="nutrition" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nutritionalInfo" className="text-sm font-medium">
                        Thông tin dinh dưỡng
                      </Label>
                      <Textarea
                        id="nutritionalInfo"
                        value={formData.nutritionalInfo}
                        onChange={(e) => setFormData({ ...formData, nutritionalInfo: e.target.value })}
                        className="mt-1 min-h-[150px]"
                        placeholder="Nhập thông tin dinh dưỡng của sản phẩm..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="ingredients" className="text-sm font-medium">
                        Thành phần
                      </Label>
                      <Textarea
                        id="ingredients"
                        value={formData.ingredients}
                        onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                        className="mt-1 min-h-[150px]"
                        placeholder="Nhập thành phần của sản phẩm..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Hình ảnh sản phẩm</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={image}
                              onChange={(e) => {
                                const newImages = [...formData.images]
                                newImages[index] = e.target.value
                                setFormData({ ...formData, images: newImages })
                              }}
                              placeholder="URL hình ảnh"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                if (formData.images.length > 1) {
                                  const newImages = formData.images.filter((_, i) => i !== index)
                                  setFormData({ ...formData, images: newImages })
                                }
                              }}
                              disabled={formData.images.length <= 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {image && (
                            <div className="relative aspect-square rounded-md border overflow-hidden bg-muted">
                              <Image
                                src={image || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  ; (e.target as HTMLImageElement).src = "/placeholder.svg"
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({ ...formData, images: [...formData.images, ""] })}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Thêm hình ảnh
                    </Button>
                  </div>
                </TabsContent>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">{editingProduct ? "Cập nhật" : "Thêm"} sản phẩm</Button>
                </DialogFooter>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Danh sách sản phẩm</CardTitle>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-full sm:w-[250px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch()
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Tất cả danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="icon" onClick={handleSearch}>
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead className="min-w-[250px]">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort("name")}>
                        Sản phẩm
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${sortField === "name" ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort("price")}>
                        Giá
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${sortField === "price" ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort("stock")}>
                        Tồn kho
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${sortField === "stock" ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                    </TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Thương hiệu</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell>
                          <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-muted rounded animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Package className="h-8 w-8 mb-2" />
                          <p>Không tìm thấy sản phẩm nào</p>
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchQuery("")
                              setCategoryFilter("all")
                              setBrandFilter("all")
                              setStockFilter("all")
                              fetchProducts()
                            }}
                          >
                            Xóa bộ lọc
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence mode="popLayout" >
                      {products.map((product, index) => {
                        const stockStatus = getStockStatus(product.stock)

                        return (
                          <motion.tr

                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="[&>td]:p-2"
                          >
                            <TableCell className="py-3 pl-4 ">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                            <TableCell className="py-3 ">
                              <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                                  <Image
                                    src={product.images?.[0] || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                      ; (e.target as HTMLImageElement).src = "/placeholder.svg"
                                    }}
                                  />
                                </div>
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-xs text-muted-foreground">ID: {product.id.slice(0, 8)}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <div>
                                {product.salePrice ? (
                                  <>
                                    <div className="font-medium text-primary">{formatCurrency(product.salePrice)}</div>
                                    <div className="text-xs text-muted-foreground line-through">
                                      {formatCurrency(product.price)}
                                    </div>
                                  </>
                                ) : (
                                  <div className="font-medium">{formatCurrency(product.price)}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive">{stockStatus.label}</Badge>
                                <span>{product.stock}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge variant="outline">{product.category.name}</Badge>
                            </TableCell>
                            <TableCell className="py-3">{product.brand.name}</TableCell>
                            <TableCell className="py-3 pr-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Chỉnh sửa</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleConfirmDelete(product.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Xóa</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleEdit(product)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => handleConfirmDelete(product.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">{renderPagination()}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => productToDelete && handleDelete(productToDelete)}>
              Xóa sản phẩm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
