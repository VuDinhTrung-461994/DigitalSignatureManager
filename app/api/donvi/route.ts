import { NextRequest } from 'next/server';
import { DonViDB } from '@/lib/db/database';
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    console.log(`[API] ${request.method} ${url.pathname}`);
    
    try {
        const donViList = DonViDB.getAll();
        return successResponse(donViList);
    } catch (error) {
        console.error(`[API] Error in ${url.pathname}:`, error);
        return errorResponse(String(error));
    }
}

export async function POST(request: NextRequest) {
    const url = new URL(request.url);
    console.log(`[API] ${request.method} ${url.pathname}`);
    
    try {
        const body = await request.json();
        
        if (!body.id || !body.ten) {
            return badRequestResponse('Missing required fields: id, ten');
        }
        
        const result = DonViDB.create(body);
        return successResponse(result, 'DonVi created successfully');
    } catch (error) {
        console.error(`[API] Error in ${url.pathname}:`, error);
        return errorResponse(String(error));
    }
}
