import { NextRequest } from 'next/server';
import { UserDB } from '@/lib/db/database';
import { successResponse, errorResponse, notFoundResponse, badRequestResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    console.log(`[API] ${request.method} ${url.pathname}`);
    
    try {
        const users = UserDB.getAllWithRelations();
        return successResponse(users);
    } catch (error) {
        console.error(`[API] Error in ${url.pathname}:`, error);
        return errorResponse(String(error));
    }
}

export async function POST(request: NextRequest) {
    const url = new URL(request.url);
    console.log(`[API] ${request.method} ${url.pathname}`);
    
    let body: any;
    
    try {
        body = await request.json();
        
        // Validation
        if (!body.user_id || !body.ten || body.so_cccd === undefined) {
            return badRequestResponse('Missing required fields: user_id, ten, so_cccd');
        }
        
        // Check if user_id already exists
        const existingUser = UserDB.getById(body.user_id);
        if (existingUser) {
            return badRequestResponse(`User with ID '${body.user_id}' already exists`);
        }
        
        const result = UserDB.create(body);
        return successResponse(result, 'User created successfully');
    } catch (error) {
        console.error(`[API] Error in ${url.pathname}:`, error);
        
        // Handle specific SQLite errors
        const errorMessage = String(error);
        if (errorMessage.includes('UNIQUE constraint failed')) {
            if (body?.user_id && errorMessage.includes('user_id')) {
                return badRequestResponse(`User with ID '${body.user_id}' already exists`);
            }
            return badRequestResponse('Duplicate entry violates unique constraint');
        }
        
        return errorResponse(errorMessage);
    }
}
