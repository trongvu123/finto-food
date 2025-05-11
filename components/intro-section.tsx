import { Shield, Truck, Award } from "lucide-react"

export default function IntroSection() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Tại sao chọn Finto?</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Chất lượng cao</h3>
            <p className="text-gray-600">
              Chúng tôi chỉ cung cấp thức ăn thú cưng chất lượng cao từ các thương hiệu uy tín.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Giao hàng nhanh chóng</h3>
            <p className="text-gray-600">
              Giao hàng nhanh chóng trong vòng 24 giờ đối với các đơn hàng trong nội thành.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Đảm bảo hài lòng</h3>
            <p className="text-gray-600">Chúng tôi cam kết hoàn tiền 100% nếu bạn không hài lòng với sản phẩm.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
