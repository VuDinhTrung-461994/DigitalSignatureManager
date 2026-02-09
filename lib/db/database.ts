import { PrismaClient, DonVi, Token, User } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export types
export type { DonVi, Token, User };

export interface UserWithRelations extends User {
  don_vi?: DonVi;
  token?: Token;
}

// DonVi operations
export const DonViDB = {
  create: async (data: { id: string; ten: string }) => {
    return prisma.donVi.create({ data });
  },
  
  getAll: async () => {
    return prisma.donVi.findMany();
  },
  
  getById: async (id: string) => {
    return prisma.donVi.findUnique({ where: { id } });
  },
  
  update: async (id: string, ten: string) => {
    return prisma.donVi.update({
      where: { id },
      data: { ten }
    });
  },
  
  delete: async (id: string) => {
    await prisma.donVi.delete({ where: { id } });
  }
};

// Token operations
export const TokenDB = {
  create: async (data: { 
    token_id: string; 
    ma_thiet_bi: string; 
    mat_khau: string; 
    ngay_hieu_luc: string;
  }) => {
    return prisma.token.create({
      data: {
        ...data,
        ngay_hieu_luc: new Date(data.ngay_hieu_luc)
      }
    });
  },
  
  getAll: async () => {
    return prisma.token.findMany();
  },
  
  getById: async (tokenId: string) => {
    return prisma.token.findUnique({ where: { token_id: tokenId } });
  },
  
  delete: async (tokenId: string) => {
    await prisma.token.delete({ where: { token_id: tokenId } });
  }
};

// User operations
export const UserDB = {
  create: async (data: {
    user_id: string;
    ten: string;
    so_cccd: number;
    don_vi_id?: string;
    token_id?: string;
    uy_quyen?: string;
  }) => {
    return prisma.user.create({ data });
  },
  
  getAll: async () => {
    return prisma.user.findMany();
  },
  
  getAllWithRelations: async (): Promise<UserWithRelations[]> => {
    const users = await prisma.user.findMany({
      include: {
        don_vi: true,
        token: true
      }
    });
    
    return users.map(user => ({
      ...user,
      don_vi: user.don_vi || undefined,
      token: user.token || undefined
    }));
  },
  
  getById: async (userId: string) => {
    return prisma.user.findUnique({ where: { user_id: userId } });
  },
  
  update: async (userId: string, updates: Partial<{
    ten: string;
    so_cccd: number;
    don_vi_id: string;
    token_id: string;
    uy_quyen: string;
  }>) => {
    // Remove undefined values
    const data = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    
    if (Object.keys(data).length === 0) return null;
    
    return prisma.user.update({
      where: { user_id: userId },
      data
    });
  },
  
  delete: async (userId: string) => {
    await prisma.user.delete({ where: { user_id: userId } });
  }
};

// Initialize schema (Prisma handles this via migrations)
export async function initSchema() {
  console.log('[DB] Prisma schema already defined in schema.prisma');
  // Prisma automatically creates tables based on schema
  // Run: npx prisma db push
  return true;
}

// Test connection
export async function testConnection() {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT version()`;
    await prisma.$disconnect();
    return { success: true, version: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

console.log('[DB] Prisma Client initialized');
