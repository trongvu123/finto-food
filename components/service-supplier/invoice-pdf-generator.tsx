"use client"

import { useState } from "react"
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer, Font } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, FileText, Printer } from "lucide-react"
import { toast } from "sonner"
Font.register({
    family: "Roboto",
    src:
        "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf"
});
interface ServiceOrder {
    id: string
    orderCode: string
    serviceName: string
    supplierName: string
    userName: string
    userPhone: string
    userAddress: string
    userEmail: string
    userNote?: string
    petName: string
    petBreed: string
    petAge: number
    petWeight: number
    petGender: "male" | "female"
    petImage: string
    petNote?: string
    petStatus: string
    orderTime: string
    paid: boolean
    status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
    paymentMethod: string
    total: number
    createdAt: string
    updatedAt: string
    service: {
        name: string
        supplier: {
            name: string
        }
    }
}

// PDF Styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: "Roboto",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: "#3b82f6",
    },
    logo: {
        flexDirection: "column",
    },
    companyName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 5,
    },
    companyTagline: {
        fontSize: 12,
        color: "#6b7280",
    },
    invoiceTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#3b82f6",
        textAlign: "right",
    },
    invoiceInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    invoiceDetails: {
        flexDirection: "column",
    },
    invoiceNumber: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 5,
    },
    invoiceDate: {
        fontSize: 12,
        color: "#6b7280",
        marginBottom: 5,
    },
    statusBadge: {
        backgroundColor: "#10b981",
        color: "#ffffff",
        padding: "4 8",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 5,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    customerInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    customerDetails: {
        flexDirection: "column",
        width: "48%",
    },
    petDetails: {
        flexDirection: "column",
        width: "48%",
    },
    infoRow: {
        flexDirection: "row",
        marginBottom: 5,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#374151",
        width: 100,
    },
    infoValue: {
        fontSize: 12,
        color: "#1f2937",
        flex: 1,
    },
    serviceTable: {
        marginBottom: 25,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f3f4f6",
        padding: 10,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    tableHeaderText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#374151",
    },
    tableRow: {
        flexDirection: "row",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    tableCell: {
        fontSize: 12,
        color: "#1f2937",
    },
    serviceName: {
        flex: 3,
    },
    serviceSupplier: {
        flex: 2,
    },
    serviceAmount: {
        flex: 1,
        textAlign: "right",
    },
    totalSection: {
        flexDirection: "column",
        alignItems: "flex-end",
        marginTop: 20,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: 200,
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 12,
        color: "#6b7280",
    },
    totalValue: {
        fontSize: 12,
        color: "#1f2937",
    },
    grandTotalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: 200,
        paddingTop: 10,
        borderTopWidth: 2,
        borderTopColor: "#3b82f6",
    },
    grandTotalLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1f2937",
    },
    grandTotalValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#3b82f6",
    },
    paymentInfo: {
        backgroundColor: "#f9fafb",
        padding: 15,
        borderRadius: 4,
        marginTop: 20,
    },
    paymentTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 10,
    },
    paymentDetails: {
        flexDirection: "column",
    },
    notes: {
        marginTop: 25,
        padding: 15,
        backgroundColor: "#fef3c7",
        borderRadius: 4,
    },
    notesTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#92400e",
        marginBottom: 5,
    },
    notesText: {
        fontSize: 11,
        color: "#92400e",
        lineHeight: 1.4,
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 30,
        right: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    footerText: {
        fontSize: 10,
        color: "#6b7280",
    },
    footerContact: {
        fontSize: 10,
        color: "#6b7280",
        textAlign: "right",
    },
})

