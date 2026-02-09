# Hướng dẫn triển khai lên Vercel với PostgreSQL

## Vấn đề
SQLite không hoạt động trên Vercel vì Vercel là serverless platform, không cho phép ghi file vào filesystem.

## Giải pháp: Sử dụng Vercel Postgres

### Bước 1: Cài đặt dependencies

```bash
npm install @vercel/postgres
```

### Bước 2: Tạo database trên Vercel Dashboard

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn
3. Tab "Storage" → "Connect Store" → "Postgres"
4. Tạo database mới và connect với project

### Bước 3: Cập nhật code

Thay thế `lib/db/database.ts` bằng code sử dụng PostgreSQL:

```typescript
import { sql } from '@vercel/postgres';

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

// Initialize schema
export async function initSchema() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS DonVi (
                id TEXT PRIMARY KEY,
                ten TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await sql`
            CREATE TABLE IF NOT EXISTS Token (
                token_id TEXT PRIMARY KEY,
                ma_thiet_bi TEXT NOT NULL,
                mat_khau TEXT NOT NULL,
                ngay_hieu_luc TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await sql`
            CREATE TABLE IF NOT EXISTS User (
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
        
        console.log('[DB] Schema initialized');
    } catch (error) {
        console.error('[DB] Schema init error:', error);
    }
}

// DonVi operations
export const DonViDB = {
    create: async (donVi: DonVi) => {
        const result = await sql`
            INSERT INTO DonVi (id, ten) 
            VALUES (${donVi.id}, ${donVi.ten})
            RETURNING *
        `;
        return result.rows[0];
    },
    
    getAll: async (): Promise<DonVi[]> => {
        const result = await sql`SELECT * FROM DonVi`;
        return result.rows as DonVi[];
    },
    
    getById: async (id: string): Promise<DonVi | undefined> => {
        const result = await sql`SELECT * FROM DonVi WHERE id = ${id}`;
        return result.rows[0] as DonVi | undefined;
    },
    
    update: async (id: string, ten: string) => {
        const result = await sql`
            UPDATE DonVi 
            SET ten = ${ten}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ${id}
            RETURNING *
        `;
        return result.rows[0];
    },
    
    delete: async (id: string) => {
        await sql`DELETE FROM DonVi WHERE id = ${id}`;
    }
};

// Token operations
export const TokenDB = {
    create: async (token: Token) => {
        const result = await sql`
            INSERT INTO Token (token_id, ma_thiet_bi, mat_khau, ngay_hieu_luc) 
            VALUES (${token.token_id}, ${token.ma_thiet_bi}, ${token.mat_khau}, ${token.ngay_hieu_luc})
            RETURNING *
        `;
        return result.rows[0];
    },
    
    getAll: async (): Promise<Token[]> => {
        const result = await sql`SELECT * FROM Token`;
        return result.rows as Token[];
    },
    
    getById: async (tokenId: string): Promise<Token | undefined> => {
        const result = await sql`SELECT * FROM Token WHERE token_id = ${tokenId}`;
        return result.rows[0] as Token | undefined;
    },
    
    delete: async (tokenId: string) => {
        await sql`DELETE FROM Token WHERE token_id = ${tokenId}`;
    }
};

// User operations
export const UserDB = {
    create: async (user: User) => {
        const result = await sql`
            INSERT INTO User (user_id, ten, so_cccd, don_vi_id, token_id, uy_quyen) 
            VALUES (${user.user_id}, ${user.ten}, ${user.so_cccd}, ${user.don_vi_id || null}, ${user.token_id || null}, ${user.uy_quyen || null})
            RETURNING *
        `;
        return result.rows[0];
    },
    
    getAll: async (): Promise<User[]> => {
        const result = await sql`SELECT * FROM User`;
        return result.rows as User[];
    },
    
    getAllWithRelations: async (): Promise<UserWithRelations[]> => {
        const result = await sql`
            SELECT 
                u.*,
                dv.id as dv_id, dv.ten as dv_ten,
                t.token_id as t_token_id, t.ma_thiet_bi, t.mat_khau, t.ngay_hieu_luc
            FROM User u
            LEFT JOIN DonVi dv ON u.don_vi_id = dv.id
            LEFT JOIN Token t ON u.token_id = t.token_id
        `;
        
        return result.rows.map((row: any) => ({
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
        const result = await sql`SELECT * FROM User WHERE user_id = ${userId}`;
        return result.rows[0] as User | undefined;
    },
    
    update: async (userId: string, updates: Partial<User>) => {
        const fields: string[] = [];
        const values: any[] = [];
        
        if (updates.ten !== undefined) { fields.push(`ten = $${values.length + 1}`); values.push(updates.ten); }
        if (updates.so_cccd !== undefined) { fields.push(`so_cccd = $${values.length + 1}`); values.push(updates.so_cccd); }
        if (updates.don_vi_id !== undefined) { fields.push(`don_vi_id = $${values.length + 1}`); values.push(updates.don_vi_id); }
        if (updates.token_id !== undefined) { fields.push(`token_id = $${values.length + 1}`); values.push(updates.token_id); }
        if (updates.uy_quyen !== undefined) { fields.push(`uy_quyen = $${values.length + 1}`); values.push(updates.uy_quyen); }
        
        if (fields.length === 0) return null;
        
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);
        
        const query = `UPDATE User SET ${fields.join(', ')} WHERE user_id = $${values.length} RETURNING *`;
        const result = await sql.query(query, values);
        return result.rows[0];
    },
    
    delete: async (userId: string) => {
        await sql`DELETE FROM User WHERE user_id = ${userId}`;
    }
};
```

### Bước 4: Cập nhật API routes

Tất cả API routes cần thêm `async/await` và gọi `initSchema()`:

```typescript
// app/api/users/route.ts
import { sql } from '@vercel/postgres';
import { UserDB } from '@/lib/db/database';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const users = await UserDB.getAllWithRelations();
        return Response.json({ success: true, data: users });
    } catch (error) {
        console.error('[API] Error:', error);
        return Response.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await UserDB.create(body);
        return Response.json({ success: true, data: result });
    } catch (error) {
        console.error('[API] Error:', error);
        return Response.json({ success: false, error: String(error) }, { status: 500 });
    }
}
```

## Hoặc giải pháp đơn giản hơn: Sử dụng localStorage (chỉ cho development)

Nếu bạn chỉ cần demo, có thể dùng localStorage thay cho database:

```typescript
// lib/db/localStorage.ts
export const LocalDB = {
    getUsers: () => {
        const data = localStorage.getItem('users');
        return data ? JSON.parse(data) : [];
    },
    saveUsers: (users: any[]) => {
        localStorage.setItem('users', JSON.stringify(users));
    }
};
```

## Triển khai

1. Commit code mới
2. Push lên GitHub
3. Vercel sẽ tự động deploy

Lưu ý: Database PostgreSQL sẽ tự động được tạo khi bạn connect từ Vercel Dashboard.
