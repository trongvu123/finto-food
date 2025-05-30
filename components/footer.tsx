import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold">Finto</h3>
            <p className="mb-4 text-sm text-gray-600">Cung cấp thức ăn chất lượng cao cho thú cưng của bạn.</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/san-pham/cho" className="text-gray-600 hover:text-gray-900">
                  Thức ăn cho chó
                </Link>
              </li>
              <li>
                <Link href="/san-pham/meo" className="text-gray-600 hover:text-gray-900">
                  Thức ăn cho mèo
                </Link>
              </li>
              <li>
                <Link href="/san-pham/phu-kien" className="text-gray-600 hover:text-gray-900">
                  Phụ kiện
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Thông tin</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ve-chung-toi" className="text-gray-600 hover:text-gray-900">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                  Blog thú cưng
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-van-chuyen" className="text-gray-600 hover:text-gray-900">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-doi-tra" className="text-gray-600 hover:text-gray-900">
                  Chính sách đổi trả
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Liên hệ</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 text-gray-600" />
                <span className="text-gray-600">Hòa Lạc, Thạch Thất, Hà Nội</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-gray-600" />
                <span className="text-gray-600">0123 456 789</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-gray-600" />
                <span className="text-gray-600">info@finto.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Finto. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
