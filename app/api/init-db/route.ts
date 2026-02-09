import { DonViDB, TokenDB, UserDB, initSchema } from '@/lib/db/database';
import { successResponse, errorResponse } from '@/lib/api/response';

const sampleDonVi = [
    { id: 'DV001', ten: 'Phòng Kỹ thuật' },
    { id: 'DV002', ten: 'Phòng Hành chính' },
    { id: 'DV003', ten: 'Phòng Kế toán' }
];

const sampleTokens = [
    {
        token_id: 'TK001',
        ma_thiet_bi: 'USB-TOKEN-001',
        mat_khau: 'password123',
        ngay_hieu_luc: '2026-12-31 23:59:59'
    },
    {
        token_id: 'TK002',
        ma_thiet_bi: 'USB-TOKEN-002',
        mat_khau: 'password456',
        ngay_hieu_luc: '2026-12-31 23:59:59'
    }
];

const sampleUsers = [
    {
        user_id: 'USER001',
        ten: 'Nguyễn Văn A',
        so_cccd: 123456789,
        don_vi_id: 'DV001',
        token_id: 'TK001',
        uy_quyen: 'Admin'
    },
    {
        user_id: 'USER002',
        ten: 'Trần Thị B',
        so_cccd: 987654321,
        don_vi_id: 'DV002',
        token_id: 'TK002',
        uy_quyen: 'User'
    }
];

export async function POST(request: Request) {
    const url = new URL(request.url);
    console.log(`[API] POST ${url.pathname}`);
    
    try {
        // Initialize schema first
        await initSchema();
        
        // Check if data exists
        const existingDonVi = await DonViDB.getAll();
        if (existingDonVi && existingDonVi.length > 0) {
            return successResponse({ initialized: false }, 'Database already initialized');
        }
        
        // Insert sample data
        for (const dv of sampleDonVi) await DonViDB.create(dv);
        for (const token of sampleTokens) await TokenDB.create(token);
        for (const user of sampleUsers) await UserDB.create(user);
        
        return successResponse({
            donVi: sampleDonVi.length,
            tokens: sampleTokens.length,
            users: sampleUsers.length
        }, 'Database initialized successfully');
    } catch (error) {
        console.error(`[API] Error in ${url.pathname}:`, error);
        return errorResponse(String(error));
    }
}
