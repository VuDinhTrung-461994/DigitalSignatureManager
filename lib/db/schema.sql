-- Database Schema for Digital Signature Manager
-- Cấu trúc database theo sơ đồ

-- Bảng Đơn vị
CREATE TABLE IF NOT EXISTS DonVi (
    id TEXT PRIMARY KEY,
    ten TEXT NOT NULL
);

-- Bảng Token (Thiết bị)
CREATE TABLE IF NOT EXISTS Token (
    token_id TEXT PRIMARY KEY,
    ma_thiet_bi TEXT NOT NULL,
    mat_khau TEXT NOT NULL,
    ngay_hieu_luc DATETIME NOT NULL
);

-- Bảng User
CREATE TABLE IF NOT EXISTS User (
    user_id TEXT PRIMARY KEY,
    ten TEXT NOT NULL,
    so_cccd INTEGER NOT NULL,
    don_vi_id TEXT,
    token_id TEXT,
    uy_quyen TEXT,
    FOREIGN KEY (don_vi_id) REFERENCES DonVi(id) ON DELETE SET NULL,
    FOREIGN KEY (token_id) REFERENCES Token(token_id) ON DELETE SET NULL
);

-- Index để tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_user_donvi ON User(don_vi_id);
CREATE INDEX IF NOT EXISTS idx_user_token ON User(token_id);
CREATE INDEX IF NOT EXISTS idx_token_mtb ON Token(ma_thiet_bi);
