"use client"

import { getCategories, getBrands, getProducts } from "@/lib/api";
import ProductList from "@/components/product-list"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface Category {
    id: string;
    name: string;
}

interface Brand {
    id: string;
    name: string;
}
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, SlidersHorizontal, X, Grid, List, ArrowUpDown, Loader2 } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
    SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"
import { useSearchParams } from "next/navigation";

export default function ProductsPage() {
    const isMobile = useMobile()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [filterOpen, setFilterOpen] = useState(false)
    const [activeFilters, setActiveFilters] = useState<string[]>([])
    const [priceRange, setPriceRange] = useState([0, 5000000])
    const [categories, setCategories] = useState<Category[]>([])
    const [brands, setBrands] = useState<Brand[]>([])
    const [filters, setFilters] = useState({
        categoryId: "",
        brandId: "",
        search: "",
        sort: "newest",
        minPrice: 0,
        maxPrice: 5000000,
        inStock: false,
        onSale: false,
    })

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                const data = await getProducts(filters)
                setProducts(data?.products || [])
            } catch (err) {
                setError("Không thể tải sản phẩm")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [filters])

    useEffect(() => {
        const fetchCategoriesAndBrands = async () => {
            try {
                const categoriesData = await getCategories()
                setCategories(categoriesData)

                const brandsData = await getBrands()
                setBrands(brandsData)
            } catch (error) {
                console.error("Error fetching categories and brands:", error)
            }
        }

        fetchCategoriesAndBrands()
    }, [])

    useEffect(() => {
        // Cập nhật active filters dựa trên các bộ lọc đã chọn
        const newActiveFilters: string[] = []


        if (filters.categoryId) {
            const category = categories.find((c: any) => c.id === filters.categoryId)
            if (category) newActiveFilters.push(`Danh mục: ${category.name}`)
        }

        if (filters.brandId) {
            const brand = brands.find((b: any) => b.id === filters.brandId)
            if (brand) newActiveFilters.push(`Thương hiệu: ${brand.name}`)
        }

        if (filters.minPrice > 0 || filters.maxPrice < 5000000) {
            newActiveFilters.push(`Giá: ${formatCurrency(filters.minPrice)} - ${formatCurrency(filters.maxPrice)}`)
        }

        if (filters.inStock) {
            newActiveFilters.push("Còn hàng")
        }

        if (filters.onSale) {
            newActiveFilters.push("Đang giảm giá")
        }

        setActiveFilters(newActiveFilters)
    }, [filters, categories, brands])

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const handlePriceRangeChange = (value: number[]) => {
        setPriceRange(value)
    }

    const applyPriceRange = () => {
        setFilters((prev) => ({
            ...prev,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
        }))
    }

    const clearAllFilters = () => {
        setFilters({
            categoryId: "",
            brandId: "",
            search: "",
            sort: "newest",
            minPrice: 0,
            maxPrice: 5000000,
            inStock: false,
            onSale: false,
        })
        setPriceRange([0, 5000000])
    }

    const removeFilter = (filter: string) => {
        if (filter.startsWith("Danh mục:")) {
            handleFilterChange("categoryId", "")
        } else if (filter.startsWith("Thương hiệu:")) {
            handleFilterChange("brandId", "")
        } else if (filter.startsWith("Giá:")) {
            handleFilterChange("minPrice", 0)
            handleFilterChange("maxPrice", 5000000)
            setPriceRange([0, 5000000])
        } else if (filter === "Còn hàng") {
            handleFilterChange("inStock", false)
        } else if (filter === "Đang giảm giá") {
            handleFilterChange("onSale", false)
        }
    }

    // Format giá tiền sang VND
    function formatCurrency(amount: number) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const sortOptions = [
        { value: "newest", label: "Mới nhất" },
        { value: "price_asc", label: "Giá tăng dần" },
        { value: "price_desc", label: "Giá giảm dần" },
        { value: "bestselling", label: "Bán chạy nhất" },
        { value: "name_asc", label: "Tên A-Z" },
        { value: "name_desc", label: "Tên Z-A" },
    ]

    const FilterPanel = () => (
        <div className="space-y-6">
            <div>
                <h3 className="mb-4 text-lg font-semibold">Danh mục</h3>
                <div className="space-y-2">
                    {categories.map((category: any) => (
                        <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`category-${category.id}`}
                                checked={filters.categoryId === category.id}
                                onCheckedChange={(checked) => handleFilterChange("categoryId", checked ? category.id : "")}
                            />
                            <Label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer">
                                {category.name}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold">Thương hiệu</h3>
                <div className="space-y-2">
                    {brands.map((brand: any) => (
                        <div key={brand.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`brand-${brand.id}`}
                                checked={filters.brandId === brand.id}
                                onCheckedChange={(checked) => handleFilterChange("brandId", checked ? brand.id : "")}
                            />
                            <Label htmlFor={`brand-${brand.id}`} className="text-sm cursor-pointer">
                                {brand.name}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold">Khoảng giá</h3>
                <Slider
                    defaultValue={[0, 5000000]}
                    min={0}
                    max={5000000}
                    step={100000}
                    value={priceRange}
                    onValueChange={handlePriceRangeChange}
                    className="mb-6"
                />
                <div className="flex items-center justify-between text-sm mb-4">
                    <span>{formatCurrency(priceRange[0])}</span>
                    <span>{formatCurrency(priceRange[1])}</span>
                </div>
                <Button onClick={applyPriceRange} className="w-full">
                    Áp dụng
                </Button>
            </div>

            <div className="border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold">Tình trạng</h3>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="inStock"
                            checked={filters.inStock}
                            onCheckedChange={(checked) => handleFilterChange("inStock", checked)}
                        />
                        <Label htmlFor="inStock" className="text-sm cursor-pointer">
                            Còn hàng
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="onSale"
                            checked={filters.onSale}
                            onCheckedChange={(checked) => handleFilterChange("onSale", checked)}
                        />
                        <Label htmlFor="onSale" className="text-sm cursor-pointer">
                            Đang giảm giá
                        </Label>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Sản phẩm</h1>
                <p className="text-gray-500 mt-2">Khám phá các sản phẩm chất lượng cao cho thú cưng của bạn</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Desktop Filter Panel */}
                <div className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-20 bg-white rounded-lg border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold flex items-center">
                                <Filter className="mr-2 h-5 w-5" />
                                Bộ lọc
                            </h2>
                            {activeFilters.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="text-xs text-red-500 hover:text-red-700"
                                >
                                    Xóa tất cả
                                </Button>
                            )}
                        </div>
                        <FilterPanel />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Search and Sort Bar */}
                    <div className="bg-white rounded-lg border p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange("search", e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                {/* Mobile Filter Button */}
                                <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="lg:hidden flex-1">
                                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                                            Bộ lọc
                                            {activeFilters.length > 0 && (
                                                <Badge variant="secondary" className="ml-2">
                                                    {activeFilters.length}
                                                </Badge>
                                            )}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                        <SheetHeader>
                                            <SheetTitle>Bộ lọc</SheetTitle>
                                            <SheetDescription>
                                                Lọc sản phẩm theo danh mục, thương hiệu, giá và nhiều tiêu chí khác
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="py-4">
                                            <FilterPanel />
                                        </div>
                                        <SheetFooter>
                                            <SheetClose asChild>
                                                <Button className="w-full">Áp dụng</Button>
                                            </SheetClose>
                                        </SheetFooter>
                                    </SheetContent>
                                </Sheet>

                                {/* Sort Dropdown */}
                                <Select value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <div className="flex items-center">
                                            <ArrowUpDown className="mr-2 h-4 w-4" />
                                            <SelectValue placeholder="Sắp xếp theo" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sortOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* View Mode Toggle */}
                                <div className="hidden md:flex border rounded-md">
                                    <Button
                                        variant={viewMode === "grid" ? "default" : "ghost"}
                                        size="icon"
                                        className="rounded-r-none"
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "list" ? "default" : "ghost"}
                                        size="icon"
                                        className="rounded-l-none"
                                        onClick={() => setViewMode("list")}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {activeFilters.map((filter, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                        {filter}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter(filter)} />
                                    </Badge>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="text-xs text-red-500 hover:text-red-700"
                                >
                                    Xóa tất cả
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Products */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-lg">Đang tải sản phẩm...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">{error}</div>
                    ) : products.length === 0 ? (
                        <div className="bg-gray-50 p-8 rounded-lg text-center">
                            <h3 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h3>
                            <p className="text-gray-500 mb-4">Không có sản phẩm nào phù hợp với bộ lọc của bạn</p>
                            <Button onClick={clearAllFilters}>Xóa bộ lọc</Button>
                        </div>
                    ) : (
                        <ProductList products={products} viewMode={viewMode} />
                    )}
                </div>
            </div>
        </div>
    )
}
