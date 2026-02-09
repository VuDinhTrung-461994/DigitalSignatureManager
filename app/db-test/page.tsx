'use client';

import { useState, useEffect } from 'react';

interface User {
    user_id: string;
    ten: string;
    so_cccd: number;
    don_vi_id?: string;
    token_id?: string;
    uy_quyen?: string;
    don_vi?: { id: string; ten: string };
    token?: { token_id: string; ma_thiet_bi: string };
}

export default function DatabaseTestPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [newUser, setNewUser] = useState({
        user_id: '',
        ten: '',
        so_cccd: ''
    });

    // Load users on mount
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('[Frontend] Loading users...');
            
            const response = await fetch('/api/users');
            console.log('[Frontend] Response status:', response.status);
            
            const data = await response.json();
            console.log('[Frontend] Response data:', data);
            
            if (data.success) {
                setUsers(data.data);
                setMessage(`Loaded ${data.data.length} users`);
            } else {
                setError(data.error || 'Failed to load users');
            }
        } catch (err) {
            console.error('[Frontend] Error:', err);
            setError('Network error: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const initDatabase = async () => {
        setLoading(true);
        setError('');
        setMessage('Initializing database...');
        
        try {
            console.log('[Frontend] Initializing database...');
            const response = await fetch('/api/init-db', { method: 'POST' });
            const data = await response.json();
            console.log('[Frontend] Init response:', data);
            
            if (data.success) {
                setMessage(data.message);
                await loadUsers();
            } else {
                setError(data.error || 'Failed to initialize');
            }
        } catch (err) {
            console.error('[Frontend] Error:', err);
            setError('Network error: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('Creating user...');
        
        try {
            const userData = {
                user_id: newUser.user_id,
                ten: newUser.ten,
                so_cccd: parseInt(newUser.so_cccd),
                don_vi_id: 'DV001',
                token_id: undefined,
                uy_quyen: 'User'
            };
            
            console.log('[Frontend] Creating user:', userData);
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            console.log('[Frontend] Create response:', data);
            
            if (data.success) {
                setMessage('User created successfully!');
                setNewUser({ user_id: '', ten: '', so_cccd: '' });
                await loadUsers();
            } else {
                setError(data.error || 'Failed to create user');
            }
        } catch (err) {
            console.error('[Frontend] Error:', err);
            setError('Network error: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        setLoading(true);
        setError('');
        
        try {
            console.log('[Frontend] Deleting user:', userId);
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            console.log('[Frontend] Delete response:', data);
            
            if (data.success) {
                setMessage('User deleted successfully!');
                await loadUsers();
            } else {
                setError(data.error || 'Failed to delete user');
            }
        } catch (err) {
            console.error('[Frontend] Error:', err);
            setError('Network error: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Database Test - Quản lý User</h1>
            
            {/* Error Message */}
            {error && (
                <div className="p-4 mb-6 rounded bg-red-100 text-red-700 border border-red-300">
                    <strong>Error:</strong> {error}
                </div>
            )}
            
            {/* Success Message */}
            {message && !error && (
                <div className="p-4 mb-6 rounded bg-green-100 text-green-700 border border-green-300">
                    <strong>Success:</strong> {message}
                </div>
            )}
            
            {/* Loading */}
            {loading && (
                <div className="p-4 mb-6 rounded bg-blue-100 text-blue-700 border border-blue-300">
                    Loading...
                </div>
            )}
            
            {/* Initialize DB Button */}
            <div className="mb-8 p-4 bg-gray-50 rounded border">
                <h2 className="font-semibold mb-2">Step 1: Initialize Database</h2>
                <button
                    onClick={initDatabase}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    Initialize with Sample Data
                </button>
            </div>

            {/* Add User Form */}
            <div className="mb-8 p-4 border rounded">
                <h2 className="text-lg font-semibold mb-4">Step 2: Add New User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">User ID: *</label>
                        <input
                            type="text"
                            value={newUser.user_id}
                            onChange={(e) => setNewUser({...newUser, user_id: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                            required
                            placeholder="e.g., USER003"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên: *</label>
                        <input
                            type="text"
                            value={newUser.ten}
                            onChange={(e) => setNewUser({...newUser, ten: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                            required
                            placeholder="e.g., Nguyễn Văn C"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Số CCCD: *</label>
                        <input
                            type="number"
                            value={newUser.so_cccd}
                            onChange={(e) => setNewUser({...newUser, so_cccd: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                            required
                            placeholder="e.g., 123456789"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                        Create User
                    </button>
                </form>
            </div>

            {/* Users List */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Users List ({users.length})</h2>
                    <button
                        onClick={loadUsers}
                        disabled={loading}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                        Refresh
                    </button>
                </div>
                
                {users.length === 0 ? (
                    <p className="text-gray-500 p-4 bg-gray-50 rounded">
                        No users found. Click "Initialize with Sample Data" first, then refresh.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2 text-left">User ID</th>
                                    <th className="border p-2 text-left">Tên</th>
                                    <th className="border p-2 text-left">Số CCCD</th>
                                    <th className="border p-2 text-left">Đơn vị</th>
                                    <th className="border p-2 text-left">Uỷ quyền</th>
                                    <th className="border p-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-gray-50">
                                        <td className="border p-2">{user.user_id}</td>
                                        <td className="border p-2">{user.ten}</td>
                                        <td className="border p-2">{user.so_cccd}</td>
                                        <td className="border p-2">{user.don_vi?.ten || user.don_vi_id || '-'}</td>
                                        <td className="border p-2">{user.uy_quyen || '-'}</td>
                                        <td className="border p-2">
                                            <button
                                                onClick={() => handleDelete(user.user_id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Debug Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded text-sm border">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <p>Database file: <code>data/app.db</code></p>
                <p>API Endpoints:</p>
                <ul className="list-disc list-inside ml-4 text-gray-600">
                    <li><code>POST /api/init-db</code> - Initialize database</li>
                    <li><code>GET /api/users</code> - Get all users</li>
                    <li><code>POST /api/users</code> - Create user</li>
                    <li><code>DELETE /api/users/[id]</code> - Delete user</li>
                </ul>
            </div>
        </div>
    );
}
