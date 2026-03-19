import React from 'react';
import { TripAssignment, LowOccupancyTrip } from '../../types/Driver.types';
import { Calendar, User, Phone, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import LowOccupancyForm from './LowOccupancyForm';

interface TripCardProps {
  trip: TripAssignment;
  lowOccupancyTrip: LowOccupancyTrip | null;
  onConfirm: (assignmentId: number, bookingId: number, totalOccupancy: number, seats: number) => void;
  onComplete: (bookingId: number) => void;
  onLowOccupancyCancel: () => void;
}

export default function TripCard({ 
  trip, 
  lowOccupancyTrip, 
  onConfirm, 
  onComplete,
  onLowOccupancyCancel 
}: TripCardProps) {
  const getStatusBadge = () => {
    switch (trip.booking_status) {
      case 'assigned':
        return <span className="px-3 md:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">Đã phân công</span>;
      case 'in-progress':
        return <span className="px-3 md:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">Đang thực hiện</span>;
      case 'completed':
        return <span className="px-3 md:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-700">Hoàn thành</span>;
      default:
        return <span className="px-3 md:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-700">{trip.booking_status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
      <div className="p-4 md:p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Calendar className="text-emerald-500" size={20} />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Thời Gian Đón</div>
            <div className="font-bold text-gray-900 text-sm md:text-base">
              {trip.trip_date ? new Date(trip.trip_date).toLocaleString('vi-VN') : 'Chưa xác định'}
            </div>
          </div>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="p-6 md:p-8">
        <div className="flex gap-4 md:gap-6 mb-8">
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="w-3.5 h-3.5 rounded-full border-4 border-emerald-500 bg-white"></div>
            <div className="w-0.5 flex-1 border-l-2 border-dashed border-gray-200"></div>
            <div className="w-3.5 h-3.5 rounded-full border-4 border-red-500 bg-white"></div>
          </div>
          <div className="flex-1 space-y-6 md:space-y-8">
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-1">Điểm Đón</div>
              <div className="font-bold text-base md:text-lg text-gray-900 line-clamp-2">{trip.pickup_location}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-1">Điểm Đến</div>
              <div className="font-bold text-base md:text-lg text-gray-900 line-clamp-2">{trip.dropoff_location}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="text-[10px] text-gray-400 uppercase font-black mb-1">Khách Hàng</div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span className="font-bold text-sm">Khách hàng #{trip.booking_id}</span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="text-[10px] text-gray-400 uppercase font-black mb-1">Liên Hệ</div>
            <button className="flex items-center gap-2 text-emerald-600 font-bold hover:underline text-sm">
              <Phone size={16} />
              <span>Gọi Ngay</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {lowOccupancyTrip?.assignmentId === trip.id && (
            <LowOccupancyForm
              tripId={trip.id}
              bookingId={trip.booking_id}
              totalOccupancy={trip.total_occupancy}
              vehicleSeats={trip.vehicle_seats}
              onConfirm={(reason) => onConfirm(trip.id, trip.booking_id, trip.total_occupancy, trip.vehicle_seats)}
              onCancel={onLowOccupancyCancel}
            />
          )}

          {!lowOccupancyTrip && trip.driver_confirm === 0 ? (
            <button 
              onClick={() => onConfirm(trip.id, trip.booking_id, trip.total_occupancy, trip.vehicle_seats)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
            >
              Xác Nhận Nhận Chuyến <ChevronRight size={18} />
            </button>
          ) : trip.booking_status === 'in-progress' ? (
            <button 
              onClick={() => onComplete(trip.booking_id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
            >
              Hoàn Thành Chuyến Đi <CheckCircle size={18} />
            </button>
          ) : (
            <div className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 text-xs md:text-sm">
              <AlertCircle size={18} /> Chờ khách hàng thanh toán
            </div>
          )}
        </div>
      </div>
    </div>
  );
}