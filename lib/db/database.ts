import { neon } from '@neondatabase/serverless';

// Get database connection string from environment
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
    console.warn('[DB] WARNING: DATABASE_URL not set. Database operations will fail.');
}

// Create SQL client
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// Models
export interface DonVi {
    id: string;
    ten: string;
    created_at?: string;
    updated_at?: string;
}

export interface Token {
    token_id: string;
    ma_thiet_bi: string;
    mat_khau: string;
    ngay_hieu_luc: string;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    user_id: string;
    ten: string;
    so_cccd: number;
    don_vi_id?: string;
    token_id?: string;
    uy_quyen?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserWithRelations extends User {
    don_vi?: DonVi;
    token?: Token;
}

// Helper to check if database is connected
function checkDb() {
    if (!sql) {
        throw new Error('Database not configured. Please set DATABASE_URL environment variable.');
    }
    return sql;
}

// Initialize schema - run this once
export async function initSchema() {
    try {
        const db = checkDb();
        
        console.log('[DB] Initializing PostgreSQL schema...');
        
        // Create tables
        await db`
            CREATE TABLE IF NOT EXISTS DonVi (
                id TEXT PRIMARY KEY,
                ten TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await db`
            CREATE TABLE IF NOT EXISTS Token (
                token_id TEXT PRIMARY KEY,
                ma_thiet_bi TEXT NOT NULL,
                mat_khau TEXT NOT NULL,
                ngay_hieu_luc TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await db`
            CREATE TABLE IF NOT EXISTS "User" (
                user_id TEXT PRIMARY KEY,
                ten TEXT NOT NULL,
                so_cccd INTEGER NOT NULL,
                don_vi_id TEXT,
                token_id TEXT,
                uy_quyen TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        console.log('[DB] Schema initialized successfully');
        return true;
    } catch (error) {
        console.error('[DB] Schema init error:', error);
        throw error;
    }
}

// DonVi operations
export const DonViDB = {
    create: async (donVi: DonVi) => {
        const db = checkDb();
        const result = await db`
            INSERT INTO DonVi (id, ten) 
            VALUES (${donVi.id}, ${donVi.ten})
            RETURNING *
        `;
        return result[0];
    },
    
    getAll: async (): Promise<DonVi[]> => {
        const db = checkDb();
        const result = await db`SELECT * FROM DonVi`;
        return result as DonVi[];
    },
    
    getById: async (id: string): Promise<DonVi | undefined> => {
        const db = checkDb();
        const result = await db`SELECT * FROM DonVi WHERE id = ${id}`;
        return result[0] as DonVi | undefined;
    },
    
    update: async (id: string, ten: string) => {
        const db = checkDb();
        const result = await db`
            UPDATE DonVi 
            SET ten = ${ten}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ${id}
            RETURNING *
        `;
        return result[0];
    },
    
    delete: async (id: string) => {
        const db = checkDb();
        await db`DELETE FROM DonVi WHERE id = ${id}`;
    }
};

// Token operations
export const TokenDB = {
    create: async (token: Token) => {
        const db = checkDb();
        const result = await db`
            INSERT INTO Token (token_id, ma_thiet_bi, mat_khau, ngay_hieu_luc) 
            VALUES (${token.token_id}, ${token.ma_thiet_bi}, ${token.mat_khau}, ${token.ngay_hieu_luc})
            RETURNING *
        `;
        return result[0];
    },
    
    getAll: async (): Promise<Token[]> => {
        const db = checkDb();
        const result = await db`SELECT * FROM Token`;
        return result as Token[];
    },
    
    getById: async (tokenId: string): Promise<Token | undefined> => {
        const db = checkDb();
        const result = await db`SELECT * FROM Token WHERE token_id = ${tokenId}`;
        return result[0] as Token | undefined;
    },
    
    delete: async (tokenId: string) => {
        const db = checkDb();
        await db`DELETE FROM Token WHERE token_id = ${tokenId}`;
    }
};

// User operations
export const UserDB = {
    create: async (user: User) => {
        const db = checkDb();
        const result = await db`
            INSERT INTO "User" (user_id, ten, so_cccd, don_vi_id, token_id, uy_quyen) 
            VALUES (${user.user_id}, ${user.ten}, ${user.so_cccd}, ${user.don_vi_id || null}, ${user.token_id || null}, ${user.uy_quyen || null})
            RETURNING *
        `;
        return result[0];
    },
    
    getAll: async (): Promise<User[]> => {
        const db = checkDb();
        const result = await db`SELECT * FROM "User"`;
        return result as User[];
    },
    
    getAllWithRelations: async (): Promise<UserWithRelations[]> => {
        const db = checkDb();
        const result = await db`
            SELECT 
                u.*,
                dv.id as dv_id, dv.ten as dv_ten,
                t.token_id as t_token_id, t.ma_thiet_bi, t.mat_khau, t.ngay_hieu_luc
            FROM "User" u
            LEFT JOIN DonVi dv ON u.don_vi_id = dv.id
            LEFT JOIN Token t ON u.token_id = t.token_id
        `;
        
        return result.map((row: any) => ({
            user_id: row.user_id,
            ten: row.ten,
            so_cccd: row.so_cccd,
            don_vi_id: row.don_vi_id,
            token_id: row.token_id,
            uy_quyen: row.uy_quyen,
            created_at: row.created_at,
            updated_at: row.updated_at,
            don_vi: row.dv_id ? { id: row.dv_id, ten: row.dv_ten } : undefined,
            token: row.t_token_id ? { 
                token_id: row.t_token_id, 
                ma_thiet_bi: row.ma_thiet_bi, 
                mat_khau: row.mat_khau, 
                ngay_hieu_luc: row.ngay_hieu_luc 
            } : undefined
        }));
    },
    
    getById: async (userId: string): Promise<User | undefined> => {
        const db = checkDb();
        const result = await db`SELECT * FROM "User" WHERE user_id = ${userId}`;
        return result[0] as User | undefined;
    },
    
    update: async (userId: string, updates: Partial<User>) => {
        const db = checkDb();
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;
        
        if (updates.ten !== undefined) { fields.push(`ten = $${paramIndex++}`); values.push(updates.ten); }
        if (updates.so_cccd !== undefined) { fields.push(`so_cccd = $${paramIndex++}`); values.push(updates.so_cccd); }
        if (updates.don_vi_id !== undefined) { fields.push(`don_vi_id = $${paramIndex++}`); values.push(updates.don_vi_id); }
        if (updates.token_id !== undefined) { fields.push(`token_id = $${paramIndex++}`); values.push(updates.token_id); }
        if (updates.uy_quyen !== undefined) { fields.push(`uy_quyen = $${paramIndex++}`); values.push(updates.uy_quyen); }
        
        if (fields.length === 0) return null;
        
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);
        
        const query = `UPDATE "User" SET ${fields.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },
    
    delete: async (userId: string) => {
        const db = checkDb();
        await db`DELETE FROM "User" WHERE user_id = ${userId}`;
    }
};

console.log('[DB] PostgreSQL module loaded');
