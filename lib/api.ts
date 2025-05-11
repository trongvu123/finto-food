import { OrderStatus } from "@prisma/client"

// Product APIs
export const getProducts = async (params?: {
    page?: number
    limit?: number
    categoryId?: string
    brandId?: string
    search?: string
    sort?: string
}) => {
    const searchParams = new URLSearchParams()
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value) searchParams.append(key, value.toString())
        })
    }
    const res = await fetch(`/api/products?${searchParams}`)
    if (!res.ok) throw new Error("Failed to fetch products")
    return res.json()
}

export const getProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`)
    if (!res.ok) throw new Error("Failed to fetch product")
    return res.json()
}

// Order APIs
export const createOrder = async (data: {
    items: { productId: string; quantity: number }[]
    shippingAddress: string
    shippingProvince: string
    shippingDistrict: string
    shippingWard: string
    phone: string
    paymentMethod: string
    fullName: string
    email: string
}) => {
    const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error("Failed to create order")
    return res.json()
}

export const getOrders = async () => {
    const res = await fetch("/api/orders")
    if (!res.ok) throw new Error("Failed to fetch orders")
    return res.json()
}

// Admin APIs
export const getDashboard = async () => {
    const res = await fetch("/api/admin/dashboard")
    if (!res.ok) throw new Error("Failed to fetch dashboard data")
    return res.json()
}

export const getAdminOrders = async (params?: {
    page?: number
    limit?: number
    status?: OrderStatus
    search?: string
}) => {
    try {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) searchParams.append(key, value.toString())
            })
        }
        const res = await fetch(`/api/admin/orders?${searchParams}`)
        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.message || "Failed to fetch orders")
        }
        return res.json()
    } catch (error) {
        console.error("Error fetching orders:", error)
        throw error
    }
}

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    })
    if (!res.ok) throw new Error("Failed to update order status")
    return res.json()
}

// Auth APIs
export const login = async (data: { email: string; password: string }) => {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error("Failed to login")
    return res.json()
}

export const register = async (data: { email: string; password: string; name: string }) => {
    const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error("Failed to register")
    return res.json()
}

export const logout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" })
    if (!res.ok) throw new Error("Failed to logout")
    return res.json()
}

export const getMe = async () => {
    const res = await fetch("/api/auth/me")
    if (!res.ok) throw new Error("Failed to fetch user data")
    return res.json()
}

export async function getUser() {
    const response = await fetch("/api/auth/me")
    if (!response.ok) {
        throw new Error("Failed to fetch user")
    }
    return response.json()
} 