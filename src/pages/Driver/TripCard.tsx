import { DriverTrip, BOOKING_STATUS_TEXT, BOOKING_STATUS_COLORS } from '../../types/DriverTrip.types';
import { Calendar, MapPin, Users, Car, Phone, CheckCircle, AlertCircle, ChevronRight, Clock } from 'lucide-react';

interface TripCardProps {
  trip: DriverTrip;
  onConfirm: () => void;
  onComplete: () => void;
  isConfirming?: boolean;
  showReasonModal?: boolean;
  reason?: string;
  onReasonChange?: (reason: string) => void;
  onConfirmWithReason?: () => void;
  onCancelReason?: () => void;
}

export default function TripCard({ 
  trip, 
  onConfirm, 
  onComplete,
  isConfirming = false,
  showReasonModal = false,
  reason = '',
  onReasonChange,
  onConfirmWithReason,
  onCancelReason
}: TripCardProps) {
  const getStatusBadge = () => {
    const baseClass = "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider";
    const colorClass = BOOKING_STATUS_COLORS[trip.booking_status] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`${baseClass} ${colorClass}`}>
        {BOOKING_STATUS_TEXT[trip.booking_status]}
      </span>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Chưa xác định';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAssigned = trip.booking_status === 'assigned' && trip.driver_confirm === 0;
  const isInProgress = trip.booking_status === 'in-progress';
  const isCompleted = trip.booking_status === 'completed';
  const occupancyRate = (trip.total_occupancy / trip.vehicle_seats) * 100;

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Calendar className="text-emerald-600" size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Thời gian đón</div>
              <div className="font-bold text-gray-800">{formatDate(trip.trip_date)}</div>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </div>
      
      {/* Body */}
      <div className="p-6">
        {/* Route */}
        <div className="flex gap-4 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></div>
            <div className="w-0.5 h-16 bg-linear-to-b from-emerald-300 to-red-300"></div>
            <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100"></div>
          </div>
          <div className="flex-1 space-y-5">
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Điểm đón</div>
              <div className="font-semibold text-gray-800 flex items-start gap-2">
                <MapPin size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{trip.pickup_location}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Điểm đến</div>
              <div className="font-semibold text-gray-800 flex items-start gap-2">
                <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{trip.dropoff_location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-2xl">
            <div className="text-xs text-gray-400 font-bold uppercase mb-2 flex items-center gap-1">
              <Users size={14} /> Số khách
            </div>
            <div className="font-bold text-gray-800">
              {trip.total_occupancy} / {trip.vehicle_seats}
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    occupancyRate >= 80 ? 'bg-emerald-500' : occupancyRate >= 50 ? 'bg-yellow-500' : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl">
            <div className="text-xs text-gray-400 font-bold uppercase mb-2 flex items-center gap-1">
              <Car size={14} /> Phương tiện
            </div>
            <div className="font-bold text-gray-800">
              {trip.vehicle_name || `Xe ${trip.vehicle_seats} chỗ`}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isAssigned && !showReasonModal && (
            <button 
              onClick={onConfirm}
              disabled={isConfirming}
              className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold uppercase tracking-wide text-sm shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isConfirming ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Xác Nhận Nhận Chuyến
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          )}

          {showReasonModal && (
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-3">
                <AlertCircle size={18} />
                Công suất dưới 80% ({Math.round(occupancyRate)}%)
              </div>
              <p className="text-sm text-amber-600 mb-3">Vui lòng nhập lý do khởi hành khi chưa đủ khách:</p>
              <textarea 
                className="w-full p-3 bg-white border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm transition-all mb-3"
                placeholder="Ví dụ: Khách yêu cầu đi gấp, xe hỏng..."
                value={reason}
                onChange={(e) => onReasonChange?.(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <button 
                  onClick={onCancelReason}
                  className="flex-1 bg-white border border-amber-200 text-amber-700 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-50 transition-all"
                >
                  Hủy
                </button>
                <button 
                  onClick={onConfirmWithReason}
                  disabled={!reason.trim()}
                  className="flex-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed"
                >
                  Gửi & Khởi Hành
                </button>
              </div>
            </div>
          )}

          {isInProgress && (
            <button 
              onClick={onComplete}
              className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-2xl font-bold uppercase tracking-wide text-sm shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Hoàn Thành Chuyến Đi
            </button>
          )}

          {isCompleted && (
            <div className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 text-sm">
              <Clock size={18} />
              Chuyến đã hoàn thành
            </div>
          )}
        </div>

        {/* Notes (if any) */}
        {trip.driver_notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 italic border-l-4 border-emerald-400">
            "{trip.driver_notes}"
          </div>
        )}
      </div>
    </div>
  );
}