// PDF Document Component
const InvoicePDF = ({ order }: { order: ServiceOrder }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "#10b981"
            case "IN_PROGRESS":
                return "#8b5cf6"
            case "CONFIRMED":
                return "#3b82f6"
            case "PENDING":
                return "#f59e0b"
            case "CANCELLED":
                return "#ef4444"
            default:
                return "#6b7280"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "Hoàn thành"
            case "IN_PROGRESS":
                return "Đang thực hiện"
            case "CONFIRMED":
                return "Đã xác nhận"
            case "PENDING":
                return "Chờ xác nhận"
            case "CANCELLED":
                return "Đã hủy"
            default:
                return status
        }
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logo}>
                        <Text style={styles.companyName}>PetCare Services</Text>
                        <Text style={styles.companyTagline}>Dịch vụ chăm sóc thú cưng chuyên nghiệp</Text>
                    </View>
                    <Text style={styles.invoiceTitle}>HÓA ĐƠN</Text>
                </View>

                {/* Invoice Info */}
                <View style={styles.invoiceInfo}>
                    <View style={styles.invoiceDetails}>
                        <Text style={styles.invoiceNumber}>Số hóa đơn: {order.orderCode}</Text>
                        <Text style={styles.invoiceDate}>Ngày tạo: {formatDate(order.createdAt)}</Text>
                        <Text style={styles.invoiceDate}>Ngày dịch vụ: {formatDate(order.orderTime)}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                            <Text>{getStatusLabel(order.status)}</Text>
                        </View>
                    </View>
                </View>

                {/* Customer and Pet Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin khách hàng & thú cưng</Text>
                    <View style={styles.customerInfo}>
                        <View style={styles.customerDetails}>
                            <Text style={[styles.infoLabel, { marginBottom: 10, fontSize: 14, color: "#3b82f6" }]}>Khách hàng</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Tên:</Text>
                                <Text style={styles.infoValue}>{order.userName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Điện thoại:</Text>
                                <Text style={styles.infoValue}>{order.userPhone}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Email:</Text>
                                <Text style={styles.infoValue}>{order.userEmail}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Địa chỉ:</Text>
                                <Text style={styles.infoValue}>{order.userAddress}</Text>
                            </View>
                        </View>

                        <View style={styles.petDetails}>
                            <Text style={[styles.infoLabel, { marginBottom: 10, fontSize: 14, color: "#3b82f6" }]}>Thú cưng</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Tên:</Text>
                                <Text style={styles.infoValue}>{order.petName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Giống:</Text>
                                <Text style={styles.infoValue}>{order.petBreed}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Tuổi:</Text>
                                <Text style={styles.infoValue}>{order.petAge} tháng</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Cân nặng:</Text>
                                <Text style={styles.infoValue}>{order.petWeight} kg</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Giới tính:</Text>
                                <Text style={styles.infoValue}>{order.petGender === "male" ? "Đực" : "Cái"}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Service Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chi tiết dịch vụ</Text>
                    <View style={styles.serviceTable}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, styles.serviceName]}>Dịch vụ</Text>
                            <Text style={[styles.tableHeaderText, styles.serviceSupplier]}>Nhà cung cấp</Text>
                            <Text style={[styles.tableHeaderText, styles.serviceAmount]}>Thành tiền</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.serviceName]}>{order.service.name}</Text>
                            <Text style={[styles.tableCell, styles.serviceSupplier]}>{order.service.supplier.name}</Text>
                            <Text style={[styles.tableCell, styles.serviceAmount]}>{formatCurrency(order.total)}</Text>
                        </View>
                    </View>

                    {/* Total Section */}
                    <View style={styles.totalSection}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tạm tính:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>VAT (0%):</Text>
                            <Text style={styles.totalValue}>0 ₫</Text>
                        </View>
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Tổng cộng:</Text>
                            <Text style={styles.grandTotalValue}>{formatCurrency(order.total)}</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Information */}
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>Thông tin thanh toán</Text>
                    <View style={styles.paymentDetails}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phương thức:</Text>
                            <Text style={styles.infoValue}>{order.paymentMethod}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Trạng thái:</Text>
                            <Text style={[styles.infoValue, { color: order.paid ? "#10b981" : "#ef4444" }]}>
                                {order.paid ? "Đã thanh toán" : "Chưa thanh toán"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Notes */}
                {(order.userNote || order.petNote) && (
                    <View style={styles.notes}>
                        <Text style={styles.notesTitle}>Ghi chú:</Text>
                        {order.userNote && <Text style={styles.notesText}>Khách hàng: {order.userNote}</Text>}
                        {order.petNote && <Text style={styles.notesText}>Thú cưng: {order.petNote}</Text>}
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.footerText}>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</Text>
                        <Text style={styles.footerText}>Hóa đơn được tạo tự động bởi hệ thống PetCare</Text>
                    </View>
                    <View>
                        <Text style={styles.footerContact}>Hotline: 1900-PETCARE</Text>
                        <Text style={styles.footerContact}>Email: support@petcare.vn</Text>
                        <Text style={styles.footerContact}>Website: www.petcare.vn</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}

// Main Component
interface InvoicePDFGeneratorProps {
    order: ServiceOrder
    variant?: "button" | "icon"
    size?: "sm" | "default" | "lg"
}

export default function InvoicePDFGenerator({ order, variant = "button", size = "default" }: InvoicePDFGeneratorProps) {
    const [showPreview, setShowPreview] = useState(false)

    const handleDownloadSuccess = () => {
        toast.success("Hóa đơn đã được tải xuống thành công!")
    }

    const handleDownloadError = () => {
        toast.error("Có lỗi xảy ra khi tải hóa đơn. Vui lòng thử lại!")
    }

    const ButtonContent = () => {
        if (variant === "icon") {
            return <Download className="h-4 w-4" />
        }
        return (
            <>
                <FileText className="h-4 w-4 mr-2" />
                Tải hóa đơn PDF
            </>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {/* Download Button */}
            <PDFDownloadLink
                document={<InvoicePDF order={order} />}
                fileName={`hoa-don-${order.orderCode}.pdf`}
                onLoad={handleDownloadSuccess}
            >
                {({ loading }) => (
                    <Button
                        variant={variant === "icon" ? "outline" : "default"}
                        size={size}
                        disabled={loading}
                        className={variant === "icon" ? "w-10 h-10 p-0" : ""}
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                        ) : (
                            <ButtonContent />
                        )}
                    </Button>
                )}
            </PDFDownloadLink>

            {/* Preview Button */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                    <Button variant="outline" size={size} className={variant === "icon" ? "w-10 h-10 p-0" : ""}>
                        {variant === "icon" ? (
                            <Eye className="h-4 w-4" />
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                Xem trước
                            </>
                        )}
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Xem trước hóa đơn #{order.orderCode}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
                        <PDFViewer width="100%" height="100%" showToolbar={true}>
                            <InvoicePDF order={order} />
                        </PDFViewer>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <div className="flex items-center gap-2">
                            <Badge variant={order.paid ? "default" : "outline"}>
                                {order.paid ? "Đã thanh toán" : "Chưa thanh toán"}
                            </Badge>
                            <span className="text-sm text-gray-500">
                                Tổng tiền: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total)}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <PDFDownloadLink
                                document={<InvoicePDF order={order} />}
                                fileName={`hoa-don-${order.orderCode}.pdf`}
                                onLoad={handleDownloadSuccess}
                            >
                                {({ loading }) => (
                                    <Button disabled={loading}>
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-2" />
                                        ) : (
                                            <Download className="h-4 w-4 mr-2" />
                                        )}
                                        Tải xuống
                                    </Button>
                                )}
                            </PDFDownloadLink>
                            <Button variant="outline" onClick={() => window.print()}>
                                <Printer className="h-4 w-4 mr-2" />
                                In
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
