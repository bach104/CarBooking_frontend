import React from 'react';
import { X } from 'lucide-react';
import { StatusBadge } from './Common';

export function ViewBookingModal({ booking, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Chi Tiết Booking</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
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

export function ViewCustomerModal({ customer, bookings, onClose }: any) {
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

export function AssignmentModal({ booking, drivers, vehicles, occupancy, assignment, setAssignment, onAssign, onClose }: any) {
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