import React from 'react';
import { TripAssignment } from '../../types/Driver.types';
import { Calendar, User, Phone, Navigation } from 'lucide-react';

interface TripHistoryProps {
  trips: TripAssignment[];
}

export default function TripHistory({ trips }: TripHistoryProps) {
  if (trips.length === 0) {
    return (
      <div className="bg-white p-16 rounded-4xl text-center border border-dashed border-gray-200">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="text-gray-300" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có lịch sử chuyến đi</h3>
        <p className="text-gray-500">Các chuyến đi đã hoàn thành sẽ xuất hiện tại đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {trips.map(trip => (
        <div key={trip.id} className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
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
            <span className="px-3 md:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-700">
              Hoàn thành
            </span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
        </div>
      ))}
    </div>
  );
}