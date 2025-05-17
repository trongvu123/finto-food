import { getAllWards } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { districtId: string } }) {
    try {
        const resolvedParams = await params;
        const districtIdNumber = Number(resolvedParams.districtId);
        const formattedDistrictId = String(districtIdNumber).padStart(3, '0');
        const response = await getAllWards((formattedDistrictId));
        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch wards' }, { status: 500 });
    }
}