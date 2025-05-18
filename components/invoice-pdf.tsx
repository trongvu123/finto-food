"use client"

import type { Invoice } from "@/app/thanh-toan/xac-nhan/page"
import { formatCurrency } from "@/lib/utils"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
Font.register({
    family: "Roboto",
    src:
        "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf"
});
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: "Roboto",

    },
    header: {
        marginBottom: 20,
        borderBottom: "1 solid #EEEEEE",
        paddingBottom: 10,
    },
    logo: {
        width: 100,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#666666",
        marginBottom: 5,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        backgroundColor: "#F9FAFB",
        padding: 5,
    },
    row: {
        flexDirection: "row",
        marginBottom: 5,
    },
    column: {
        flexDirection: "column",
        marginBottom: 10,
    },
    label: {
        width: 120,
        fontWeight: "bold",
        fontSize: 12,
    },
    value: {
        flex: 1,
        fontSize: 12,
    },
    table: {
        display: "flex",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#EEEEEE",
        marginBottom: 20,
    },

    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
        borderBottomStyle: "solid",
        alignItems: "center",
        minHeight: 30,
    },
    tableHeader: {
        backgroundColor: "#F9FAFB",
        fontWeight: "bold",
    },
    tableCell: {
        flex: 1,
        fontSize: 10,
        padding: 5,
        textAlign: "center",
    },
    tableCellWide: {
        flex: 2,
        fontSize: 10,
        padding: 5,
        textAlign: "left",
    },
    total: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",
        borderTopStyle: "solid",
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: "bold",
        marginRight: 10,
    },
    totalValue: {
        fontSize: 14,
        fontWeight: "bold",
    },
    footer: {
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",
        borderTopStyle: "solid",
        paddingTop: 10,
        fontSize: 10,
        color: "#666666",
        textAlign: "center",
    },
})

const InvoiceDocument = ({ invoice }: { invoice: Invoice }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Finto Pet Food</Text>
                <Text style={styles.subtitle}>Hóa đơn mua hàng</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Mã đơn hàng:</Text>
                    <Text style={styles.value}>{invoice.id}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Ngày đặt hàng:</Text>
                    <Text style={styles.value}>
                        {new Date(invoice.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Phương thức:</Text>
                    <Text style={styles.value}>{invoice.paymentMethod}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Họ tên:</Text>
                    <Text style={styles.value}>{invoice.fullName}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{invoice.email}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Số điện thoại:</Text>
                    <Text style={styles.value}>{invoice.phone}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Địa chỉ:</Text>
                    <Text style={styles.value}>
                        {invoice.shippingAddress}, {invoice.shippingWard}, {invoice.shippingDistrict}, {invoice.shippingProvince}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chi tiết sản phẩm</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.tableCellWide}>Sản phẩm</Text>
                        <Text style={styles.tableCell}>Đơn giá</Text>
                        <Text style={styles.tableCell}>Số lượng</Text>
                        <Text style={styles.tableCell}>Thành tiền</Text>
                    </View>
                    {invoice.items.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCellWide}>{item.product.name}</Text>
                            <Text style={styles.tableCell}>{formatCurrency(item.product.price)}</Text>
                            <Text style={styles.tableCell}>{item.quantity}</Text>
                            <Text style={styles.tableCell}>{formatCurrency(item.product.price * item.quantity)}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.total}>
                <Text style={styles.totalLabel}>Tổng cộng:</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.total)}</Text>
            </View>
            {
                (invoice.paymentMethod === "cod" && invoice.total < 500000)  && (
                    <View style={styles.total}>
                        <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(30000)}</Text>
                    </View>
                )
            }

            <View style={styles.total}>
                <Text style={styles.totalLabel}>Cần thanh toán:</Text>
                <Text style={styles.totalValue}>
                    {invoice.paymentMethod.toLowerCase().includes("cod") ? formatCurrency(invoice.total < 500000 ? invoice.total + 30000 : invoice.total) : formatCurrency(0)}
                </Text>
            </View>

            <View style={styles.footer}>
                <Text>Cảm ơn quý khách đã mua hàng tại Finto Pet Food!</Text>
                <Text>Mọi thắc mắc xin liên hệ: hotro@fintopetfood.vn | 1900 1234</Text>
            </View>
        </Page>
    </Document>
)

export function InvoicePDF({ invoice }: { invoice: Invoice }) {
    return (
        <PDFDownloadLink
            document={<InvoiceDocument invoice={invoice} />}
            fileName={`hoa-don-${invoice.id}.pdf`}
            className="w-full"
        >
            {({ loading }) => (
                <Button className="w-full" disabled={loading}>
                    <FileDown className="mr-2 h-4 w-4" />
                    {loading ? "Đang tạo hóa đơn..." : "Tải hóa đơn PDF"}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
