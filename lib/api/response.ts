import { NextResponse } from 'next/server';

export type ApiResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};

export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
} as const;

export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
        success: true,
        data,
        ...(message && { message })
    }, { status: HttpStatus.OK });
}

export function createdResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
        success: true,
        data,
        ...(message && { message })
    }, { status: HttpStatus.CREATED });
}

export function errorResponse(error: string, status: number = HttpStatus.INTERNAL_ERROR): NextResponse<ApiResponse> {
    return NextResponse.json({
        success: false,
        error
    }, { status });
}

export function notFoundResponse(resource: string = 'Resource'): NextResponse<ApiResponse> {
    return errorResponse(`${resource} not found`, HttpStatus.NOT_FOUND);
}

export function badRequestResponse(message: string = 'Bad request'): NextResponse<ApiResponse> {
    return errorResponse(message, HttpStatus.BAD_REQUEST);
}
