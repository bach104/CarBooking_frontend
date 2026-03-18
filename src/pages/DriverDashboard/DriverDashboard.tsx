import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Car, UserCheck, Check, X, 
  MapPin, Calendar, Info, Menu, BarChart3, TrendingUp, 
  PieChart as PieChartIcon, DollarSign, AlertCircle, Eye,
  Phone, Mail, Clock, Navigation, LogOut
} from 'lucide-react';
import { Booking, Driver, Vehicle } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function StaffDashboard() {
  const navigate = useNavigate();
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

  useEffect(() => {
    const staff = localStorage.getItem('staffInfo');
    const token = localStorage.getItem('staffToken');

    if (!staff || !token) {
      navigate('/staff-login');
      return;
    }

    setStaffInfo(JSON.parse(staff));
  }, [navigate]);

  useEffect(() => {
    if (selectedBooking) {
      const date = selectedBooking.trip_date.split('T')[0];
      fetch(`/api/vehicles/occupancy?date=${date}`)
        .then(res => res.json())
        .then(data => setOccupancy(data));
    }
  }, [selectedBooking]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [bRes, dRes, vRes, cRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/drivers'),
        fetch('/api/vehicles'),
        fetch('/api/customers')
      ]);
      setBookings(await bRes.json());
      setDrivers(await dRes.json());
      setVehicles(await vRes.json());
      setCustomers(await cRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffInfo');
    navigate('/staff-login');
  };

  const handleViewCustomer = async (customer: any) => {
    setViewingCustomer(customer);
    try {
      const res = await fetch(`/api/bookings/customer/${customer.phone}`);
      const data = await res.json();
      setCustomerBookings(data);
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
    }
  };

  const handleConfirm = async (id: number) => {
    await fetch(`/api/bookings/${id}/confirm`, { method: 'PUT' });
    fetchData();
  };

  const handleAssign = async () => {
    if (!selectedBooking) return;
    
    await fetch('/api/assign-driver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: selectedBooking.id,
        driverId: assignment.driverId,
        vehicleId: assignment.vehicleId,
        staffId: 1 // Mock staff ID
      })
    });
    
    setSelectedBooking(null);
    fetchData();
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
        .reduce((sum, b) => sum + (b.price || 0), 0) / 1000 // In thousands
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-linear-to-r from-blue-900 to-emerald-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="text-emerald-500" size={24} /> Staff
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Đăng xuất">
            <LogOut size={20} />
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
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
        <div className="flex justify-between items-start mb-10">
          <h2 className="text-2xl font-bold hidden md:flex items-center gap-2">
            <LayoutDashboard className="text-emerald-500" /> Staff Panel
          </h2>
          <button onClick={handleLogout} className="hidden md:block p-2 hover:bg-white/10 rounded-lg transition-colors" title="Đăng xuất">
            <LogOut size={20} />
          </button>
        </div>
        <nav className="space-y-2">
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
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
            {activeTab === 'stats' ? 'Thống Kê Hệ Thống' : `Quản Lý ${activeTab}`}
          </h1>
          <div className="flex items-center gap-4">
            <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
              Nhân viên: Admin
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

        {/* Statistics Tab Content */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="text-emerald-500" size={20} /> Doanh Thu (7 ngày qua)
                  </h3>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đơn vị: VNĐ</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getRevenueData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Booking Status Pie Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <PieChartIcon className="text-blue-500" size={20} /> Trạng Thái Booking
                </h3>
                <div className="h-64 flex flex-col sm:flex-row items-center">
                  <div className="w-full sm:w-1/2 h-full">
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
                  <div className="w-full sm:w-1/2 space-y-2 mt-4 sm:mt-0">
                    {getBookingStats().map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-medium text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Khách Hàng</div>
                  <div className="text-2xl font-black text-gray-900">{customers.length}</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                  <UserCheck size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tài Xế</div>
                  <div className="text-2xl font-black text-gray-900">{drivers.length}</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                  <Car size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phương Tiện</div>
                  <div className="text-2xl font-black text-gray-900">{vehicles.length}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab !== 'stats' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            {activeTab === 'bookings' && (
              <table className="w-full text-left min-w-1000">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Khách Hàng</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Lộ Trình</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Thời Gian</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Số người</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Giá</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Trạng Thái</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{booking.customer_name}</div>
                        <div className="text-xs text-gray-500 font-medium">{booking.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium flex items-center gap-1"><MapPin size={12} className="text-emerald-500" /> {booking.pickup_location}</div>
                        <div className="text-sm font-medium flex items-center gap-1 mt-1"><MapPin size={12} className="text-red-500" /> {booking.dropoff_location}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">
                        {new Date(booking.trip_date).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">
                        {booking.passengers} người
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                        {booking.price?.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.status} />
                        {booking.low_occupancy_reason && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 p-1 rounded border border-amber-100">
                            <AlertCircle size={10} /> {booking.low_occupancy_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setViewingBooking(booking)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition-all shadow-lg shadow-blue-100"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          {booking.status === 'pending' && (
                            <button 
                              onClick={() => handleConfirm(booking.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl transition-all shadow-lg shadow-emerald-100"
                              title="Xác nhận"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button 
                              onClick={() => setSelectedBooking(booking)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
                            >
                              Phân Công
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'drivers' && (
              <table className="w-full text-left min-w-600">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Tên Tài Xế</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Số Điện Thoại</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Số Bằng Lái</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {drivers.map(driver => (
                    <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{driver.name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{driver.phone}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{driver.license_number}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${driver.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {driver.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'vehicles' && (
              <table className="w-full text-left min-w-600">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Biển Số</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Loại Xe</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Số Chỗ</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vehicles.map(vehicle => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{vehicle.license_plate}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{vehicle.type_name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{vehicle.seats} chỗ</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${vehicle.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'customers' && (
              <table className="w-full text-left min-w-600">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Tên Khách Hàng</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Số Điện Thoại</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Ngày Đăng Ký</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map(customer => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{customer.name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{customer.phone}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{customer.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">
                        {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
                        >
                          Xem Chi Tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* View Booking Details Modal */}
        {viewingBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-1002 p-4">
            <div className="bg-white rounded-4xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900">Chi Tiết Yêu Cầu Đặt Xe</h3>
                <button onClick={() => setViewingBooking(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users size={16} /> Thông Tin Khách Hàng
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-400 font-bold">Họ và Tên</div>
                      <div className="font-bold text-gray-900 flex items-center gap-2 mt-1">
                        <UserCheck size={16} className="text-emerald-500" />
                        {viewingBooking.customer_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-bold">Số Điện Thoại</div>
                      <div className="font-bold text-gray-900 flex items-center gap-2 mt-1">
                        <Phone size={16} className="text-blue-500" />
                        {viewingBooking.customer_phone}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-400 font-bold">Email</div>
                      <div className="font-bold text-gray-900 flex items-center gap-2 mt-1">
                        <Mail size={16} className="text-purple-500" />
                        {viewingBooking.email || 'Không có email'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trip Info */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Navigation size={16} /> Thông Tin Chuyến Đi
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-3 h-3 rounded-full border-4 border-emerald-500 bg-white"></div>
                        <div className="w-0.5 h-12 border-l-2 border-dashed border-gray-300"></div>
                        <div className="w-3 h-3 rounded-full border-4 border-red-500 bg-white"></div>
                      </div>
                      <div className="flex-1 space-y-6">
                        <div>
                          <div className="text-xs text-gray-400 font-bold">Điểm Đón</div>
                          <div className="font-bold text-gray-900">{viewingBooking.pickup_location}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 font-bold">Điểm Đến</div>
                          <div className="font-bold text-gray-900">{viewingBooking.dropoff_location}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-400 font-bold">Ngày & Giờ</div>
                        <div className="font-bold text-gray-900 flex items-center gap-2 mt-1">
                          <Clock size={16} className="text-emerald-500" />
                          {new Date(viewingBooking.trip_date).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-bold">Loại Xe</div>
                        <div className="font-bold text-gray-900 flex items-center gap-2 mt-1">
                          <Car size={16} className="text-emerald-500" />
                          {viewingBooking.vehicle_type} ({viewingBooking.passengers} người)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={() => setViewingBooking(null)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Customer Details Modal */}
        {viewingCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-1002 p-4">
            <div className="bg-white rounded-4xl w-full max-w-3xl p-8 shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b border-gray-100">
                <h3 className="text-2xl font-black text-gray-900">Chi Tiết Khách Hàng</h3>
                <button onClick={() => { setViewingCustomer(null); setCustomerBookings([]); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-linear-to-r from-blue-50 to-emerald-50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users size={16} /> Thông Tin Khách Hàng
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs text-gray-400 font-bold">Họ và Tên</div>
                      <div className="font-bold text-gray-900 flex items-center gap-2 mt-1 text-lg">
                        {viewingCustomer.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-bold">Số Điện Thoại</div>
                      <div className="font-bold text-gray-900 flex items-center gap-2 mt-1 text-lg">
                        <Phone size={16} className="text-blue-500" />
                        {viewingCustomer.phone}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-400 font-bold">Email</div>
                      <div className="font-bold text-gray-900 flex items-center gap-2 mt-1">
                        <Mail size={16} className="text-purple-500" />
                        {viewingCustomer.email || 'Không có email'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-bold">Tổng Chuyến Đi</div>
                      <div className="font-black text-gray-900 text-2xl mt-1">{customerBookings.length}</div>
                    </div>
                  </div>
                </div>

                {/* Customer Bookings */}
                <div>
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar size={16} /> Danh Sách Chuyến Đi ({customerBookings.length})
                  </h4>
                  {customerBookings.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {customerBookings.map((booking) => (
                        <div key={booking.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold bg-gray-900 text-white px-2 py-1 rounded">#{booking.id}</span>
                                <StatusBadge status={booking.status} />
                              </div>
                              <div className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
                                <MapPin size={14} className="text-emerald-500" /> {booking.pickup_location}
                              </div>
                              <div className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
                                <MapPin size={14} className="text-red-500" /> {booking.dropoff_location}
                              </div>
                              <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                <Clock size={12} /> {new Date(booking.trip_date).toLocaleString('vi-VN')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-400 font-bold">Số Khách</div>
                              <div className="text-xl font-black text-gray-900">{booking.passengers}</div>
                              <div className="text-xs text-gray-400 font-bold mt-2">Giá</div>
                              <div className="text-lg font-black text-emerald-600">{booking.price?.toLocaleString('vi-VN')}đ</div>
                            </div>
                          </div>
                          {booking.low_occupancy_reason && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded flex items-center gap-1">
                                <AlertCircle size={12} /> <span>Lý do khởi hành sớm: {booking.low_occupancy_reason}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-2xl text-center border-2 border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">Khách hàng chưa có chuyến đi nào</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => { setViewingCustomer(null); setCustomerBookings([]); }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-1002 p-4">
            <div className="bg-white rounded-4xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900">Phân Công Chuyến Đi</h3>
                <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Chọn Tài Xế</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-gray-700 transition-all"
                    onChange={e => setAssignment({...assignment, driverId: parseInt(e.target.value)})}
                  >
                    <option value="">-- Chọn tài xế --</option>
                    {drivers.filter(d => d.status === 'active').map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Chọn Xe (Xem chỗ trống ngày {selectedBooking.trip_date.split('T')[0]})
                  </label>
                  <select 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-gray-700 transition-all"
                    onChange={e => setAssignment({...assignment, vehicleId: parseInt(e.target.value)})}
                  >
                    <option value="">-- Chọn xe --</option>
                    {vehicles.map(v => {
                      const occ = occupancy.find(o => o.vehicle_id === v.id);
                      const currentPassengers = occ ? occ.total_passengers : 0;
                      const remainingSeats = (v.seats || 0) - currentPassengers;
                      const isFull = remainingSeats < (selectedBooking?.passengers || 0);
                      
                      return (
                        <option 
                          key={v.id} 
                          value={v.id} 
                          disabled={isFull}
                        >
                          {v.license_plate} - {v.type_name} ({currentPassengers}/{v.seats} chỗ) 
                          {isFull ? ' - HẾT CHỖ' : ` - Còn ${remainingSeats} chỗ`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button 
                  onClick={handleAssign}
                  disabled={!assignment.driverId || !assignment.vehicleId}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-100 transition-all"
                >
                  Xác Nhận Phân Công
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SidebarButton({ icon, label, onClick, active = false }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

function StatCard({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
      <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{label}</div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-black text-gray-900">{value}</div>
        <div className={`w-3 h-3 rounded-full ${color} shadow-lg shadow-current opacity-50`}></div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    assigned: 'bg-purple-100 text-purple-700',
    'in-progress': 'bg-emerald-100 text-emerald-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] || 'bg-gray-100'}`}>
      {status === 'pending' ? 'Chờ xác nhận' :
       status === 'confirmed' ? 'Đã xác nhận' :
       status === 'assigned' ? 'Đã phân công' :
       status === 'in-progress' ? 'Đang thực hiện' :
       status === 'completed' ? 'Hoàn thành' :
       status === 'cancelled' ? 'Đã hủy' : status}
    </span>
  );
}