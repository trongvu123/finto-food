import { getAllProvinces } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const response = await getAllProvinces();
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