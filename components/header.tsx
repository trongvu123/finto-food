"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Menu, X, ChevronDown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useCart } from "@/contexts/cart-context"
import { getUser } from "@/lib/api"
import { toast } from "sonner"

const dogCategories = [
  { name: "Thức ăn hạt", href: "/san-pham/cho/thuc-an-hat" },
  { name: "Pate", href: "/san-pham/cho/pate" },
  { name: "Bánh thưởng", href: "/san-pham/cho/banh-thuong" },
  { name: "Đồ nhai", href: "/san-pham/cho/do-nhai" },
]

const catCategories = [
  { name: "Thức ăn hạt", href: "/san-pham/meo/thuc-an-hat" },
  { name: "Pate", href: "/san-pham/meo/pate" },
  { name: "Cát vệ sinh", href: "/san-pham/meo/cat-ve-sinh" },
  { name: "Đồ chơi", href: "/san-pham/meo/do-choi" },
]

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useMobile()
  const { totalItems } = useCart()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const handleCategoryClick = (href: string) => {
    router.push(href)
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUser()
        setUser(data.user)
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      toast.success("Đăng xuất thành công")
      router.push("/")
    } catch (error) {
      toast.error("Đăng xuất thất bại")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Finto Pet Food</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1">
                <span>Chó</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {dogCategories.map((category) => (
                <DropdownMenuItem
                  key={category.href}
                  onClick={() => handleCategoryClick(category.href)}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1">
                <span>Mèo</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {catCategories.map((category) => (
                <DropdownMenuItem
                  key={category.href}
                  onClick={() => handleCategoryClick(category.href)}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/gio-hang" className="relative">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
          ) : user ? (
            <div className="flex items-center space-x-4">
              {user.role === "ADMIN" && (
                <Button
                  variant="ghost"
                  onClick={() => router.push("/admin")}
                >
                  Quản lý
                </Button>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{user.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={() => router.push("/dang-nhap")}>
                Đăng nhập
              </Button>
              <Button onClick={() => router.push("/dang-ky")}>
                Đăng ký
              </Button>
            </div>
          )}

          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <div className="border-t">
          <div className="container py-4">
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Chó</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dogCategories.map((category) => (
                    <Button
                      key={category.href}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleCategoryClick(category.href)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Mèo</h3>
                <div className="grid grid-cols-2 gap-2">
                  {catCategories.map((category) => (
                    <Button
                      key={category.href}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleCategoryClick(category.href)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
