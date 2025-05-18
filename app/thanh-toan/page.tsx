"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import {
  createOrder,
  createPayment,
  type IAddressResponse,
  type IDistrict,
  type IProvince,
  type IWard,
  sGetAllDistricts,
  sGetAllProvinces,
  sGetAllWards,
} from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/components/app-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ShoppingBag, CreditCard, Truck, MapPin, User, Mail, Phone, Home, Check } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function PaymentPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [addressResponse, setAddressResponse] = useState<IAddressResponse<IProvince> | null>(null)
  const [districtsResponse, setDistrictsResponse] = useState<IAddressResponse<IDistrict> | null>(null)
  const [wardsResponse, setWardsResponse] = useState<IAddressResponse<IWard> | null>(null)
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null)
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null)
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null)
  const [districtLoading, setDistrictLoading] = useState(false)
  const [wardLoading, setWardLoading] = useState(false)
  const [qrcode, setQrcode] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const qrSvg = useRef<HTMLDivElement>(null)
  const user = useAppStore((state) => state.user)
  const cart = useCart()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    paymentMethod: "cod",
  })

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = total < 500000 ? 30000 : 0

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  useEffect(() => {
    setMounted(true)
    const fetchProvinces = async () => {
      try {
        const resAddress = await sGetAllProvinces()
        setAddressResponse(resAddress)
      } catch (error) {
        console.error("Error fetching provinces:", error)
      }
    }

    fetchProvinces()
  }, [])

  const createPaymentLink = async () => {
    setLoading(true)
    try {
      const province =
        addressResponse?.data.find((p) => String(p.id) === String(shippingInfo.province))?.full_name || ""
      const district =
        districtsResponse?.data.find((d) => String(d.id) === String(shippingInfo.district))?.full_name || ""
      const ward = wardsResponse?.data.find((w) => String(w.id) === String(shippingInfo.ward))?.full_name || ""

      // Add loading animation
      toast({
        title: "Đang tạo liên kết thanh toán",
        description: "Vui lòng đợi trong giây lát...",
      })

      const createQrCode = await createPayment(
        items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingInfo.address,
        province,
        district,
        ward,
        shippingInfo.phone,
        shippingInfo.paymentMethod,
        shippingInfo.name,
        shippingInfo.email,
        user?.id,
      )

      items.map((item) => {
        cart.removeFromCart(item.id)
      })
      if (createQrCode.checkoutUrl) {
        window.location.href = createQrCode.checkoutUrl
      }

      setQrcode(createQrCode.checkoutUrl)
    } catch (error) {
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleSelectProvince = async () => {
      if (!selectedProvinceId) return
      try {
        setDistrictLoading(true)
        const resDistrict = await sGetAllDistricts(selectedProvinceId)
        setWardsResponse(null)
        if (resDistrict) {
          setDistrictsResponse(resDistrict)
          setDistrictLoading(false)
        }
      } catch (error) {
        console.log(error)
      }
    }
    handleSelectProvince()
  }, [selectedProvinceId])

  useEffect(() => {
    const handleSelectDistrict = async () => {
      if (!selectedDistrictId) return
      try {
        setWardLoading(true)
        const resWard = await sGetAllWards(selectedDistrictId)
        if (resWard) {
          setWardsResponse(resWard)
          setWardLoading(false)
        }
      } catch (error) {
        console.log(error)
      }
    }
    handleSelectDistrict()
  }, [selectedDistrictId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const province = addressResponse?.data.find((p) => String(p.id) === String(shippingInfo.province))?.full_name || ""
    const district =
      districtsResponse?.data.find((d) => String(d.id) === String(shippingInfo.district))?.full_name || ""
    const ward = wardsResponse?.data.find((w) => String(w.id) === String(shippingInfo.ward))?.full_name || ""
    try {
      // Add loading animation
      toast({
        title: "Đang xử lý đơn hàng",
        description: "Vui lòng đợi trong giây lát...",
      })

      const res = await createOrder({
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: shippingInfo.address,
        shippingProvince: province,
        shippingDistrict: district,
        shippingWard: ward,
        phone: shippingInfo.phone,
        paymentMethod: shippingInfo.paymentMethod,
        fullName: shippingInfo.name,
        email: shippingInfo.email,
        userId: user?.id,
      })

      toast({
        title: "Đặt hàng thành công!",
        description: "Cảm ơn bạn đã mua sắm tại Finto Pet Food",
        duration: 2000,
      })

      clearCart()

      // Add redirect animation
      setTimeout(() => {
        router.push("/thanh-toan/xac-nhan?code=" + res.id)
      }, 500)

      items.map((item) => {
        cart.removeFromCart(item.id)
      })
    } catch (error) {
      toast({
        title: "Đặt hàng thất bại",
        description: "Vui lòng kiểm tra lại thông tin và thử lại",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setLoading(false)
    }
  }

  // if (items.length === 0) {
  //   return (
  //     <motion.div
  //       initial={{ opacity: 0 }}
  //       animate={{ opacity: 1 }}
  //       exit={{ opacity: 0 }}
  //       className="container mx-auto py-8"
  //     >
  //       <div className="text-center">
  //         <motion.div
  //           initial={{ scale: 0.8, opacity: 0 }}
  //           animate={{ scale: 1, opacity: 1 }}
  //           transition={{ type: "spring", stiffness: 300, damping: 25 }}
  //         >
  //           <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
  //         </motion.div>
  //         <motion.h1
  //           initial={{ y: 20, opacity: 0 }}
  //           animate={{ y: 0, opacity: 1 }}
  //           transition={{ delay: 0.1 }}
  //           className="text-2xl font-bold mb-4"
  //         >
  //           Giỏ hàng trống
  //         </motion.h1>
  //         <motion.p
  //           initial={{ y: 20, opacity: 0 }}
  //           animate={{ y: 0, opacity: 1 }}
  //           transition={{ delay: 0.2 }}
  //           className="mb-4"
  //         >
  //           Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán
  //         </motion.p>
  //         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
  //           <Button onClick={() => router.push("/san-pham")} className="group">
  //             <ShoppingBag className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
  //             Tiếp tục mua sắm
  //           </Button>
  //         </motion.div>
  //       </div>
  //     </motion.div>
  //   )
  // }

  // if (!mounted) {
  //   return (
  //     <div className="container mx-auto py-8">
  //       <Skeleton className="h-10 w-48 mb-8" />
  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  //         <div>
  //           <Skeleton className="h-[600px] w-full rounded-lg" />
  //         </div>
  //         <div>
  //           <Skeleton className="h-[400px] w-full rounded-lg" />
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="container mx-auto py-8">
      <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-8">
        Thanh toán
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div variants={itemVariants}>
          <Card className="border-primary/10 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5 text-primary" />
                Thông tin giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={itemVariants} className="group">
                  <Label htmlFor="name" className="flex items-center text-sm font-medium">
                    <User className="mr-2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    Họ và tên
                  </Label>
                  <Input
                    id="name"
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                    required
                    className="mt-1 transition-all focus:border-primary focus:ring-primary"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="group">
                  <Label htmlFor="email" className="flex items-center text-sm font-medium">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                    className="mt-1 transition-all focus:border-primary focus:ring-primary"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="group">
                  <Label htmlFor="phone" className="flex items-center text-sm font-medium">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    Số điện thoại
                  </Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    required
                    className="mt-1 transition-all focus:border-primary focus:ring-primary"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="group">
                  <Label htmlFor="address" className="flex items-center text-sm font-medium">
                    <Home className="mr-2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    Địa chỉ chi tiết
                  </Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    required
                    className="mt-1 transition-all focus:border-primary focus:ring-primary"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="group">
                  <Label htmlFor="province" className="flex items-center text-sm font-medium">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    Tỉnh/Thành phố
                  </Label>
                  <Select
                    value={shippingInfo.province}
                    onValueChange={(value) => {
                      setShippingInfo({
                        ...shippingInfo,
                        province: value,
                        district: "",
                        ward: "",
                      })
                      setSelectedProvinceId(value)
                    }}
                  >
                    <SelectTrigger className="mt-1 transition-all focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                      <AnimatePresence>
                        {addressResponse ? (
                          addressResponse?.data.map((province, index) => (
                            <motion.div
                              key={province.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                            >
                              <SelectItem value={province.id}>{province.full_name}</SelectItem>
                            </motion.div>
                          ))
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">Đang tải...</div>
                        )}
                      </AnimatePresence>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={itemVariants} className="group">
                  <Label htmlFor="district" className="flex items-center text-sm font-medium">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    Quận/Huyện
                  </Label>
                  <Select
                    value={shippingInfo.district}
                    onValueChange={(value) => {
                      setShippingInfo({
                        ...shippingInfo,
                        district: value,
                        ward: "",
                      })
                      setSelectedDistrictId(value)
                    }}
                    disabled={!shippingInfo.province || districtLoading}
                  >
                    <SelectTrigger className="mt-1 transition-all focus:border-primary focus:ring-primary">
                      {districtLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Đang tải...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Chọn Quận/Huyện" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <AnimatePresence>
                        {districtsResponse?.data &&
                          districtsResponse?.data?.map((district, index) => (
                            <motion.div
                              key={district.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                            >
                              <SelectItem value={district.id}>{district.name}</SelectItem>
                            </motion.div>
                          ))}
                      </AnimatePresence>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={itemVariants} className="group">
                  <Label htmlFor="ward" className="flex items-center text-sm font-medium">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    Phường/Xã
                  </Label>
                  <Select
                    value={shippingInfo.ward}
                    onValueChange={(value) => {
                      setShippingInfo({ ...shippingInfo, ward: value })
                      setSelectedWardId(value)
                    }}
                    disabled={!shippingInfo.district || wardLoading}
                  >
                    <SelectTrigger className="mt-1 transition-all focus:border-primary focus:ring-primary">
                      {wardLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Đang tải...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Chọn Phường/Xã" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <AnimatePresence>
                        {wardsResponse
                          ? wardsResponse?.data?.map((ward, index) => (
                            <motion.div
                              key={ward.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                            >
                              <SelectItem value={ward.id}>{ward.name}</SelectItem>
                            </motion.div>
                          ))
                          : []}
                      </AnimatePresence>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Label className="flex items-center text-sm font-medium">
                    <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                    Phương thức thanh toán
                  </Label>
                  <RadioGroup
                    value={shippingInfo.paymentMethod}
                    onValueChange={(value) => {
                      setShippingInfo({ ...shippingInfo, paymentMethod: value })
                    }}
                    className="mt-2 space-y-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer font-medium">
                        Thanh toán khi nhận hàng (COD)
                      </Label>
                      {shippingInfo.paymentMethod === "cod" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        >
                          <Check className="h-3 w-3" />
                        </motion.div>
                      )}
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <RadioGroupItem
                        value="banking"
                        id="banking"
                        onChange={(e) => {
                          setPaymentMethod(e.currentTarget.value)
                        }}
                      />
                      <Label htmlFor="banking" className="flex-1 cursor-pointer font-medium">
                        Chuyển khoản ngân hàng
                      </Label>
                      {shippingInfo.paymentMethod === "banking" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        >
                          <Check className="h-3 w-3" />
                        </motion.div>
                      )}
                    </motion.div>
                  </RadioGroup>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  {shippingInfo.paymentMethod === "cod" ? (
                    <Button
                      type="submit"
                      className="w-full mt-6 relative overflow-hidden group"
                      disabled={loading}
                      size="lg"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xử lý...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                          Đặt hàng
                        </span>
                      )}
                      <motion.span
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%" }}
                        animate={{ x: loading ? "0%" : "-100%" }}
                        transition={{ duration: 0.5, repeat: loading ? Number.POSITIVE_INFINITY : 0 }}
                      />
                    </Button>
                  ) : (
                    <Button
                      onClick={createPaymentLink}
                      type="button"
                      className="w-full mt-6 relative overflow-hidden group"
                      disabled={loading}
                      size="lg"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xử lý...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <CreditCard className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                          Thanh toán
                        </span>
                      )}
                      <motion.span
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%" }}
                        animate={{ x: loading ? "0%" : "-100%" }}
                        transition={{ duration: 0.5, repeat: loading ? Number.POSITIVE_INFINITY : 0 }}
                      />
                    </Button>
                  )}
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-primary/10 shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5 text-primary" />
                Đơn hàng của bạn
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <motion.div
                className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={listItemVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start justify-between p-3 rounded-lg border border-transparent hover:border-primary/10 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <motion.div
                          className="w-16 h-16 relative rounded-md overflow-hidden border"
                          whileHover={{ scale: 1.05 }}
                        >
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        </motion.div>
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            Số lượng:
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="ml-1 px-2 py-0.5 bg-primary/10 rounded-full text-xs font-medium"
                            >
                              {item.quantity}
                            </motion.span>
                          </p>
                        </div>
                      </div>
                      <motion.p
                        className="font-medium text-primary"
                        key={item.price * item.quantity}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                      >
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </motion.p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              <motion.div className="border-t pt-4 mt-4 space-y-3" variants={containerVariants}>
                <motion.div className="flex justify-between" variants={itemVariants}>
                  <span className="text-gray-600">Tạm tính:</span>
                  <motion.span key={total} initial={{ scale: 1.1 }} animate={{ scale: 1 }}>
                    {total.toLocaleString("vi-VN")}đ
                  </motion.span>
                </motion.div>

                <motion.div className="flex justify-between my-2" variants={itemVariants}>
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span>{shippingFee.toLocaleString("vi-VN")}đ</span>
                </motion.div>

                <motion.div className="flex justify-between font-bold pt-3 border-t" variants={itemVariants}>
                  <span>Tổng cộng:</span>
                  <motion.span
                    className="text-primary text-lg"
                    key={total + shippingFee}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    {(total + shippingFee).toLocaleString("vi-VN")}đ
                  </motion.span>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-4">
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm">
                      <span className="font-medium">Số tiền cần thanh toán: </span>
                      {shippingInfo.paymentMethod === "banking" ? (
                        <motion.span
                          key="banking"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-bold text-green-600"
                        >
                          0đ
                        </motion.span>
                      ) : (
                        <motion.span
                          key="cod"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-bold text-primary"
                        >
                          {(total + shippingFee).toLocaleString("vi-VN")}đ
                        </motion.span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {shippingInfo.paymentMethod === "banking"
                        ? "Bạn đã thanh toán trước qua chuyển khoản ngân hàng"
                        : "Bạn sẽ thanh toán khi nhận hàng (COD)"}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
