import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/store';
import { staffLogout } from '../../redux/Staff/Staff.Slice';
import { Menu, LogOut } from 'lucide-react';
import { Booking, Driver, Vehicle } from '../../types';

import Sidebar from '../../components/Sidebar';
import { ViewBookingModal, ViewCustomerModal, AssignmentModal } from '../../components/Modals';

import BookingsTab from './BookingsTab';
import StatsTab from './StatsTab';
import DriversTab from './DriversTab';
import VehiclesTab from './VehiclesTab';
import CustomersTab from './CustomersTab';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [occupancy, setOccupancy] = useState<any[]>([]);
  const [assignment, setAssignment] = useState({ driverId: 0, vehicleId: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'drivers' | 'vehicles' | 'customers' | 'stats'>('bookings');
  const [isLoading, setIsLoading] = useState(true);

  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;

    const checkAuth = () => {
      try {
        const token = localStorage.getItem('staffToken');
        const staff = localStorage.getItem('staffInfo');

        if (!token || !staff) {
          navigate('/staff-login', { replace: true });
          return false;
        }

        const parsedStaff = JSON.parse(staff);
        setStaffInfo(parsedStaff);
        setIsLoading(false);
        hasCheckedAuth.current = true;
        return true;
      } catch (error) {
        console.error('❌ Auth error:', error);
        handleLocalLogout();
        return false;
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (staffInfo && !isLoading) {
      fetchData();
    }
  }, [activeTab, staffInfo, isLoading]);

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
      if (!response.ok) throw new Error('Failed to fetch occupancy');
      const data = await response.json();
      setOccupancy(data);
    } catch (error) {
      console.error('Error fetching occupancy:', error);
      setOccupancy([]);
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

      if ([bRes, dRes, vRes, cRes].some(res => res.status === 401)) {
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
      await dispatch(staffLogout()).unwrap();
      navigate('/staff-login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      handleLocalLogout();
    }
  };

  const handleViewCustomer = async (customer: any) => {
    setViewingCustomer(customer);
    setCustomerBookings([]);
    try {
      const token = localStorage.getItem('staffToken');
      const res = await fetch(`/api/bookings/customer/${customer.phone}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        handleLocalLogout();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setCustomerBookings(data);
      }
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
    }
  };

  const handleConfirmBooking = async (id: number) => {
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

  const handleAssignDriver = async () => {
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
        setAssignment({ driverId: 0, vehicleId: 0 });
        fetchData();
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  };

  // Loading state
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
      <div className="md:hidden bg-linear-to-br from-blue-900 to-emerald-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-emerald-500">Staff</span> Panel
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
            <Menu size={24} />
          </button>
        </div>
      </div>

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        staffInfo={staffInfo}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-4 md:p-8 overflow-x-auto">
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

        {activeTab === 'bookings' && (
          <BookingsTab
            bookings={bookings}
            onViewBooking={setViewingBooking}
            onConfirmBooking={handleConfirmBooking}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab
            bookings={bookings}
            customers={customers}
            drivers={drivers}
            vehicles={vehicles}
          />
        )}
        {activeTab === 'drivers' && <DriversTab drivers={drivers} />}
        {activeTab === 'vehicles' && <VehiclesTab vehicles={vehicles} />}
        {activeTab === 'customers' && (
          <CustomersTab
            customers={customers}
            onViewCustomer={handleViewCustomer}
          />
        )}
      </main>

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
          onAssign={handleAssignDriver}
          onClose={() => {
            setSelectedBooking(null);
            setAssignment({ driverId: 0, vehicleId: 0 });
            setOccupancy([]);
          }}
        />
      )}
    </div>
  );
}