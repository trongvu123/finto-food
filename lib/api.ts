import { OrderStatus } from "@prisma/client"
    export interface IAddressResponse<T> {
        data: T[]; // Mảng dữ liệu (tỉnh, quận, xã)
        data_name: string; // Tên loại dữ liệu (ví dụ: Tỉnh thành Việt Nam)
        error: number; // 0 nếu thành công
        error_text: string; // Thông báo lỗi hoặc thành công
    }
      export interface IProvince {
        id: string; // API trả về id dạng string (ví dụ: 89)
        name: string; // Tên tỉnh (ví dụ: An Giang)
        name_en: string; // Tên tiếng Anh (ví dụ: An Giang)
        full_name: string; // Tên đầy đủ (ví dụ: Tỉnh An Giang)
        full_name_en?: string; // Tên đầy đủ tiếng Anh (có thể không có)
        latitude?: string; // Vĩ độ (có thể không có)
        longitude?: string; // Kinh độ (có thể không có)
        code?: string; // Mã tỉnh (có thể không có)
        administrative_unit_id?: string; // ID đơn vị hành chính (có thể không có)
        administrative_region_id?: string; // ID vùng hành chính (có thể không có)
    }

    // Định nghĩa type cho quận/huyện (tương tự tỉnh/thành, nhưng có thể khác một chút)
    export interface IDistrict {
        id: string;
        name: string;
        name_en: string;
        full_name: string;
        full_name_en?: string;
        latitude?: string;
        longitude?: string;
        code?: string;
        province_id?: string; // ID của tỉnh liên quan
        administrative_unit_id?: string;
    }

    // Định nghĩa type cho xã/phường
    export interface IWard {
        id: string;
        name: string;
        name_en: string;
        full_name: string;
        full_name_en?: string;
        latitude?: string;
        longitude?: string;
        code?: string;
        district_id?: string; // ID của quận/huyện liên quan
        administrative_unit_id?: string;
    }
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
    userId?: string
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

 export const getAllProvinces = async (): Promise<IAddressResponse<IProvince>> => {
  const res = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
  if (!res.ok) throw new Error('Failed to fetch provinces')
  return await res.json()
}

export const sGetAllProvinces = async (): Promise<IAddressResponse<IProvince>> => {
  const res = await fetch('/api/address/province')
  if (!res.ok) throw new Error('Failed to fetch provinces from server')
  return await res.json()
}

export const getAllDistricts = async (provinceId: string): Promise<IAddressResponse<IDistrict>> => {
  const res = await fetch(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`)
  if (!res.ok) throw new Error('Failed to fetch districts')
  return await res.json()
}

export const sGetAllDistricts = async (provinceId: string): Promise<IAddressResponse<IDistrict>> => {
  const res = await fetch(`/api/address/district/${provinceId}`)
  if (!res.ok) throw new Error('Failed to fetch districts from server')
  return await res.json()
}

export const getAllWards = async (districtId: string): Promise<IAddressResponse<IWard>> => {
  const res = await fetch(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`)
  if (!res.ok) throw new Error('Failed to fetch wards')
  return await res.json()
}

export const sGetAllWards = async (districtId: string): Promise<IAddressResponse<IWard>> => {
  const res = await fetch(`/api/address/ward/${districtId}`)
  if (!res.ok) throw new Error('Failed to fetch wards from server')
  return await res.json()
}

export  const createPayment = async (amount: number, description: string) => {
    const res = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description }),
    });

    return await res.json();
  };

// Blog Post APIs
export const getBlogPosts = async (params?: { category?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value) searchParams.append(key, value.toString())
        })
    }
    const res = await fetch(`/api/admin/blog?${searchParams}`);
    if (!res.ok) throw new Error("Failed to fetch blog posts");
    return res.json();
};

export const getBlogPost = async (id: string) => {
    const res = await fetch(`/api/admin/blog/${id}`);
    if (!res.ok) throw new Error("Failed to fetch blog post");
    return res.json();
};

export const createBlogPost = async (data: {
    title: string;
    content: string;
    excerpt?: string;
    image?: string;
    published?: boolean;
}) => {
    const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create blog post");
    return res.json();
};

export const updateBlogPost = async (id: string, data: {
    title: string;
    content: string;
    excerpt?: string;
    image?: string;
    published?: boolean;
}) => {
    const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update blog post");
    return res.json();
};

export const deleteBlogPost = async (id: string) => {
    const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete blog post");
    return res.json();
};
