import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/store';
import { driverLogout, resetState, updateDriverInfo } from '../../redux/Driver/Driver.Slice';
import { 
  User, Calendar, CheckCircle, Clock, Navigation, 
  Phone, Car, DollarSign, Star, Briefcase, Power, 
  ChevronRight, AlertCircle, TrendingUp, LogOut,
  Home
} from 'lucide-react';

import { TripAssignment, DriverStats as DriverStatsType, LowOccupancyTrip } from '../../types/Driver.types';

import DriverStatCard from './DriverStatCard';
import LogoutConfirmModal from './LogoutConfirmModal';
import ActiveTrips from './ActiveTrips';
import TripHistory from './TripHistory';
import DriverStats from './DriverStats';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentDriver, token } = useAppSelector((state) => state.driver);
  
  const [trips, setTrips] = useState<TripAssignment[]>([]);
  const [stats, setStats] = useState<DriverStatsType>({ totalTrips: 0, completedTrips: 0, earnings: 0, rating: 0 });
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'stats'>('active');
  const [lowOccupancyTrip, setLowOccupancyTrip] = useState<LowOccupancyTrip | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function để lấy text status
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'inactive': return 'Ngưng hoạt động';
      case 'busy': return 'Đang bận';
      default: return status;
    }
  };

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    const checkAuth = () => {
      const tokenFromStorage = localStorage.getItem('driverToken');
      const driverFromStorage = localStorage.getItem('driverInfo');
      
      console.log('🔍 [AUTH CHECK] Kiểm tra xác thực:');
      console.log('  - Token từ state:', token ? 'Có' : 'Không');
      console.log('  - Token từ localStorage:', tokenFromStorage ? 'Có' : 'Không');
      console.log('  - Driver từ state:', currentDriver ? currentDriver.name : 'Không');
      console.log('  - Driver từ localStorage:', driverFromStorage ? JSON.parse(driverFromStorage).name : 'Không');
      console.log('  - Status hiện tại:', currentDriver?.status);
      
      if (!tokenFromStorage || !driverFromStorage) {
        console.log('⛔ Không tìm thấy token hoặc driver info, chuyển hướng đến login');
        navigate('/driver-login', { replace: true });
      } else {
        // Nếu state không có driver nhưng localStorage có, cập nhật lại
        if (!currentDriver && driverFromStorage) {
          const parsedDriver = JSON.parse(driverFromStorage);
          console.log('🔄 Cập nhật driver từ localStorage:', parsedDriver.name);
          dispatch(updateDriverInfo(parsedDriver));
          setLastStatus(parsedDriver.status);
        } else if (currentDriver) {
          setLastStatus(currentDriver.status);
        }
        setLoading(false);
      }
    };
    checkAuth();
  }, [token, currentDriver, navigate, dispatch]);

  // Polling để fetch status mới nhất (chỉ lấy status để tiết kiệm băng thông)
  useEffect(() => {
    if (!currentDriver || !token) {
      console.log('⏸️ [POLLING] Polling tạm dừng - không có token hoặc driver');
      return;
    }

    const fetchDriverStatus = async () => {
      try {
        // Lấy token mới nhất từ localStorage
        const latestToken = localStorage.getItem('driverToken') || token;
        
        console.log('🔄 [POLLING] Bắt đầu fetch status...');
        console.log('  - Driver ID:', currentDriver._id);
        console.log('  - Driver name:', currentDriver.name);
        console.log('  - Status hiện tại trong state:', currentDriver.status);
        
        // Gọi endpoint nhẹ chỉ lấy status
        const response = await fetch('/api/driver/status', {
          headers: {
            'Authorization': `Bearer ${latestToken}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          credentials: 'include',
          cache: 'no-store'
        });
        
        console.log('📡 [POLLING] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 [POLLING] Dữ liệu nhận được:', data);
          
          if (data.success && data.data) {
            const newStatus = data.data.status;
            const oldStatus = currentDriver.status;
            
            console.log(`📊 [POLLING] So sánh status: old=${oldStatus}, new=${newStatus}`);
            
            if (oldStatus !== newStatus) {
              console.log(`🔄 [POLLING] ⚠️ PHÁT HIỆN THAY ĐỔI TRẠNG THÁI!`);
              console.log(`   - Từ: ${oldStatus} (${getStatusText(oldStatus)})`);
              console.log(`   - Sang: ${newStatus} (${getStatusText(newStatus)})`);
              
              // Cập nhật full driver info
              const fullResponse = await fetch('/api/driver/me', {
                headers: {
                  'Authorization': `Bearer ${latestToken}`,
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache'
                },
                credentials: 'include'
              });
              
              if (fullResponse.ok) {
                const fullData = await fullResponse.json();
                if (fullData.success && fullData.data) {
                  console.log('🔄 [POLLING] Cập nhật Redux với driver info mới');
                  dispatch(updateDriverInfo(fullData.data));
                  
                  // Hiển thị thông báo cho tài xế
                  alert(`⚠️ Trạng thái tài khoản của bạn đã được cập nhật!\n\nTrạng thái mới: ${getStatusText(newStatus)}`);
                }
              } else {
                // Fallback: chỉ cập nhật status
                console.log('🔄 [POLLING] Fallback: Chỉ cập nhật status trong Redux');
                dispatch(updateDriverInfo({
                  ...currentDriver,
                  status: newStatus,
                  updated_at: data.data.updated_at
                }));
                alert(`⚠️ Trạng thái tài khoản của bạn đã được cập nhật!\n\nTrạng thái mới: ${getStatusText(newStatus)}`);
              }
            } else {
              console.log('✅ [POLLING] Status không thay đổi:', oldStatus);
            }
          }
        } else if (response.status === 401) {
          console.log('⚠️ [POLLING] Token hết hạn, đăng xuất');
          handleLogout();
        } else {
          const errorText = await response.text();
          console.error('❌ [POLLING] Lỗi fetch status:', response.status, errorText.substring(0, 200));
        }
      } catch (error) {
        console.error('❌ [POLLING] Lỗi fetch driver status:', error);
      }
    };

    // Fetch ngay lập tức khi component mount
    fetchDriverStatus();

    // Thiết lập polling mỗi 5 giây
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(fetchDriverStatus, 5000);
    console.log('✅ [POLLING] Đã thiết lập polling mỗi 5 giây');

    return () => {
      console.log('🧹 [POLLING] Dọn dẹp polling interval');
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [currentDriver?._id, token, dispatch]);

  // Fetch dữ liệu chuyến đi
  useEffect(() => {
    if (currentDriver && !loading) {
      fetchData();
    }
  }, [activeTab, currentDriver, loading]);

  const fetchData = async () => {
    try {
      const driverId = currentDriver?._id;
      if (!driverId) return;
      
      const [tripsRes, statsRes] = await Promise.all([
        fetch(`/api/driver/${driverId}/trips`),
        fetch(`/api/driver/${driverId}/stats`)
      ]);
      
      const allTrips: TripAssignment[] = await tripsRes.json();
      if (activeTab === 'active') {
        setTrips(allTrips.filter(t => t.booking_status !== 'completed'));
      } else if (activeTab === 'history') {
        setTrips(allTrips.filter(t => t.booking_status === 'completed'));
      }
      
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching driver data:', error);
      // Mock data for demo
      setStats({
        totalTrips: 42,
        completedTrips: 38,
        earnings: 12500000,
        rating: 4.8
      });
    }
  };

  const handleConfirm = async (assignmentId: number, bookingId: number, totalOccupancy: number, seats: number) => {
    const occupancyRate = totalOccupancy / seats;
    if (occupancyRate < 0.8 && !reason) {
      setLowOccupancyTrip({ assignmentId, bookingId });
      return;
    }

    try {
      await fetch('/api/driver/confirm-trip', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, bookingId, reason })
      });
      setLowOccupancyTrip(null);
      setReason('');
      fetchData();
    } catch (error) {
      console.error('Error confirming trip:', error);
    }
  };

  const handleComplete = async (bookingId: number) => {
    try {
      await fetch(`/api/bookings/${bookingId}/complete`, { method: 'PUT' });
      fetchData();
    } catch (error) {
      console.error('Error completing trip:', error);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    
    try {
      await dispatch(driverLogout()).unwrap();
      localStorage.removeItem('driverToken');
      localStorage.removeItem('driverInfo');
      
      setShowLogoutConfirm(false);
      navigate('/driver-login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      
      localStorage.removeItem('driverToken');
      localStorage.removeItem('driverInfo');
      dispatch(resetState());
      
      setShowLogoutConfirm(false);
      navigate('/driver-login', { replace: true });
    } finally {
      setLogoutLoading(false);
    }
  };

  // Hiển thị trạng thái
  const getStatusDisplay = () => {
    const status = currentDriver?.status;
    console.log('🎨 [RENDER] Hiển thị trạng thái:', status);
    
    switch (status) {
      case 'active':
        return {
          text: 'Đang Hoạt Động',
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          icon: <Power size={18} className="text-emerald-500" />
        };
      case 'busy':
        return {
          text: 'Đang Bận',
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          icon: <Clock size={18} className="text-yellow-500" />
        };
      case 'inactive':
        return {
          text: 'Ngưng Hoạt Động',
          color: 'text-gray-500',
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/20',
          icon: <Power size={18} className="text-gray-500" />
        };
      default:
        return {
          text: 'Không Xác Định',
          color: 'text-gray-500',
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/20',
          icon: <AlertCircle size={18} className="text-gray-500" />
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!currentDriver) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12">
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        loading={logoutLoading}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      <div className="bg-gray-900 text-white pb-20 pt-8">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold shadow-lg shadow-emerald-500/20">
                  {currentDriver.name?.charAt(0) || 'D'}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-4 border-gray-900 ${
                  currentDriver.status === 'active' ? 'bg-emerald-500 animate-pulse' :
                  currentDriver.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                }`}></div>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{currentDriver.name}</h1>
                <p className="text-gray-400 text-xs md:text-sm flex items-center gap-1">
                  <Car size={14} /> {currentDriver.license_number || 'Chưa có biển số'}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  @{currentDriver.username}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  ID: {currentDriver._id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold ${statusDisplay.bg} border ${statusDisplay.border}`}>
                {statusDisplay.icon}
                <span className={statusDisplay.color}>{statusDisplay.text}</span>
              </div>

              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all"
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-4xl -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <DriverStatCard icon={<Briefcase className="text-blue-500" />} label="Tổng Chuyến" value={stats.totalTrips} />
          <DriverStatCard icon={<DollarSign className="text-emerald-500" />} label="Thu Nhập" value={(stats.earnings || 0).toLocaleString('vi-VN') + 'đ'} />
          <DriverStatCard icon={<Star className="text-yellow-500" />} label="Đánh Giá" value={stats.rating || 0} />
          <DriverStatCard icon={<Clock className="text-purple-500" />} label="Hoàn Thành" value={stats.completedTrips || 0} />
        </div>

        <div className="flex flex-wrap gap-2 mb-6 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
          <button
            onClick={() => navigate('/')}
            className='flex gap-2 items-center cursor-pointer px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all hover:text-emerald-500'
          >   
              <Home size={24} />
              <span>Trang chủ</span>
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-4 md:px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${activeTab === 'active' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Chuyến Hiện Tại
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 md:px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${activeTab === 'history' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Lịch Sử
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-4 md:px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${activeTab === 'stats' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Thống Kê
          </button>
        </div>
        
        <div className="space-y-6">
          {activeTab === 'stats' ? (
            <DriverStats stats={stats} />
          ) : activeTab === 'active' ? (
            <ActiveTrips
              trips={trips}
              lowOccupancyTrip={lowOccupancyTrip}
              onConfirm={handleConfirm}
              onComplete={handleComplete}
              onLowOccupancyCancel={() => {
                setLowOccupancyTrip(null);
                setReason('');
              }}
            />
          ) : (
            <TripHistory trips={trips} />
          )}
        </div>
      </div>
    </div>
  );
}