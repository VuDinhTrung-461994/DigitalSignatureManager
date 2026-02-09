import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST() {
    try {
        console.log('[SETUP] Running prisma db push...');
        
        // Chạy prisma db push
        const result = execSync('npx prisma db push --accept-data-loss', {
            encoding: 'utf-8',
            env: { ...process.env, NODE_ENV: 'production' }
        });
        
        console.log('[SETUP] Result:', result);
        
        return NextResponse.json({
            success: true,
            message: 'Database schema pushed successfully',
            output: result
        });
    } catch (error: any) {
        console.error('[SETUP] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stderr: error.stderr?.toString()
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST to setup database schema',
        command: 'curl -X POST https://your-app.vercel.app/api/setup-db'
    });
}
