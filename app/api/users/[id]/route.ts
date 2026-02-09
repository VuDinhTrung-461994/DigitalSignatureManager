import { NextRequest } from 'next/server';
import { UserDB } from '@/lib/db/database';
import { successResponse, errorResponse, notFoundResponse, badRequestResponse } from '@/lib/api/response';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const url = new URL(request.url);
    const { id } = await params;
    console.log(`[API] ${request.method} ${url.pathname}`);
    
    try {
        const user = UserDB.getById(id);
        if (!user) {
            return notFoundResponse('User');
        }
        return successResponse(user);
    } catch (error) {
        console.error(`[API] Error in ${url.pathname}:`, error);
        return errorResponse(String(error));
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const url = new URL(request.url);
    const { id } = await params;
    console.log(`[API] ${request.method} ${url.pathname}`);
    
    try {
        // Check if user exists
        const existingUser = UserDB.getById(id);
        if (!existingUser) {
            return notFoundResponse('User');
        }
        
        const body = await request.json();
        console.log(`[API] Update data:`, body);
        
        // Remove user_id from updates (cannot change primary key)
        const { user_id, ...updates } = body;
        
        if (Object.keys(updates).length === 0) {
            return badRequestResponse('No fields provided to update');
        }
        
        const result = UserDB.update(id, updates);
        
        if (result === null) {
            return badRequestResponse('No valid fields to update');
        }
        
        return successResponse(result, 'User updated successfully');
    } catch (error) {
        console.error(`[API] Error in ${url.pathname}:`, error);
        return errorResponse(String(error));
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const url = new URL(request.url);
    const { id } = await params;
    console.log(`[API] ${request.method} ${url.pathname}`);
    
    try {
        // Check if user exists
        const existingUser = UserDB.getById(id);
        if (!existingUser) {
            return notFoundResponse('User');
        }
        
        const result = UserDB.delete(id);
        return successResponse(result, 'User deleted successfully');
    } catch (error) {
        console.error(`[API] Error in ${url.pathname}:`, error);
        return errorResponse(String(error));
    }
}
