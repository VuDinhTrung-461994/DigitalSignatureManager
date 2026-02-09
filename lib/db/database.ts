import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database configuration
const DB_PATH = path.resolve(process.cwd(), 'data', 'app.db');

// Ensure data directory exists
function ensureDataDir() {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

// Helper function to get current timestamp
function getCurrentTimestamp(): string {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// Initialize database - create connection and schema
function initDatabase(): Database.Database {
    console.log('[DB] Initializing database at:', DB_PATH);
    
    ensureDataDir();
    
    const db = new Database(DB_PATH);
    db.pragma('busy_timeout = 10000');
    db.pragma('journal_mode = WAL');
    
    // Create tables with timestamps
    const schema = `
        CREATE TABLE IF NOT EXISTS DonVi (
            id TEXT PRIMARY KEY,
            ten TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Token (
            token_id TEXT PRIMARY KEY,
            ma_thiet_bi TEXT NOT NULL,
            mat_khau TEXT NOT NULL,
            ngay_hieu_luc DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS User (
            user_id TEXT PRIMARY KEY,
            ten TEXT NOT NULL,
            so_cccd INTEGER NOT NULL,
            don_vi_id TEXT,
            token_id TEXT,
            uy_quyen TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (don_vi_id) REFERENCES DonVi(id) ON DELETE SET NULL,
            FOREIGN KEY (token_id) REFERENCES Token(token_id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_user_donvi ON User(don_vi_id);
        CREATE INDEX IF NOT EXISTS idx_user_token ON User(token_id);
        CREATE INDEX IF NOT EXISTS idx_token_mtb ON Token(ma_thiet_bi);
    `;
    
    db.exec(schema);
    
    // Migration: Add timestamps columns if they don't exist (for existing databases)
    // Run migrations one at a time to handle errors gracefully
    const runMigration = (tableName: string) => {
        try {
            const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
            const hasCreatedAt = columns.some(col => col.name === 'created_at');
            const hasUpdatedAt = columns.some(col => col.name === 'updated_at');
            
            if (!hasCreatedAt) {
                db.exec(`ALTER TABLE ${tableName} ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
                console.log(`[DB] Migration: Added created_at to ${tableName} table`);
            }
            
            if (!hasUpdatedAt) {
                db.exec(`ALTER TABLE ${tableName} ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
                console.log(`[DB] Migration: Added updated_at to ${tableName} table`);
            }
        } catch (err: any) {
            // If error is about column already exists, ignore it
            if (err.message && err.message.includes('duplicate column name')) {
                console.log(`[DB] Migration: Columns already exist in ${tableName}`);
            } else {
                console.log(`[DB] Migration error for ${tableName}:`, err.message || err);
            }
        }
    };
    
    // Run migrations for each table
    runMigration('User');
    runMigration('Token');
    runMigration('DonVi');
    
    console.log('[DB] Database initialized successfully');
    
    return db;
}

// Global database instance
let db: Database.Database | null = null;

// Get database instance (singleton)
export function getDb(): Database.Database {
    if (!db) {
        db = initDatabase();
    }
    return db;
}

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

// Helper function
function withDb<T>(callback: (db: Database.Database) => T): T {
    const db = getDb();
    return callback(db);
}

// DonVi operations
export const DonViDB = {
    create: (donVi: DonVi) => {
        return withDb((db) => {
            console.log('[DB] Creating DonVi:', donVi.id);
            const stmt = db.prepare('INSERT INTO DonVi (id, ten) VALUES (?, ?)');
            const result = stmt.run(donVi.id, donVi.ten);
            console.log('[DB] DonVi created:', result.changes, 'rows');
            return result;
        });
    },
    
    getAll: (): DonVi[] => {
        return withDb((db) => {
            return db.prepare('SELECT * FROM DonVi').all() as DonVi[];
        });
    },
    
    getById: (id: string): DonVi | undefined => {
        return withDb((db) => {
            return db.prepare('SELECT * FROM DonVi WHERE id = ?').get(id) as DonVi | undefined;
        });
    },
    
    update: (id: string, ten: string) => {
        return withDb((db) => {
            // Check if updated_at column exists
            try {
                const pragma = db.prepare("PRAGMA table_info(DonVi)").all() as any[];
                const hasUpdatedAt = pragma.some(col => col.name === 'updated_at');
                if (hasUpdatedAt) {
                    const stmt = db.prepare('UPDATE DonVi SET ten = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
                    return stmt.run(ten, id);
                }
            } catch (e) {
                // Ignore error
            }
            // Fallback without updated_at
            const stmt = db.prepare('UPDATE DonVi SET ten = ? WHERE id = ?');
            return stmt.run(ten, id);
        });
    },
    
    delete: (id: string) => {
        return withDb((db) => {
            const stmt = db.prepare('DELETE FROM DonVi WHERE id = ?');
            return stmt.run(id);
        });
    }
};

// Token operations
export const TokenDB = {
    create: (token: Token) => {
        return withDb((db) => {
            console.log('[DB] Creating Token:', token.token_id);
            const stmt = db.prepare('INSERT INTO Token (token_id, ma_thiet_bi, mat_khau, ngay_hieu_luc) VALUES (?, ?, ?, ?)');
            const result = stmt.run(token.token_id, token.ma_thiet_bi, token.mat_khau, token.ngay_hieu_luc);
            console.log('[DB] Token created:', result.changes, 'rows');
            return result;
        });
    },
    
    getAll: (): Token[] => {
        return withDb((db) => {
            return db.prepare('SELECT * FROM Token').all() as Token[];
        });
    },
    
    getById: (tokenId: string): Token | undefined => {
        return withDb((db) => {
            return db.prepare('SELECT * FROM Token WHERE token_id = ?').get(tokenId) as Token | undefined;
        });
    },
    
    delete: (tokenId: string) => {
        return withDb((db) => {
            const stmt = db.prepare('DELETE FROM Token WHERE token_id = ?');
            return stmt.run(tokenId);
        });
    }
};

// User operations
export const UserDB = {
    create: (user: User) => {
        return withDb((db) => {
            console.log('[DB] Creating User:', user.user_id);
            const stmt = db.prepare(`
                INSERT INTO User (user_id, ten, so_cccd, don_vi_id, token_id, uy_quyen) 
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(
                user.user_id, 
                user.ten, 
                user.so_cccd, 
                user.don_vi_id || null, 
                user.token_id || null, 
                user.uy_quyen || null
            );
            console.log('[DB] User created:', result.changes, 'rows');
            return result;
        });
    },
    
    getAll: (): User[] => {
        return withDb((db) => {
            return db.prepare('SELECT * FROM User').all() as User[];
        });
    },
    
    getAllWithRelations: (): UserWithRelations[] => {
        return withDb((db) => {
            const query = `
                SELECT 
                    u.*,
                    dv.id as dv_id, dv.ten as dv_ten,
                    t.token_id as t_token_id, t.ma_thiet_bi, t.mat_khau, t.ngay_hieu_luc
                FROM User u
                LEFT JOIN DonVi dv ON u.don_vi_id = dv.id
                LEFT JOIN Token t ON u.token_id = t.token_id
            `;
            const rows = db.prepare(query).all() as any[];
            
            return rows.map(row => ({
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
        });
    },
    
    getById: (userId: string): User | undefined => {
        return withDb((db) => {
            return db.prepare('SELECT * FROM User WHERE user_id = ?').get(userId) as User | undefined;
        });
    },
    
    update: (userId: string, updates: Partial<User>) => {
        return withDb((db) => {
            const fields: string[] = [];
            const values: (string | number | undefined)[] = [];
            
            if (updates.ten !== undefined) { fields.push('ten = ?'); values.push(updates.ten); }
            if (updates.so_cccd !== undefined) { fields.push('so_cccd = ?'); values.push(updates.so_cccd); }
            if (updates.don_vi_id !== undefined) { fields.push('don_vi_id = ?'); values.push(updates.don_vi_id); }
            if (updates.token_id !== undefined) { fields.push('token_id = ?'); values.push(updates.token_id); }
            if (updates.uy_quyen !== undefined) { fields.push('uy_quyen = ?'); values.push(updates.uy_quyen); }
            
            // Check if updated_at column exists before using it
            try {
                const pragma = db.prepare("PRAGMA table_info(User)").all() as any[];
                const hasUpdatedAt = pragma.some(col => col.name === 'updated_at');
                if (hasUpdatedAt) {
                    fields.push('updated_at = CURRENT_TIMESTAMP');
                }
            } catch (e) {
                // Ignore error, continue without updated_at
            }
            
            if (fields.length === 0) return null;
            
            values.push(userId);
            const stmt = db.prepare(`UPDATE User SET ${fields.join(', ')} WHERE user_id = ?`);
            return stmt.run(...values);
        });
    },
    
    delete: (userId: string) => {
        return withDb((db) => {
            const stmt = db.prepare('DELETE FROM User WHERE user_id = ?');
            return stmt.run(userId);
        });
    }
};

console.log('[DB] Module loaded, DB_PATH:', DB_PATH);
