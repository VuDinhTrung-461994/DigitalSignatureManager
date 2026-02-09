import { NextResponse } from 'next/server';

export async function GET() {
    // Chỉ log trong server-side
    const envInfo = {
        // Database URLs (chỉ hiển thị có hay không, không hiển thị giá trị để bảo mật)
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasPostgresUrlNonPooling: !!process.env.POSTGRES_URL_NON_POOLING,
        hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
        
        // Database connection details (không chứa password)
        postgresHost: process.env.POSTGRES_HOST || null,
        postgresUser: process.env.POSTGRES_USER || null,
        postgresDatabase: process.env.POSTGRES_DATABASE || null,
        
        // Tất cả env vars liên quan đến POSTGRES/DATABASE
        availableEnvVars: Object.keys(process.env).filter(k => 
            k.includes('POSTGRES') || k.includes('DATABASE')
        ),
        
        // Environment
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || null,
    };
    
    return NextResponse.json({
        success: true,
        message: 'Environment variables check',
        data: envInfo,
        instructions: envInfo.hasPostgresUrl 
            ? '✅ POSTGRES_URL is configured! Database should work.'
            : '❌ POSTGRES_URL not found. Please connect Vercel Postgres to this project.'
    });
}
