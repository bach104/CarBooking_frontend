// pages/Staff/BookingsTab.tsx
import React, { useState, useEffect } from 'react';
import { Eye, Check, XCircle, RefreshCw, Calendar, Search, Filter, ChevronLeft, ChevronRight, User, Car, UserCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import {
  fetchBookings,
  fetchBookingStats,
  confirmBooking,
  updateBookingStatus,
  setFilters,
  clearError,
  assignDriverAndVehicle,
  fetchAvailableVehicles,
  fetchAvailableDrivers
} from '../../redux/StaffBooking/StaffBooking.Slice';
import { fetchAllDrivers } from '../../redux/DriverManagement/DriverManagement.Slice';
import { fetchAllVehicles } from '../../redux/Vehicle/Vehicle.Slice';
import { StatusBadge, StatCard } from '../../components/Common';
import { Booking } from '../../types/Booking.types';
import { BOOKING_STATUS_OPTIONS, BookingStatus } from '../../types/StaffBooking.types';

interface BookingsTabProps {
  onViewBooking: (booking: Booking) => void;
  onAssignDriver?: (booking: Booking) => void;
}

// Helper to safely extract data from API responses
// Handles both direct array responses and { data: [] } format
const extractDataArray = <T,>(response: any): T[] => {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  if (response && Array.isArray(response.result)) return response.result;
  return [];
};

// Helper to safely extract assignment from assign response
const extractAssignment = (response: any): any => {
  if (response.assignment) return response.assignment;
  if (response.data?.assignment) return response.data.assignment;
  return response;
};

export default function BookingsTab({ onViewBooking, onAssignDriver }: BookingsTabProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { bookings, stats, loading, error, pagination, filters } = useAppSelector(
    (state) => state.staffBooking
  );
  const { drivers } = useAppSelector((state) => state.driverManagement);
  const { vehicles } = useAppSelector((state) => state.vehicle);
  
  // Local state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: filters.status || 'all',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    search: filters.search || ''
  });
  const [isMobile, setIsMobile] = useState(false);
  
  // Assignment modal state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [loadingAssignData, setLoadingAssignData] = useState(false);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch data khi filters thay đổi
  useEffect(() => {
    dispatch(fetchBookings(filters));
  }, [dispatch, filters]);

  // Fetch stats khi component mount
  useEffect(() => {
    dispatch(fetchBookingStats());
  }, [dispatch]);

  // Auto refresh mỗi 30 giây
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchBookings(filters));
      dispatch(fetchBookingStats());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch, filters]);

  // Fetch drivers and vehicles when needed
  useEffect(() => {
    if (showAssignmentModal) {
      fetchAvailableDriversAndVehicles();
    }
  }, [showAssignmentModal]);

  // Fetch available drivers and vehicles for assignment
  const fetchAvailableDriversAndVehicles = async () => {
    setLoadingAssignData(true);
    try {
      // Fetch available drivers (status: active) from driver management
      const driversResult = await dispatch(fetchAllDrivers()).unwrap();
      const activeDrivers = extractDataArray(driversResult).filter((d: any) => d.status === 'active');
      setAvailableDrivers(activeDrivers);
      
      // Fetch available vehicles (status: ready) from vehicle management
      const vehiclesResult = await dispatch(fetchAllVehicles()).unwrap();
      const readyVehicles = extractDataArray(vehiclesResult).filter((v: any) => v.status === 'ready');
      setAvailableVehicles(readyVehicles);
      
      // Also fetch from staff booking specific endpoints (these might return different format)
      const availableDriversRes = await dispatch(fetchAvailableDrivers()).unwrap();
      const driversData = extractDataArray(availableDriversRes);
      if (driversData.length > 0) {
        setAvailableDrivers(driversData);
      }
      
      const availableVehiclesRes = await dispatch(fetchAvailableVehicles(undefined)).unwrap();
      const vehiclesData = extractDataArray(availableVehiclesRes);
      if (vehiclesData.length > 0) {
        setAvailableVehicles(vehiclesData);
      }
    } catch (error) {
      console.error('Error fetching assign data:', error);
    } finally {
      setLoadingAssignData(false);
    }
  };

  const handleViewBooking = (booking: Booking) => {
    onViewBooking(booking);
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await dispatch(confirmBooking({
        bookingId,
        payload: { notes: `Xác nhận bởi nhân viên lúc ${new Date().toLocaleString('vi-VN')}` }
      })).unwrap();
      
      dispatch(fetchBookingStats());
    } catch (error: any) {
      console.error('Confirm failed:', error);
      alert(error || 'Xác nhận đơn hàng thất bại');
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      const status: BookingStatus = 'cancelled';
      
      await dispatch(updateBookingStatus({
        bookingId: selectedBooking._id,
        payload: { 
          status: status, 
          reason: cancelReason || 'Khách hàng hủy'
        }
      })).unwrap();
      
      dispatch(fetchBookingStats());
      
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
    } catch (error: any) {
      console.error('Cancel failed:', error);
      alert(error || 'Hủy đơn hàng thất bại');
    }
  };

  // Mở modal phân công
  const handleOpenAssignModal = (booking: Booking) => {
    setAssigningBooking(booking);
    setSelectedDriverId('');
    setSelectedVehicleId('');
    setStartTime('');
    setShowAssignmentModal(true);
  };

  // Xử lý phân công
  const handleAssignDriver = async () => {
    if (!assigningBooking) return;
    
    if (!selectedDriverId) {
      alert('Vui lòng chọn tài xế');
      return;
    }
    
    if (!selectedVehicleId) {
      alert('Vui lòng chọn xe');
      return;
    }
    
    // Kiểm tra số ghế xe phù hợp
    const selectedVehicle = availableVehicles.find(v => v._id === selectedVehicleId);
    if (selectedVehicle && selectedVehicle.seats !== assigningBooking.seats) {
      alert(`Xe này có ${selectedVehicle.seats} chỗ, không phù hợp với booking ${assigningBooking.seats} chỗ`);
      return;
    }
    
    setAssigning(true);
    
    try {
      const result = await dispatch(assignDriverAndVehicle({
        bookingId: assigningBooking._id,
        payload: {
          driverId: selectedDriverId,
          vehicleId: selectedVehicleId,
          startTime: startTime || undefined
        }
      })).unwrap();
      
      console.log('Assign result:', result);
      
      // Extract assignment data safely
      const assignment = extractAssignment(result);
      const driverName = assignment.driver?.name || '';
      const vehicleName = assignment.vehicle?.vehicle_name || '';
      const licensePlate = assignment.vehicle?.license_plate || '';
      
      alert(`Phân công thành công!\nTài xế: ${driverName}\nXe: ${vehicleName} (${licensePlate})`);
      
      // Refresh danh sách bookings
      dispatch(fetchBookings(filters));
      dispatch(fetchBookingStats());
      
      // Đóng modal
      setShowAssignmentModal(false);
      setAssigningBooking(null);
      setSelectedDriverId('');
      setSelectedVehicleId('');
      setStartTime('');
      
    } catch (error: any) {
      console.error('Assign failed:', error);
      alert(error || 'Phân công thất bại. Vui lòng thử lại.');
    } finally {
      setAssigning(false);
    }
  };

  const handleFilterChange = () => {
    dispatch(setFilters({
      status: tempFilters.status === 'all' ? undefined : tempFilters.status,
      startDate: tempFilters.startDate || undefined,
      endDate: tempFilters.endDate || undefined,
      search: tempFilters.search || undefined,
      page: 1
    }));
  };

  const handleResetFilters = () => {
    setTempFilters({
      status: 'all',
      startDate: '',
      endDate: '',
      search: ''
    });
    dispatch(setFilters({
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      search: undefined,
      page: 1
    }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setFilters({ page: newPage }));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isMobile) {
        return date.toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      assigned: 'bg-purple-100 text-purple-800',
      'in-progress': 'bg-emerald-100 text-emerald-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Lọc xe phù hợp với số ghế của booking
  const getFilteredVehicles = () => {
    if (!assigningBooking) return availableVehicles;
    return availableVehicles.filter(v => v.seats === assigningBooking.seats);
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải danh sách booking...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
          <span className="text-sm">{error}</span>
          <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">
            ×
          </button>
        </div>
      )}

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard 
          label="Tổng Booking" 
          value={stats?.total || 0} 
          color="bg-blue-500" 
          icon="📊"
        />
        <StatCard 
          label="Chờ Xác Nhận" 
          value={stats?.pending || 0} 
          color="bg-yellow-500" 
          icon="⏳"
        />
        <StatCard 
          label="Đang Thực Hiện" 
          value={(stats?.inProgress || 0) + (stats?.assigned || 0)} 
          color="bg-emerald-500" 
          icon="🚗"
        />
        <StatCard 
          label="Hoàn Thành" 
          value={stats?.completed || 0} 
          color="bg-gray-500" 
          icon="✅"
        />
      </div>

      {/* Filter Bar - Responsive */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 mb-6">
        {/* Main Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={isMobile ? "Tìm kiếm..." : "Tìm theo tên hoặc số điện thoại..."}
              value={tempFilters.search}
              onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleFilterChange()}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="relative sm:w-40">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={tempFilters.status}
              onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none bg-white"
            >
              {BOOKING_STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date Filter Toggle */}
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors ${
              showDateFilter || tempFilters.startDate || tempFilters.endDate
                ? 'bg-emerald-500 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar size={16} />
            <span className={isMobile ? 'hidden sm:inline' : 'inline'}>Lọc ngày</span>
          </button>

          {/* Action Buttons */}
          <button
            onClick={handleFilterChange}
            className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Search size={16} />
            <span className={isMobile ? 'hidden sm:inline' : 'inline'}>Tìm</span>
          </button>
          
          <button
            onClick={handleResetFilters}
            className="px-3 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
            title="Đặt lại"
          >
            <RefreshCw size={16} className="text-gray-500" />
            <span className={isMobile ? 'hidden sm:inline' : 'inline'}>Đặt lại</span>
          </button>
        </div>

        {/* Date Range Inputs */}
        {showDateFilter && (
          <div className="flex flex-col sm:flex-row gap-3 mt-3 pt-3 border-t border-gray-100">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Từ ngày</label>
              <input
                type="date"
                value={tempFilters.startDate}
                onChange={(e) => setTempFilters({ ...tempFilters, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Đến ngày</label>
              <input
                type="date"
                value={tempFilters.endDate}
                onChange={(e) => setTempFilters({ ...tempFilters, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Active Filters Info */}
        {(filters.status || filters.startDate || filters.endDate || filters.search) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Đang lọc:</span>
            {filters.status && (
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs">
                {BOOKING_STATUS_OPTIONS.find(o => o.value === filters.status)?.label}
              </span>
            )}
            {filters.startDate && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                Từ: {new Date(filters.startDate).toLocaleDateString('vi-VN')}
              </span>
            )}
            {filters.endDate && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                Đến: {new Date(filters.endDate).toLocaleDateString('vi-VN')}
              </span>
            )}
            {filters.search && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                Tìm: {filters.search}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bookings Table - Always scroll horizontally on mobile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500">Không tìm thấy booking nào</p>
            {(filters.status || filters.startDate || filters.endDate || filters.search) && (
              <button
                onClick={handleResetFilters}
                className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table Container with horizontal scroll on mobile */}
            <div className="overflow-x-auto">
              <table className="min-w-200 md:min-w-full w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Khách Hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Điểm Đón</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Điểm Đến</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Thời Gian</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Đặt xe</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Giá</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Trạng Thái</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-sm text-gray-900">{booking.customer_name}</div>
                        <div className="text-xs text-gray-500">{booking.customer_phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700 max-w-50 truncate" title={booking.pickup_location}>
                          {booking.pickup_location}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700 max-w-50 truncate" title={booking.dropoff_location}>
                          {booking.dropoff_location}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {formatDate(booking.trip_date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs whitespace-nowrap">
                          {booking.seats} chỗ
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-emerald-600 whitespace-nowrap">
                        {formatCurrency(booking.price)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(booking.status)}`}>
                          {booking.status_text || booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleViewBooking(booking)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConfirmBooking(booking._id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Xác nhận đơn"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowCancelModal(true);
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hủy đơn"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          
                          {(booking.status === 'confirmed' || booking.status === 'assigned') && (
                            <button
                              onClick={() => handleOpenAssignModal(booking)}
                              className="px-2 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs hover:bg-purple-200 transition-colors whitespace-nowrap flex items-center gap-1"
                              title="Phân công tài xế"
                            >
                              <UserCheck size={14} />
                              Phân công
                            </button>
                          )}
                          
                          {/* Hiển thị thông tin tài xế nếu đã phân công */}
                          {booking.status === 'assigned' && booking.tripAssignment?.driver && (
                            <div className="text-xs text-gray-500 hidden sm:block ml-2">
                              <div className="flex items-center gap-1">
                                <User size={12} />
                                <span>{booking.tripAssignment.driver.name}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - Responsive */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 order-2 sm:order-1">
                  {pagination.totalItems} kết quả
                </div>
                <div className="flex gap-1 order-1 sm:order-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <div className="flex gap-1">
                    {(() => {
                      const total = pagination.totalPages;
                      const current = pagination.currentPage;
                      let pages: number[] = [];
                      
                      if (total <= 5) {
                        pages = Array.from({ length: total }, (_, i) => i + 1);
                      } else if (current <= 3) {
                        pages = [1, 2, 3, 4, 5];
                      } else if (current >= total - 2) {
                        pages = [total - 4, total - 3, total - 2, total - 1, total];
                      } else {
                        pages = [current - 2, current - 1, current, current + 1, current + 2];
                      }
                      
                      return pages.map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-8 h-8 px-2 rounded-lg text-sm transition-colors ${
                            pagination.currentPage === pageNum
                              ? 'bg-emerald-500 text-white'
                              : 'border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ));
                    })()}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Booking Modal - Responsive */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-[90%] sm:max-w-md w-full p-5 sm:p-6">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Xác nhận hủy đơn</h3>
              <p className="text-sm text-gray-600 mb-4">
                Hủy đơn của{' '}
                <span className="font-bold text-gray-900">{selectedBooking.customer_name}</span>?
              </p>
              
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2 text-left">
                  Lý do hủy (tùy chọn)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
                  placeholder="Nhập lý do hủy đơn..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedBooking(null);
                    setCancelReason('');
                  }}
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="flex-1 px-3 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignmentModal && assigningBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Phân công tài xế</h3>
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setAssigningBooking(null);
                  setSelectedDriverId('');
                  setSelectedVehicleId('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Booking Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3">Thông tin đơn hàng</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Khách hàng:</span>
                    <span className="font-medium text-gray-900">{assigningBooking.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số điện thoại:</span>
                    <span className="font-medium text-gray-900">{assigningBooking.customer_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Điểm đón:</span>
                    <span className="font-medium text-gray-900 truncate max-w-48">{assigningBooking.pickup_location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Điểm đến:</span>
                    <span className="font-medium text-gray-900 truncate max-w-48">{assigningBooking.dropoff_location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Thời gian:</span>
                    <span className="font-medium text-gray-900">{formatDate(assigningBooking.trip_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số chỗ:</span>
                    <span className="font-medium text-gray-900">{assigningBooking.seats} chỗ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số khách:</span>
                    <span className="font-medium text-gray-900">{assigningBooking.passengers} người</span>
                  </div>
                </div>
              </div>

              {/* Driver Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline mr-2" size={16} />
                  Chọn tài xế <span className="text-red-500">*</span>
                </label>
                {loadingAssignData ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2">Đang tải danh sách tài xế...</p>
                  </div>
                ) : availableDrivers.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                    <p className="text-sm text-yellow-700">Không có tài xế nào đang hoạt động</p>
                  </div>
                ) : (
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  >
                    <option value="">-- Chọn tài xế --</option>
                    {availableDrivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} - {driver.phone} ({driver.status_text || driver.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="inline mr-2" size={16} />
                  Chọn xe <span className="text-red-500">*</span>
                </label>
                {loadingAssignData ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2">Đang tải danh sách xe...</p>
                  </div>
                ) : getFilteredVehicles().length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                    <p className="text-sm text-yellow-700">
                      Không có xe {assigningBooking.seats} chỗ nào sẵn sàng
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  >
                    <option value="">-- Chọn xe --</option>
                    {getFilteredVehicles().map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.vehicle_name} - {vehicle.license_plate} ({vehicle.seats} chỗ)
                      </option>
                    ))}
                  </select>
                )}
                {assigningBooking && getFilteredVehicles().length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    * Xe phải có đúng {assigningBooking.seats} chỗ
                  </p>
                )}
              </div>

              {/* Start Time (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  Thời gian bắt đầu (tùy chọn)
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Để trống để sử dụng thời gian trong đơn hàng
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setAssigningBooking(null);
                    setSelectedDriverId('');
                    setSelectedVehicleId('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAssignDriver}
                  disabled={assigning || !selectedDriverId || !selectedVehicleId || getFilteredVehicles().length === 0}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {assigning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang phân công...
                    </>
                  ) : (
                    <>
                      <UserCheck size={18} />
                      Phân công
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}