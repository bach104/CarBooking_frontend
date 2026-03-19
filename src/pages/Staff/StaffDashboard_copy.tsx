import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/store';
import { staffLogout } from '../../redux/Staff/Staff.Slice';
import { 
  LayoutDashboard, Users, Car, UserCheck, Check, X, 
  MapPin, Calendar, Menu, BarChart3, TrendingUp, 
  PieChart as PieChartIcon, AlertCircle, Eye,
  Phone, Mail, Clock, Navigation, LogOut
} from 'lucide-react';
import { Booking, Driver, Vehicle } from '../../types';
import { 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [occupancy, setOccupancy] = useState<any[]>([]);
  const [assignment, setAssignment] = useState({ driverId: 0, vehicleId: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'drivers' | 'vehicles' | 'customers' | 'stats'>('bookings');
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const hasCheckedAuth = useRef(false);

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (hasCheckedAuth.current) return;

    const checkAuth = () => {
      try {
        const token = localStorage.getItem('staffToken');
        const staff = localStorage.getItem('staffInfo');

        console.log('🔐 Checking auth:', { hasToken: !!token, hasStaff: !!staff });

        if (!token || !staff) {
          console.log('🚫 No auth data, redirecting to login');
          navigate('/staff-login', { replace: true });
          return false;
        }

        const parsedStaff = JSON.parse(staff);
        setStaffInfo(parsedStaff);
        setIsLoading(false);
        hasCheckedAuth.current = true;
        return true;
      } catch (error) {
        console.error('❌ Error parsing staff info:', error);
        handleLocalLogout();
        return false;
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch data
  useEffect(() => {
    if (staffInfo && !isLoading) {
      fetchData();
    }
  }, [activeTab, staffInfo, isLoading]);

  // Fetch occupancy
  useEffect(() => {
    if (selectedBooking) {
      const date = selectedBooking.trip_date.split('T')[0];
      fetchOccupancy(date);
    }
  }, [selectedBooking]);

  const fetchOccupancy = async (date: string) => {
    try {
      const token = localStorage.getItem('staffToken');
      const response = await fetch(`/api/vehicles/occupancy?date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOccupancy(data);
    } catch (error) {
      console.error('Error fetching occupancy:', error);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('staffToken');
      
      if (!token) {
        handleLocalLogout();
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [bRes, dRes, vRes, cRes] = await Promise.all([
        fetch('/api/bookings', { headers }),
        fetch('/api/drivers', { headers }),
        fetch('/api/vehicles', { headers }),
        fetch('/api/customers', { headers })
      ]);

      if (bRes.status === 401 || dRes.status === 401 || vRes.status === 401 || cRes.status === 401) {
        handleLocalLogout();
        return;
      }

      if (!bRes.ok || !dRes.ok || !vRes.ok || !cRes.ok) {
        throw new Error('Failed to fetch data');
      }

      setBookings(await bRes.json());
      setDrivers(await dRes.json());
      setVehicles(await vRes.json());
      setCustomers(await cRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLocalLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffInfo');
    setStaffInfo(null);
    setIsLoading(false);
    hasCheckedAuth.current = false;
    navigate('/staff-login', { replace: true });
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      await dispatch(staffLogout()).unwrap();
      // staffLogout trong slice đã xóa localStorage và update state
      navigate('/staff-login', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Nếu lỗi, vẫn logout local
      handleLocalLogout();
    }
  };

  const handleViewCustomer = async (customer: any) => {
    setViewingCustomer(customer);
    try {
      const token = localStorage.getItem('staffToken');
      const res = await fetch(`/api/bookings/customer/${customer.phone}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        handleLocalLogout();
        return;
      }

      const data = await res.json();
      setCustomerBookings(data);
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      const token = localStorage.getItem('staffToken');
      const response = await fetch(`/api/bookings/${id}/confirm`, { 
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        handleLocalLogout();
        return;
      }

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedBooking) return;
    
    try {
      const token = localStorage.getItem('staffToken');
      const response = await fetch('/api/assign-driver', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          driverId: assignment.driverId,
          vehicleId: assignment.vehicleId,
          staffId: staffInfo?.id
        })
      });

      if (response.status === 401) {
        handleLocalLogout();
        return;
      }

      if (response.ok) {
        setSelectedBooking(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error asxigning driver:', error);
    }
  };

  // Prepare data for charts
  const getBookingStats = () => {
    const statusCounts = bookings.reduce((acc: any, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Chờ', value: statusCounts.pending || 0, color: '#EAB308' },
      { name: 'Xác nhận', value: statusCounts.confirmed || 0, color: '#3B82F6' },
      { name: 'Đang đi', value: statusCounts['in-progress'] || 0, color: '#10B981' },
      { name: 'Hoàn thành', value: statusCounts.completed || 0, color: '#6B7280' },
    ];
  };

  const getRevenueData = () => {
    const completed = bookings.filter(b => b.status === 'completed');
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      revenue: completed
        .filter(b => b.trip_date.startsWith(date))
        .reduce((sum, b) => sum + (b.price || 0), 0)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!staffInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden linear-to-br from-blue-900 to-emerald-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="text-emerald-500" size={24} /> Staff
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLogout} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors" 
            title="Đăng xuất"
          >
            <LogOut size={20} />
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-linear-to-b from-gray-900 to-blue-900 text-white p-6 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-10">
            <h2 className="text-2xl font-bold hidden md:flex items-center gap-2">
              <LayoutDashboard className="text-emerald-500" /> Staff Panel
            </h2>
           
          </div>
          
          <nav className="space-y-2 flex-1">
            <SidebarButton 
              onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }} 
              icon={<Calendar size={20} />} 
              label="Bookings" 
              active={activeTab === 'bookings'} 
            />
            <SidebarButton 
              onClick={() => { setActiveTab('stats'); setIsSidebarOpen(false); }} 
              icon={<BarChart3 size={20} />} 
              label="Thống Kê" 
              active={activeTab === 'stats'} 
            />
            <SidebarButton 
              onClick={() => { setActiveTab('drivers'); setIsSidebarOpen(false); }} 
              icon={<UserCheck size={20} />} 
              label="Drivers" 
              active={activeTab === 'drivers'} 
            />
            <SidebarButton 
              onClick={() => { setActiveTab('vehicles'); setIsSidebarOpen(false); }} 
              icon={<Car size={20} />} 
              label="Vehicles" 
              active={activeTab === 'vehicles'} 
            />
            <SidebarButton 
              onClick={() => { setActiveTab('customers'); setIsSidebarOpen(false); }} 
              icon={<Users size={20} />} 
              label="Customers" 
              active={activeTab === 'customers'} 
            />
          </nav>

          {staffInfo && (
            <div className="mt-auto pt-6 border-t border-gray-700">
              <div className="bg-white/10 rounded-2xl p-4 text-sm">
                <div className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-1">Nhân viên</div>
                <div className="font-bold">{staffInfo.name}</div>
                <div className="text-xs text-gray-300 mt-1">{staffInfo.phone}</div>
                <div className="text-xs text-gray-300 mt-1">{staffInfo.email}</div>
                <button 
                    onClick={handleLogout} 
                    className="p-2 flex mt-2 cursor-pointer border border-white gap-2 hover:bg-white/10 rounded-lg transition-colors" 
                    title="Đăng xuất"
                  >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
            {activeTab === 'stats' ? 'Thống Kê Hệ Thống' : `Quản Lý ${activeTab}`}
          </h1>
          <div className="flex items-center gap-4">
            <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
              Nhân viên: {staffInfo?.name}
            </span>
          </div>
        </header>

        {/* Stats Summary Cards */}
        {activeTab === 'bookings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard label="Tổng Booking" value={bookings.length} color="bg-blue-500" />
            <StatCard label="Chờ Xác Nhận" value={bookings.filter(b => b.status === 'pending').length} color="bg-yellow-500" />
            <StatCard label="Đang Thực Hiện" value={bookings.filter(b => b.status === 'in-progress').length} color="bg-emerald-500" />
            <StatCard label="Hoàn Thành" value={bookings.filter(b => b.status === 'completed').length} color="bg-gray-500" />
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Doanh Thu (7 ngày qua)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getRevenueData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Booking Status Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Trạng Thái Booking</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getBookingStats()}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getBookingStats().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500">Khách Hàng</div>
                <div className="text-3xl font-bold text-gray-900">{customers.length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500">Tài Xế</div>
                <div className="text-3xl font-bold text-gray-900">{drivers.length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500">Phương Tiện</div>
                <div className="text-3xl font-bold text-gray-900">{vehicles.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Khách Hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Điểm Đón</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Điểm Đến</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Thời Gian</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trạng Thái</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{booking.customer_name}</div>
                      <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4">{booking.pickup_location}</td>
                    <td className="px-6 py-4">{booking.dropoff_location}</td>
                    <td className="px-6 py-4">
                      {new Date(booking.trip_date).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setViewingBooking(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={18} />
                        </button>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleConfirm(booking.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          >
                            <Check size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Drivers Table */}
        {activeTab === 'drivers' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tên Tài Xế</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Số Điện Thoại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Số Bằng Lái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td className="px-6 py-4 font-medium">{driver.name}</td>
                    <td className="px-6 py-4">{driver.phone}</td>
                    <td className="px-6 py-4">{driver.license_number}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        driver.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {driver.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Vehicles Table */}
        {activeTab === 'vehicles' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Biển Số</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Loại Xe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Số Chỗ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4 font-medium">{vehicle.license_plate}</td>
                    <td className="px-6 py-4">{vehicle.type_name}</td>
                    <td className="px-6 py-4">{vehicle.seats} chỗ</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === 'available' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {vehicle.status === 'available' ? 'Sẵn sàng' : 'Đang sử dụng'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Customers Table */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tên Khách Hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Số Điện Thoại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ngày Đăng Ký</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 font-medium">{customer.name}</td>
                    <td className="px-6 py-4">{customer.phone}</td>
                    <td className="px-6 py-4">{customer.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        Xem Chi Tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modals */}
      {viewingBooking && (
        <ViewBookingModal
          booking={viewingBooking}
          onClose={() => setViewingBooking(null)}
        />
      )}

      {viewingCustomer && (
        <ViewCustomerModal
          customer={viewingCustomer}
          bookings={customerBookings}
          onClose={() => {
            setViewingCustomer(null);
            setCustomerBookings([]);
          }}
        />
      )}

      {selectedBooking && (
        <AssignmentModal
          booking={selectedBooking}
          drivers={drivers}
          vehicles={vehicles}
          occupancy={occupancy}
          assignment={assignment}
          setAssignment={setAssignment}
          onAssign={handleAssign}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}

// Helper Components
function SidebarButton({ icon, label, onClick, active }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-emerald-500 text-white' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500 mb-2">{label}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-emerald-100 text-emerald-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const labels: any = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    'in-progress': 'Đang thực hiện',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
}

// Modal Components (giữ nguyên như cũ)
function ViewBookingModal({ booking, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Chi Tiết Booking</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        {/* Nội dung chi tiết booking */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Khách hàng</label>
            <p className="font-medium">{booking.customer_name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Số điện thoại</label>
            <p className="font-medium">{booking.customer_phone}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Điểm đón</label>
            <p className="font-medium">{booking.pickup_location}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Điểm đến</label>
            <p className="font-medium">{booking.dropoff_location}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Thời gian</label>
            <p className="font-medium">{new Date(booking.trip_date).toLocaleString('vi-VN')}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Số người</label>
            <p className="font-medium">{booking.passengers}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Giá</label>
            <p className="font-medium">{booking.price?.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewCustomerModal({ customer, bookings, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Chi Tiết Khách Hàng</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Thông tin khách hàng */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-medium mb-3">Thông tin cá nhân</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Họ tên</div>
                <div className="font-medium">{customer.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Số điện thoại</div>
                <div className="font-medium">{customer.phone}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">{customer.email || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Lịch sử đặt xe */}
          <div>
            <h4 className="font-medium mb-3">Lịch sử đặt xe ({bookings.length})</h4>
            <div className="space-y-3">
              {bookings.map((booking: any) => (
                <div key={booking.id} className="border rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">#{booking.id}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Đón: {booking.pickup_location}</div>
                    <div>Đến: {booking.dropoff_location}</div>
                    <div>Thời gian: {new Date(booking.trip_date).toLocaleString('vi-VN')}</div>
                    <div>Giá: {booking.price?.toLocaleString('vi-VN')}đ</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignmentModal({ booking, drivers, vehicles, occupancy, assignment, setAssignment, onAssign, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Phân Công Chuyến Đi</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Tài Xế
            </label>
            <select
              className="w-full p-3 border border-gray-200 rounded-xl"
              onChange={(e) => setAssignment({...assignment, driverId: parseInt(e.target.value)})}
            >
              <option value="">-- Chọn tài xế --</option>
              {drivers.filter((d: any) => d.status === 'active').map((driver: any) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} - {driver.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Xe
            </label>
            <select
              className="w-full p-3 border border-gray-200 rounded-xl"
              onChange={(e) => setAssignment({...assignment, vehicleId: parseInt(e.target.value)})}
            >
              <option value="">-- Chọn xe --</option>
              {vehicles.map((vehicle: any) => {
                const occ = occupancy.find((o: any) => o.vehicle_id === vehicle.id);
                const currentPassengers = occ ? occ.total_passengers : 0;
                const remainingSeats = vehicle.seats - currentPassengers;
                const isFull = remainingSeats < booking.passengers;

                return (
                  <option key={vehicle.id} value={vehicle.id} disabled={isFull}>
                    {vehicle.license_plate} - {vehicle.type_name} ({currentPassengers}/{vehicle.seats} chỗ)
                    {isFull ? ' - HẾT CHỖ' : ` - Còn ${remainingSeats} chỗ`}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={onAssign}
            disabled={!assignment.driverId || !assignment.vehicleId}
            className="w-full mt-4 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Xác Nhận Phân Công
          </button>
        </div>
      </div>
    </div>
  );
}