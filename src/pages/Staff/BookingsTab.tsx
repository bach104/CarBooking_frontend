import React from 'react';
import { Eye, Check } from 'lucide-react';
import { StatusBadge, StatCard } from '../../components/Common';
import { Booking } from '../../types';

interface BookingsTabProps {
  bookings: Booking[];
  onViewBooking: (booking: Booking) => void;
  onConfirmBooking: (id: number) => void;
}

export default function BookingsTab({ bookings, onViewBooking, onConfirmBooking }: BookingsTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard label="Tổng Booking" value={bookings.length} color="bg-blue-500" />
        <StatCard label="Chờ Xác Nhận" value={bookings.filter(b => b.status === 'pending').length} color="bg-yellow-500" />
        <StatCard label="Đang Thực Hiện" value={bookings.filter(b => b.status === 'in-progress').length} color="bg-emerald-500" />
        <StatCard label="Hoàn Thành" value={bookings.filter(b => b.status === 'completed').length} color="bg-gray-500" />
      </div>

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
                      onClick={() => onViewBooking(booking)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Eye size={18} />
                    </button>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => onConfirmBooking(booking.id)}
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
    </>
  );
}