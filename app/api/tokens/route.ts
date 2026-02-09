import { NextRequest } from 'next/server';
import { TokenDB } from '@/lib/db/database';
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    console.log(`[API] ${request.method} ${url.pathname}`);
    
    try {
        const tokens = TokenDB.getAll();
        return successResponse(tokens);
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
        
        if (!body.token_id || !body.ma_thiet_bi || !body.mat_khau || !body.ngay_hieu_luc) {
            return badRequestResponse('Missing required fields');
        }
        
        const result = TokenDB.create(body);
        return successResponse(result, 'Token created successfully');
    } catch (error) {
        console.error(`[API] Error in ${url.pathname}:`, error);
        return errorResponse(String(error));
    }
}
