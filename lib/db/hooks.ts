// Hooks for database operations
// Use these functions in your components to interact with the database

import { DonVi, Token, User, UserWithRelations } from './database';

// API Base URL
const API_BASE = '/api';

// Error handler helper
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Unknown error');
    }
    return response.json();
}

// DonVi API hooks
export const DonViAPI = {
    getAll: async (): Promise<DonVi[]> => {
        const response = await fetch(`${API_BASE}/donvi`);
        const data = await handleResponse<{ success: boolean; data: DonVi[] }>(response);
        return data.data;
    },
    
    create: async (donVi: DonVi): Promise<any> => {
        const response = await fetch(`${API_BASE}/donvi`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donVi)
        });
        return handleResponse(response);
    }
};

// Token API hooks
export const TokenAPI = {
    getAll: async (): Promise<Token[]> => {
        const response = await fetch(`${API_BASE}/tokens`);
        const data = await handleResponse<{ success: boolean; data: Token[] }>(response);
        return data.data;
    },
    
    create: async (token: Token): Promise<any> => {
        const response = await fetch(`${API_BASE}/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(token)
        });
        return handleResponse(response);
    }
};

// User API hooks
export const UserAPI = {
    getAll: async (): Promise<UserWithRelations[]> => {
        const response = await fetch(`${API_BASE}/users`);
        const data = await handleResponse<{ success: boolean; data: UserWithRelations[] }>(response);
        return data.data;
    },
    
    getById: async (id: string): Promise<UserWithRelations> => {
        const response = await fetch(`${API_BASE}/users/${id}`);
        const data = await handleResponse<{ success: boolean; data: UserWithRelations }>(response);
        return data.data;
    },
    
    create: async (user: User): Promise<any> => {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        return handleResponse(response);
    },
    
    update: async (id: string, updates: Partial<User>): Promise<any> => {
        const response = await fetch(`${API_BASE}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return handleResponse(response);
    },
    
    delete: async (id: string): Promise<any> => {
        const response = await fetch(`${API_BASE}/users/${id}`, {
            method: 'DELETE'
        });
        return handleResponse(response);
    }
};

// Re-export types
export type { DonVi, Token, User, UserWithRelations };
