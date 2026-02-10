'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Device {
  id: string;
  name: string;
  so_cccd?: string;
  department: string;
  deviceName: string;
  devicePassword: string;
  idCardImage: string | null;
  createdAt?: string;
  updatedAt?: string;
  uy_quyen?: string;
  replacementPerson?: {
    name: string;
    idCardNumber: string;
  };
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  }
};

const cardHoverVariants = {
  rest: {
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10
    }
  }
};

const glowVariants = {
  rest: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

// Danh sách đơn vị phân cấp
const DEPARTMENT_GROUPS = {
  'ĐƠN VỊ CHUYÊN MÔN GIÚP VIỆC CHỦ TỊCH VIỆN': [
    'BAN TỔ CHỨC - CÁN BỘ VÀ KIỂM TRA',
    'BAN KẾ HOẠCH - TÀI CHÍNH',
    'BAN HỢP TÁC QUỐC TẾ',
    'BAN ỨNG DỤNG VÀ TRIỂN KHAI CÔNG NGHỆ',
    'VĂN PHÒNG',
    'VĂN PHÒNG ĐẠI DIỆN TẠI TP. HỒ CHÍ MINH (TRỰC THUỘC VĂN PHÒNG)'
  ],
  'VIỆN NGHIÊN CỨU': [
    'VIỆN TOÁN HỌC',
    'VIỆN VẬT LÝ',
    'VIỆN HÓA HỌC',
    'VIỆN CƠ HỌC',
    'VIỆN SINH HỌC',
    'VIỆN CÁC KHOA HỌC TRÁI ĐẤT',
    'VIỆN HẢI DƯƠNG HỌC',
    'VIỆN KHOA HỌC SỰ SỐNG',
    'VIỆN KHOA HỌC VẬT LIỆU',
    'VIỆN KHOA HỌC CÔNG NGHỆ NĂNG LƯỢNG VÀ MÔI TRƯỜNG',
    'VIỆN CÔNG NGHỆ THÔNG TIN',
    'VIỆN CÔNG NGHỆ TIÊN TIẾN',
    'TRUNG TÂM VŨ TRỤ VIỆT NAM'
  ],
  'ĐƠN VỊ SỰ NGHIỆP': [
    'TRUNG TÂM NGHIÊN CỨU VÀ PHÁT TRIỂN CÔNG NGHỆ CAO',
    'TRUNG TÂM DỮ LIỆU VÀ THÔNG TIN KHOA HỌC',
    'BẢO TÀNG THIÊN NHIÊN VIỆT NAM',
    'NHÀ XUẤT BẢN KHOA HỌC TỰ NHIÊN VÀ CÔNG NGHỆ',
    'HỌC VIỆN KHOA HỌC VÀ CÔNG NGHỆ',
    'TRƯỜNG ĐẠI HỌC KHOA HỌC VÀ CÔNG NGHỆ HÀ NỘI'
  ],
  'ĐƠN VỊ TỰ TRANG TRẢI KINH PHÍ': [
    'CÔNG TY TNHH MỘT THÀNH VIÊN ỨNG DỤNG CÔNG NGHỆ MỚI VÀ DU LỊCH'
  ]
};

// Flatten danh sách cho dropdown
const ALL_DEPARTMENTS = Object.values(DEPARTMENT_GROUPS).flat();

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    idCard: '', // Số CCCD của ngườinhanh thiết bị
    department: '',
    deviceName: '',
    devicePassword: '',
    idCardImage: null as string | null,
    hasReplacement: false,
    replacementName: '',
    replacementIdCard: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  
  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    department: '',
    deviceName: '',
    uyQuyen: '',
    dateFrom: '',
    dateTo: '',
  });
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt' | 'department'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load data from API
  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/users');
      const data = await response.json();

      if (data.success) {
        const mappedDevices: Device[] = data.data.map((user: any) => ({
          id: user.user_id,
          name: user.ten,
          so_cccd: user.so_cccd,
          department: user.don_vi?.ten || user.don_vi_id || 'Chưa có đơn vị',
          deviceName: user.token?.ma_thiet_bi || user.token_id || 'Chưa có thiết bị',
          devicePassword: user.token?.mat_khau || '',
          idCardImage: null,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          uy_quyen: user.uy_quyen,
          replacementPerson: user.uy_quyen === 'Admin' ? undefined : undefined,
        }));
        setDevices(mappedDevices);

        // Extract unique departments
        const uniqueDepts = [...new Set(mappedDevices.map(d => d.department))];
        setDepartments(uniqueDepts);
      } else {
        setError(data.error || 'Failed to load data');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (device?: Device) => {
    if (device) {
      setEditingDevice(device);
      setFormData({
        name: device.name,
        idCard: device.so_cccd?.toString() || '', // Số CCCD từ device
        department: device.department,
        deviceName: device.deviceName,
        devicePassword: device.devicePassword,
        idCardImage: device.idCardImage,
        hasReplacement: !!device.replacementPerson,
        replacementName: device.replacementPerson?.name || '',
        replacementIdCard: device.replacementPerson?.idCardNumber || '',
      });
    } else {
      setEditingDevice(null);
      setFormData({
        name: '',
        idCard: '',
        department: '',
        deviceName: '',
        devicePassword: '',
        idCardImage: null,
        hasReplacement: false,
        replacementName: '',
        replacementIdCard: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
  };

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<{name?: string; idNumber?: string} | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview first
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, idCardImage: reader.result as string }));
    };
    reader.readAsDataURL(file);

    // Call OCR API
    setOcrLoading(true);
    setOcrResult(null);
    
    try {
      const formDataOCR = new FormData();
      formDataOCR.append('file', file);

      // Call our own API instead of external API (to avoid CORS)
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formDataOCR,
      });

      if (!response.ok) {
        throw new Error(`OCR API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[OCR] API result:', data);

      if (!data.success) {
        throw new Error(data.error || 'OCR failed');
      }

      // Data is already extracted by server
      const extractedInfo = data.data;
      console.log('[OCR] Extracted:', extractedInfo);

      setOcrResult(extractedInfo);

      // Auto-fill form if data found - Fill vào thông tin ngườinhanh chính
      if (extractedInfo.name || extractedInfo.idNumber) {
        setFormData(prev => ({
          ...prev,
          name: extractedInfo.name || prev.name,
          idCard: extractedInfo.idNumber || prev.idCard,
        }));
      }
    } catch (error) {
      console.error('[OCR] Error:', error);
      setError('Không thể nhận diện ảnh CCCD. Vui lòng nhập thủ công.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const donViResponse = await fetch('/api/donvi');
      const donViData = await donViResponse.json();
      let donViId = 'DV001';

      if (!donViData.data || donViData.data.length === 0) {
        await fetch('/api/donvi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: 'DV001', ten: formData.department }),
        });
      } else {
        const existingDept = donViData.data.find((d: any) => d.ten === formData.department);
        if (existingDept) {
          donViId = existingDept.id;
        } else {
          donViId = `DV${String(donViData.data.length + 1).padStart(3, '0')}`;
          await fetch('/api/donvi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: donViId, ten: formData.department }),
          });
        }
      }

      let tokenId = null;
      if (formData.deviceName && formData.devicePassword) {
        const tokenResponse = await fetch('/api/tokens');
        const tokenData = await tokenResponse.json();
        const tokenCount = tokenData.data?.length || 0;
        tokenId = `TK${String(tokenCount + 1).padStart(3, '0')}`;

        await fetch('/api/tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token_id: tokenId,
            ma_thiet_bi: formData.deviceName,
            mat_khau: formData.devicePassword,
            ngay_hieu_luc: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
          }),
        });
      }

      const userId = editingDevice?.id || `USER${Date.now()}`;
      const userData = {
        user_id: userId,
        ten: formData.name,
        so_cccd: formData.idCard || '',
        don_vi_id: donViId,
        token_id: tokenId,
        uy_quyen: formData.hasReplacement ? 'User' : 'Admin',
      };

      const url = editingDevice ? `/api/users/${userId}` : '/api/users';
      const method = editingDevice ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        handleCloseModal();
        await loadDevices();
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadDevices();
      } else {
        setError(data.error || 'Failed to delete');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Advanced filtering logic
  const filteredDevices = devices
    .filter(device => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.deviceName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Advanced filters
      const matchesName = !filters.name || 
        device.name.toLowerCase().includes(filters.name.toLowerCase());
      
      const matchesDepartment = !filters.department || 
        device.department === filters.department;
      
      const matchesDevice = !filters.deviceName || 
        device.deviceName.toLowerCase().includes(filters.deviceName.toLowerCase());
      
      const matchesUyQuyen = !filters.uyQuyen || 
        device.uy_quyen === filters.uyQuyen;
      
      // Date range filter
      let matchesDate = true;
      if (device.updatedAt) {
        const deviceDate = new Date(device.updatedAt);
        if (filters.dateFrom) {
          matchesDate = matchesDate && deviceDate >= new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          matchesDate = matchesDate && deviceDate <= new Date(filters.dateTo);
        }
      }
      
      return matchesSearch && matchesName && matchesDepartment && matchesDevice && matchesUyQuyen && matchesDate;
    })
    .sort((a, b) => {
      // Sorting logic
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department);
          break;
        case 'updatedAt':
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="mb-6 p-4 bg-red-500/20 backdrop-blur-lg border border-red-500/30 text-red-200 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2"
              >
                Quản lý Thiết bị Chữ ký số
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-blue-200/70 text-lg"
              >
                Quản lý và theo dõi thiết bị chữ ký số
              </motion.p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={loadDevices}
                disabled={loading}
                className="group relative px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl font-semibold overflow-hidden transition-all duration-300 disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  <motion.svg
                    animate={loading ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </motion.svg>
                  Refresh
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOpenModal()}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-semibold overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.span
                  className="relative flex items-center gap-2"
                  whileHover={{ x: 3 }}
                >
                  <motion.svg
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </motion.svg>
                  Thêm thiết bị
                </motion.span>
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, đơn vị, thiết bị..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
              />
              <motion.svg
                whileHover={{ scale: 1.2, rotate: 15 }}
                className="w-6 h-6 text-white/50 absolute left-5 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </motion.svg>
            </div>
          </motion.div>

          {/* Advanced Filters Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex justify-between items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Bộ lọc nâng cao
              <motion.svg
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>

            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="updatedAt" className="bg-slate-800">Ngày cập nhật</option>
                <option value="name" className="bg-slate-800">Tên</option>
                <option value="department" className="bg-slate-800">Đơn vị</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-white/60 hover:text-white bg-white/10 rounded-lg"
              >
                {sortOrder === 'asc' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Name Filter */}
                    <div>
                      <label className="block text-sm text-blue-200 mb-2">Tên ngườidùng</label>
                      <input
                        type="text"
                        placeholder="Lọc theo tên..."
                        value={filters.name}
                        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>

                    {/* Department Filter */}
                    <div>
                      <label className="block text-sm text-blue-200 mb-2">Đơn vị</label>
                      <select
                        value={filters.department}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      >
                        <option value="" className="bg-slate-800">Tất cả đơn vị</option>
                        {Object.entries(DEPARTMENT_GROUPS).map(([group, units]) => (
                          <optgroup key={group} label={group} className="bg-slate-800 text-blue-300 font-bold">
                            {units.map((unit) => (
                              <option key={unit} value={unit} className="bg-slate-800 text-white">
                                {unit}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* Device Filter */}
                    <div>
                      <label className="block text-sm text-blue-200 mb-2">Thiết bị</label>
                      <input
                        type="text"
                        placeholder="Lọc theo thiết bị..."
                        value={filters.deviceName}
                        onChange={(e) => setFilters({ ...filters, deviceName: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>

                    {/* Uy Quyen Filter */}
                    <div>
                      <label className="block text-sm text-blue-200 mb-2">Uỷ quyền</label>
                      <select
                        value={filters.uyQuyen}
                        onChange={(e) => setFilters({ ...filters, uyQuyen: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      >
                        <option value="" className="bg-slate-800">Tất cả</option>
                        <option value="Admin" className="bg-slate-800">Admin</option>
                        <option value="User" className="bg-slate-800">User</option>
                      </select>
                    </div>

                    {/* Date From */}
                    <div>
                      <label className="block text-sm text-blue-200 mb-2">Từ ngày</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>

                    {/* Date To */}
                    <div>
                      <label className="block text-sm text-blue-200 mb-2">Đến ngày</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="mt-4 flex justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setFilters({
                          name: '',
                          department: '',
                          deviceName: '',
                          uyQuyen: '',
                          dateFrom: '',
                          dateTo: '',
                        });
                        setSearchTerm('');
                      }}
                      className="px-4 py-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      Xóa bộ lọc
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowFilters(false)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"
                    >
                      Áp dụng
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Total Devices */}
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            initial="rest"
            animate="rest"
            className="relative group cursor-pointer"
          >
            <motion.div
              variants={glowVariants}
              className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500"
            />
            <motion.div
              variants={cardHoverVariants}
              className="relative p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-blue-200/70 text-sm mb-1 font-medium">Tổng thiết bị</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                    className="text-4xl font-bold text-white"
                  >
                    {devices.length}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </motion.div>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.8 }}
                className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              />
            </motion.div>
          </motion.div>

          {/* Active Devices */}
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            initial="rest"
            animate="rest"
            className="relative group cursor-pointer"
          >
            <motion.div
              variants={glowVariants}
              className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500"
            />
            <motion.div
              variants={cardHoverVariants}
              className="relative p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-green-200/70 text-sm mb-1 font-medium">Đang sử dụng</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
                    className="text-4xl font-bold text-white"
                  >
                    {devices.length}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30"
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.9 }}
                className="mt-4 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />
            </motion.div>
          </motion.div>

          {/* Departments */}
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            initial="rest"
            animate="rest"
            className="relative group cursor-pointer"
          >
            <motion.div
              variants={glowVariants}
              className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500"
            />
            <motion.div
              variants={cardHoverVariants}
              className="relative p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-purple-200/70 text-sm mb-1 font-medium">Tổng đơn vị</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
                    className="text-4xl font-bold text-white"
                  >
                    {departments.length}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30"
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </motion.div>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 1 }}
                className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Loading Skeleton */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"
                />
                <span className="text-blue-200">Đang tải dữ liệu...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex justify-between items-center text-white/70"
        >
          <span>
            Hiển thị <strong className="text-white">{filteredDevices.length}</strong> / {devices.length} thiết bị
            {(searchTerm || Object.values(filters).some(v => v !== '')) && (
              <span className="text-blue-300 ml-2">(đã áp dụng bộ lọc)</span>
            )}
          </span>
          {(searchTerm || Object.values(filters).some(v => v !== '')) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  name: '',
                  department: '',
                  deviceName: '',
                  uyQuyen: '',
                  dateFrom: '',
                  dateTo: '',
                });
              }}
              className="text-sm text-red-300 hover:text-red-200 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Xóa tất cả bộ lọc
            </motion.button>
          )}
        </motion.div>

        {/* Devices Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-pink-600/80 text-white">
                    <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider">Tên</th>
                    <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider">Đơn vị</th>
                    <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider">Thiết bị</th>
                    <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider">Mật khẩu</th>
                    <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider">CCCD</th>
                    <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider">Nhận thay</th>
                    <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider">Cập nhật</th>
                    <th className="px-6 py-5 text-center text-sm font-bold uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <AnimatePresence mode="popLayout">
                    {filteredDevices.map((device, index) => (
                      <motion.tr
                        key={device.id}
                        layout
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 100,
                          damping: 15
                        }}
                        onMouseEnter={() => setHoveredRow(device.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className={`group transition-all duration-300 ${hoveredRow === device.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 10 }}
                              className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30"
                            >
                              {device.name.charAt(0)}
                            </motion.div>
                            <div>
                              <span className="font-semibold text-white group-hover:text-blue-300 transition-colors">{device.name}</span>
                              <p className="text-xs text-white/40">{device.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30"
                          >
                            {device.department}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30"
                          >
                            {device.deviceName}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-between w-full">
                            <motion.span
                              initial={false}
                              animate={{ filter: showPassword === device.id ? 'blur(0px)' : 'blur(4px)' }}
                              className="text-white/80 font-mono bg-black/30 px-3 py-1 rounded-lg"
                            >
                              {device.devicePassword || '••••••••'}
                            </motion.span>
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowPassword(showPassword === device.id ? null : device.id)}
                              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all ml-2"
                            >
                              {showPassword === device.id ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </motion.button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {device.so_cccd ? (
                            <span className="font-mono text-white/80 bg-black/30 px-3 py-1 rounded-lg">
                              {device.so_cccd}
                            </span>
                          ) : (
                            <span className="text-white/30">Chưa có</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {device.replacementPerson ? (
                            <div className="text-sm">
                              <p className="font-medium text-white">{device.replacementPerson.name}</p>
                              <p className="text-white/50">{device.replacementPerson.idCardNumber}</p>
                            </div>
                          ) : (
                            <span className="text-white/30">Không có</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {device.updatedAt ? (
                            <div className="text-sm">
                              <p className="text-white">{new Date(device.updatedAt).toLocaleDateString('vi-VN')}</p>
                              <p className="text-white/50 text-xs">{new Date(device.updatedAt).toLocaleTimeString('vi-VN')}</p>
                            </div>
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.3)" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleOpenModal(device)}
                              className="p-2 text-blue-400 hover:text-blue-300 rounded-xl transition-all"
                              title="Sửa"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.3)" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(device.id)}
                              className="p-2 text-red-400 hover:text-red-300 rounded-xl transition-all"
                              title="Xóa"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredDevices.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <svg className="w-24 h-24 text-white/20 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </motion.div>
                  <p className="text-white/40 text-xl mb-2">Không tìm thấy thiết bị nào</p>
                  <p className="text-white/30 text-sm">Nhấn &quot;Thêm thiết bị&quot; để tạo mới</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-lg text-white px-8 py-6 flex items-center justify-between rounded-t-3xl">
                <motion.h2
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-2xl font-bold"
                >
                  {editingDevice ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
                </motion.h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Họ và tên <span className="text-red-400">*</span>
                    {ocrResult?.name && (
                      <span className="ml-2 text-xs text-green-400">✓ Tự động nhận diện</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all ${
                      ocrResult?.name ? 'border-green-500/50 bg-green-500/10' : 'border-white/20'
                    }`}
                    placeholder="Nguyễn Văn A"
                  />
                </motion.div>

                {/* ID Card Number */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 }}
                >
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Số CCCD <span className="text-red-400">*</span>
                    {ocrResult?.idNumber && (
                      <span className="ml-2 text-xs text-green-400">✓ Tự động nhận diện</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.idCard}
                    onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all ${
                      ocrResult?.idNumber ? 'border-green-500/50 bg-green-500/10' : 'border-white/20'
                    }`}
                    placeholder="001204014664"
                  />
                </motion.div>

                {/* Department - Dropdown phân cấp */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Đơn vị công tác <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5rem' }}
                  >
                    <option value="" className="bg-slate-800 text-white/50">-- Chọn đơn vị --</option>
                    {Object.entries(DEPARTMENT_GROUPS).map(([group, units]) => (
                      <optgroup key={group} label={group} className="bg-slate-800 text-blue-300 font-bold">
                        {units.map((unit) => (
                          <option key={unit} value={unit} className="bg-slate-800 text-white pl-4">
                            {unit}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </motion.div>

                {/* Device Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Tên thiết bị <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.deviceName}
                    onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                    placeholder="Token-001"
                  />
                </motion.div>

                {/* Device Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Mật khẩu thiết bị <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.devicePassword}
                    onChange={(e) => setFormData({ ...formData, devicePassword: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </motion.div>

                {/* ID Card Image with OCR */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Ảnh Căn cước công dân
                    <span className="ml-2 text-xs text-purple-400">(Tự động nhận diện)</span>
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
                    {formData.idCardImage ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                      >
                        <img
                          src={formData.idCardImage}
                          alt="CCCD"
                          className="w-full h-48 object-cover rounded-xl"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, idCardImage: null });
                            setOcrResult(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                        
                        {/* OCR Status Badge */}
                        {ocrLoading && (
                          <div className="absolute bottom-2 left-2 bg-blue-500/90 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            Đang nhận diện...
                          </div>
                        )}
                        {ocrResult && !ocrLoading && (
                          <div className="absolute bottom-2 left-2 right-2 bg-green-500/90 text-white px-3 py-2 rounded-lg text-sm">
                            <div className="font-semibold">✓ Nhận diện thành công:</div>
                            {ocrResult.name && <div>Tên: {ocrResult.name}</div>}
                            {ocrResult.idNumber && <div>CCCD: {ocrResult.idNumber}</div>}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-3"
                        >
                          <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </motion.div>
                        <span className="text-white/60">Click để tải ảnh lên</span>
                        <span className="text-white/40 text-xs mt-1">Hệ thống sẽ tự động nhận diện thông tin</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </motion.div>

                {/* Replacement Person */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="border-t border-white/10 pt-4"
                >
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={formData.hasReplacement}
                      onChange={(e) => setFormData({ ...formData, hasReplacement: e.target.checked })}
                      className="w-5 h-5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500/50"
                    />
                    <span className="text-sm font-medium text-blue-200">Có ngườinhận thiết bị thay</span>
                  </label>

                  <AnimatePresence>
                    {formData.hasReplacement && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div>
                          <label className="block text-sm font-medium text-blue-200 mb-2">
                            Tên ngườithay <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required={formData.hasReplacement}
                            value={formData.replacementName}
                            onChange={(e) => setFormData({ ...formData, replacementName: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                            placeholder="Trần Thị B"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-200 mb-2">
                            Số CCCD ngườithay <span className="text-red-400">*</span>
                            {ocrResult?.idNumber && (
                              <span className="ml-2 text-xs text-green-400">✓ Tự động nhận diện</span>
                            )}
                          </label>
                          <input
                            type="text"
                            required={formData.hasReplacement}
                            value={formData.replacementIdCard}
                            onChange={(e) => setFormData({ ...formData, replacementIdCard: e.target.value })}
                            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all ${
                              ocrResult?.idNumber ? 'border-green-500/50 bg-green-500/10' : 'border-white/20'
                            }`}
                            placeholder="001234567890"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4 pt-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Đang lưu...
                      </span>
                    ) : (
                      editingDevice ? 'Cập nhật' : 'Thêm mới'
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleCloseModal}
                    disabled={loading}
                    className="flex-1 bg-white/10 text-white py-4 rounded-xl font-semibold border border-white/20 disabled:opacity-50"
                  >
                    Hủy
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
