
import { getAllDistricts } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { provinceId: string } }) {
    try {
        console.log('provinceId:', params.provinceId);
        const provinceIdNumber = Number(params.provinceId);
        // Định dạng provinceId với số 0 ở đầu nếu < 10
        const formattedProvinceId = String(provinceIdNumber).padStart(2, '0');
        const response = await getAllDistricts(formattedProvinceId);
        console.log('Response:', response.error_text);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching provinces:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provinces' },
            { status: 500 }
        );
    }
}