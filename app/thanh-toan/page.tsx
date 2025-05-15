"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { createOrder, createPayment, IAddressResponse, IDistrict, IProvince, IWard, sGetAllDistricts, sGetAllProvinces, sGetAllWards } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/components/app-provider"
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from "@/hooks/use-toast"



export default function PaymentPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [addressResponse, setAddressResponse] = useState<IAddressResponse<IProvince> | null>(null);
  const [districtsResponse, setDistrictsResponse] = useState<IAddressResponse<IDistrict> | null>(null);
  const [wardsResponse, setWardsResponse] = useState<IAddressResponse<IWard> | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);
  const [qrcode, setQrcode] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const qrSvg = useRef<HTMLDivElement>(null)
  const user = useAppStore((state) => state.user)
  const {toast} = useToast() 
  console.log("user dat hang", user)
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    paymentMethod: "cod"
  })

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const resAddress = await sGetAllProvinces();
        setAddressResponse(resAddress);
        console.log('Full response:', resAddress);
        console.log('Provinces data:', resAddress.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };

    fetchProvinces();
  }, []);

    const createPaymentLink = async () => {
                    const province = addressResponse?.data.find(
                p => String(p.id) === String(shippingInfo.province)
            )?.full_name || '';
            const district = districtsResponse?.data.find(
                d => String(d.id) === String(shippingInfo.district)
            )?.full_name || '';
            const ward = wardsResponse?.data.find(
                w => String(w.id) === String(shippingInfo.ward)
            )?.full_name || '';
        const createQrCode = await createPayment( 
        items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingInfo.address, province, district, ward, shippingInfo.phone, shippingInfo.paymentMethod, shippingInfo.name, shippingInfo.email, user?.id);
        if(createQrCode.checkoutUrl){
          window.location.href = createQrCode.checkoutUrl
        }

        setQrcode(createQrCode.checkoutUrl);
    
    };

  useEffect(() => {
    const handleSelectProvince = async () => {
      if (!selectedProvinceId) return;
      try {
        setDistrictLoading(true);
        const resDistrict = await sGetAllDistricts(selectedProvinceId);
        setWardsResponse(null);
        if (resDistrict) {
          setDistrictsResponse(resDistrict);
          setDistrictLoading(false);
        }
        console.log('resDistrict', resDistrict);

      } catch (error) {
        console.log(error);
      }
    }
    handleSelectProvince();
  }, [selectedProvinceId])

  useEffect(() => {
    const handleSelectDistrict = async () => {
      if (!selectedDistrictId) return;
      try {
        setWardLoading(true);
        const resWard = await sGetAllWards(selectedDistrictId);
        if (resWard) {
          setWardsResponse(resWard);
          setWardLoading(false);
        }
      } catch (error) {
        console.log(error);
      }

    }
    handleSelectDistrict();
  }, [selectedDistrictId])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
            const province = addressResponse?.data.find(
                p => String(p.id) === String(shippingInfo.province)
            )?.full_name || '';
            const district = districtsResponse?.data.find(
                d => String(d.id) === String(shippingInfo.district)
            )?.full_name || '';
            const ward = wardsResponse?.data.find(
                w => String(w.id) === String(shippingInfo.ward)
            )?.full_name || '';
    try {
      await createOrder({
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingAddress: shippingInfo.address,
        shippingProvince: province,
        shippingDistrict: district,
        shippingWard: ward,
        phone: shippingInfo.phone,
        paymentMethod: shippingInfo.paymentMethod,
        fullName: shippingInfo.name,
        email: shippingInfo.email,
        userId: user?.id
      })

      toast({
        title: "Thanh toán thành công",
        duration: 2000,
      })
      clearCart()
      router.push("/thanh-toan/xac-nhan")
    } catch (error) {
      toast({
        title: "Thanh thất bại",
        duration: 2000,
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
          <p className="mb-4">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <Button onClick={() => router.push("/san-pham")}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Thanh toán</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    value={shippingInfo.name}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={shippingInfo.email}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Địa chỉ chi tiết</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="province">Tỉnh/Thành phố</Label>
                  <Select
                    value={shippingInfo.province}
                    onValueChange={(value) => {

                      setShippingInfo({
                        ...shippingInfo,
                        province: value,
                        district: "",
                        ward: ""
                      })
                      setSelectedProvinceId(value);
                    }}

                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                      {addressResponse ? addressResponse?.data.map((province) => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.full_name}
                        </SelectItem>
                      )) : []}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="district">Quận/Huyện</Label>
                  <Select
                    value={shippingInfo.district}
                    onValueChange={(value) => {
                      setShippingInfo({
                        ...shippingInfo,
                        district: value,
                        ward: ""
                      })
                      setSelectedDistrictId(value);
                    }

                    }
                    disabled={!shippingInfo.province}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Quận/Huyện" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtsResponse?.data && districtsResponse?.data?.map(
                        (district) => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ward">Phường/Xã</Label>
                  <Select
                    value={shippingInfo.ward}
                    onValueChange={(value) => {
                      setShippingInfo({ ...shippingInfo, ward: value })
                      setSelectedWardId(value);
                    }
                    }
                    disabled={!shippingInfo.district}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Phường/Xã" />
                    </SelectTrigger>
                    <SelectContent>
                      {wardsResponse ? wardsResponse?.data?.map((ward) => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.name}
                        </SelectItem>
                      )) : []}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phương thức thanh toán</Label>
                  <RadioGroup
                    value={shippingInfo.paymentMethod}
                    onValueChange={(value) => {
                      setShippingInfo({ ...shippingInfo, paymentMethod: value });
                      setSelectedWardId(value);
                    }}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod">Thanh toán khi nhận hàng (COD)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="banking" id="banking" onChange={(e) => {
                        setPaymentMethod(e.currentTarget.value)
                      }} />
                      <Label htmlFor="banking">Chuyển khoản ngân hàng</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {
                  shippingInfo.paymentMethod === "cod" ? (
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Đang xử lý..." : "Đặt hàng"}
                    </Button>
                  ) : (
                    
                        <Button onClick={createPaymentLink} type="button" className="w-full" disabled={loading}>
                          {loading ? "Đang xử lý..." : "Đặt hàng"}
                        </Button>
                      

                  )
                }

              </form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Tổng cộng:</span>
                    <span>{total.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
