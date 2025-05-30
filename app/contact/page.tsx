export default function ContactPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Liên hệ hỗ trợ</h1>
            <p className="mb-4">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn. Vui lòng liên hệ qua các kênh sau:</p>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-3">Hỗ trợ qua email</h2>
                    <p className="text-gray-600 mb-4">Thời gian phản hồi: 24-48 giờ</p>
                    <p className="font-medium">support@example.com</p>
                </div>
                <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-3">Hỗ trợ qua điện thoại</h2>
                    <p className="text-gray-600 mb-4">Thời gian làm việc: 8:00 - 17:00</p>
                    <p className="font-medium">1900 1234 567</p>
                </div>
            </div>
        </div>
    )
}
