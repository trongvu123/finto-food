"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Newspaper,
  Ribbon,
  LogOut,
  Dog,
  PawPrint,
  Factory
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    title: "Sản phẩm",
    href: "/admin/san-pham",
    icon: Package
  },
  {
    title: "Đơn hàng",
    href: "/admin/don-hang",
    icon: ShoppingCart
  },
  {
    title: "Thương hiệu",
    href: "/admin/thuong-hieu",
    icon: Ribbon
  },
  {
    title: "Danh mục",
    href: "/admin/danh-muc",
    icon: Settings
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: Newspaper
  },
  {
    title: "Dịch vụ",
    href: "/admin/dich-vu",
    icon: Dog
  },
  {
    title: "Nhà cung cấp",
    href: "/admin/nha-cung-cap",
    icon: Factory
  },
  {
    title: "Đơn dịch vụ",
    href: "/admin/don-dich-vu",
    icon: PawPrint
  }
]

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const token = localStorage.getItem("token")
  //       if (!token) {
  //         router.push("/admin/dang-nhap")
  //         return
  //       }

  //       const response = await fetch("/api/admin/me", {
  //         headers: {
  //           Authorization: `Bearer ${token}`
  //         }
  //       })

  //       if (!response.ok) {
  //         throw new Error("Unauthorized")
  //       }

  //       const data = await response.json()
  //       if (data.role !== "ADMIN") {
  //         throw new Error("Not authorized")
  //       }
  //     } catch (error) {
  //       localStorage.removeItem("token")
  //       router.push("/admin/dang-nhap")
  //       toast.error("Please login to continue")
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   // Chỉ kiểm tra xác thực nếu không phải trang đăng nhập hoặc đăng ký
  //   if (pathname !== "/admin/dang-nhap" && pathname !== "/admin/dang-ky") {
  //     checkAuth()
  //   } else {
  //     setLoading(false)
  //   }
  // }, [router, pathname])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/admin/dang-nhap")
    toast.success("Logged out successfully")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Loading</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please wait while we load the page...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (pathname === "/admin/dang-nhap" || pathname === "/admin/dang-ky") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <div className="w-64 min-h-screen bg-white border-r">
          <div className="p-4">
            <h1 className="text-xl font-bold mb-8">Admin Panel</h1>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>Logout</span>
              </Button>
            </nav>
          </div>
        </div>
        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  )
}
