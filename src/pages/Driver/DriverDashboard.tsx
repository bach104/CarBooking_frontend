import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/store';
import { driverLogout, resetState } from '../../redux/Driver/Driver.Slice';
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
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'stats'>('active');
  const [lowOccupancyTrip, setLowOccupancyTrip] = useState<LowOccupancyTrip | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      console.log('🔍 DriverDashboard - checking auth:', { 
        hasToken: !!token, 
        hasDriver: !!currentDriver 
      });
      if (!token || !currentDriver) {
        console.log('⛔ No token/currentDriver, redirecting to driver-login');
        navigate('/driver-login', { replace: true });
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [token, currentDriver, navigate]);

  useEffect(() => {
    if (currentDriver && !loading) {
      fetchData();
    }
  }, [activeTab, currentDriver, loading]);

  const fetchData = async () => {
    try {
      const driverId = currentDriver?._id || 1;
      
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

  // Hiển thị loading khi đang kiểm tra auth
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
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-4 border-gray-900 ${isOnline ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{currentDriver.name}</h1>
                <p className="text-gray-400 text-xs md:text-sm flex items-center gap-1">
                  <Car size={14} /> {currentDriver.license_number || 'Chưa có biển số'}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  @{currentDriver.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsOnline(!isOnline)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${isOnline ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
              >
                <Power size={18} />
                {isOnline ? 'Đang Trực Tuyến' : 'Đang Ngoại Tuyến'}
              </button>

              {/* Nút đăng xuất */}
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
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <DriverStatCard icon={<Briefcase className="text-blue-500" />} label="Tổng Chuyến" value={stats.totalTrips} />
          <DriverStatCard icon={<DollarSign className="text-emerald-500" />} label="Thu Nhập" value={(stats.earnings || 0).toLocaleString('vi-VN') + 'đ'} />
          <DriverStatCard icon={<Star className="text-yellow-500" />} label="Đánh Giá" value={stats.rating || 0} />
          <DriverStatCard icon={<Clock className="text-purple-500" />} label="Hoàn Thành" value={stats.completedTrips || 0} />
        </div>

        {/* Tabs */}
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