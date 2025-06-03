"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Menu, X, ChevronDown, User, LogOut, Package, Settings, Search, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import { type IUser, useAppStore } from "./app-provider"

const dogCategories = [
  { name: "Thức ăn cho chó", href: "/san-pham", icon: "🍖" },
  { name: "Phụ kiện cho chó", href: "/san-pham", icon: "🥫" },
]

const catCategories = [
  { name: "Thức ăn cho mèo", href: "/san-pham", icon: "🍖" },
  { name: "Phụ kiện cho mèo", href: "/san-pham", icon: "🥫" },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useMobile()
  const { totalItems } = useCart()
  const router = useRouter()
  const [user, setUser] = useState<IUser | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const userState = useAppStore((state) => state.user)
  const setUserState = useAppStore((state) => state.setUser)

  const handleCategoryClick = (href: string) => {
    router.push(href)
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userState = useAppStore.getState().user
        setUser(userState)
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userState])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(undefined)
      localStorage.removeItem("token")
      toast.success("Đăng xuất thành công")
      router.push("/")
    } catch (error) {
      toast.error("Đăng xuất thất bại")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/san-pham?search=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

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
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  }

  const mobileMenuVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        height: {
          duration: 0.3,
        },
        opacity: {
          duration: 0.2,
          delay: 0.1,
        },
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        height: {
          duration: 0.3,
        },
        opacity: {
          duration: 0.2,
        },
      },
    },
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="relative">
              <Image
                src="/logo-finto.png"
                alt="Finto Logo"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
          </Link>
        </motion.div>

        <motion.nav
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hidden md:flex items-center gap-6"
        >
          <motion.div variants={itemVariants}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 group">
                  <span className="group-hover:text-primary transition-colors">Chó</span>
                  <ChevronDown className="h-4 w-4 group-hover:text-primary transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2">
                {dogCategories.map((category) => (
                  <DropdownMenuItem
                    key={category.href}
                    onClick={() => handleCategoryClick(category.href)}
                    className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-muted rounded-md transition-colors"
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          <motion.div variants={itemVariants}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 group">
                  <span className="group-hover:text-primary transition-colors">Mèo</span>
                  <ChevronDown className="h-4 w-4 group-hover:text-primary transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2">
                {catCategories.map((category) => (
                  <DropdownMenuItem
                    key={category.href}
                    onClick={() => handleCategoryClick(category.href)}
                    className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-muted rounded-md transition-colors"
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button variant="ghost" className="group" onClick={() => router.push("/blog")}>
              <span className="group-hover:text-primary transition-colors">Blog thú cưng</span>
            </Button>
          </motion.div>
        </motion.nav>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex items-center gap-3">
          <motion.div variants={itemVariants}>
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)} className="relative">
              <Search className="h-5 w-5" />
            </Button>
          </motion.div>

          {(user?.role === "USER" || user === undefined) && (
            <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/gio-hang" className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2"
                      >
                        <Badge
                          variant="destructive"
                          className="h-5 w-5 flex items-center justify-center p-0 rounded-full"
                        >
                          {totalItems}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>
            </motion.div>
          )}

          {loading ? (
            <motion.div variants={itemVariants} className="h-8 w-20 animate-pulse rounded bg-muted" />
          ) : user ? (
            <motion.div variants={itemVariants}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 overflow-hidden">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://github.com/shadcn.png" alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />

                  {user.role === "ADMIN" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/admin")}
                      className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-muted rounded-md transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Quản lý</span>
                    </DropdownMenuItem>
                  )}

                  {user.role === "USER" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/don-hang")}
                      className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-muted rounded-md transition-colors"
                    >
                      <Package className="h-4 w-4" />
                      <span>Đơn hàng</span>
                    </DropdownMenuItem>

                  )}
                  {user.role === "USER" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/don-dich-vu")}
                      className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-muted rounded-md transition-colors"
                    >
                      <PawPrint className="h-4 w-4" />
                      <span>Đơn dịch vụ</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-muted rounded-md transition-colors text-red-500 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="flex gap-2 mt-4">
              <motion.div variants={itemVariants}>
                <Button variant="ghost" size="sm" onClick={() => router.push("/dang-nhap")} className="hidden md:flex">
                  Đăng nhập
                </Button>
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" onClick={() => router.push("/dang-ky")} className="hidden md:flex">
                  Đăng ký
                </Button>
              </motion.div>
            </motion.div>
          )}

          {isMobile && (
            <motion.div variants={itemVariants}>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="relative">
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t overflow-hidden"
          >
            <div className="container py-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button type="submit">Tìm kiếm</Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobile && isMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="border-t overflow-hidden"
          >
            <div className="container py-4">
              <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                {!user && (
                  <motion.div variants={itemVariants} className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        router.push("/dang-nhap")
                        setIsMenuOpen(false)
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Đăng nhập
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        router.push("/dang-ky")
                        setIsMenuOpen(false)
                      }}
                    >
                      Đăng ký
                    </Button>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <h3 className="mb-3 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Danh mục
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-medium flex items-center gap-2">
                        <span className="text-lg">🐶</span> Chó
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {dogCategories.map((category) => (
                          <Button
                            key={category.href}
                            variant="ghost"
                            className="justify-start"
                            onClick={() => handleCategoryClick(category.href)}
                          >
                            <span className="mr-2">{category.icon}</span>
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 font-medium flex items-center gap-2">
                        <span className="text-lg">🐱</span> Mèo
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {catCategories.map((category) => (
                          <Button
                            key={category.href}
                            variant="ghost"
                            className="justify-start"
                            onClick={() => handleCategoryClick(category.href)}
                          >
                            <span className="mr-2">{category.icon}</span>
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <h3 className="mb-3 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Khác</h3>
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push("/blog")
                        setIsMenuOpen(false)
                      }}
                    >
                      Blog thú cưng
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push("/lien-he")
                        setIsMenuOpen(false)
                      }}
                    >
                      Liên hệ
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
