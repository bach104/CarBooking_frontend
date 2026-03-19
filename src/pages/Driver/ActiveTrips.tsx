import React from 'react';
import { TripAssignment, LowOccupancyTrip } from '../../types/Driver.types';
import TripCard from './TripCard';
import { Navigation } from 'lucide-react';

interface ActiveTripsProps {
  trips: TripAssignment[];
  lowOccupancyTrip: LowOccupancyTrip | null;
  onConfirm: (assignmentId: number, bookingId: number, totalOccupancy: number, seats: number) => void;
  onComplete: (bookingId: number) => void;
  onLowOccupancyCancel: () => void;
}

export default function ActiveTrips({ 
  trips, 
  lowOccupancyTrip, 
  onConfirm, 
  onComplete,
  onLowOccupancyCancel 
}: ActiveTripsProps) {
  if (trips.length === 0) {
    return (
      <div className="bg-white p-16 rounded-4xl text-center border border-dashed border-gray-200">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Navigation className="text-gray-300" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có chuyến đi nào</h3>
        <p className="text-gray-500">Khi có chuyến đi mới được phân công, chúng sẽ xuất hiện tại đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {trips.map(trip => (
        <TripCard
          key={trip.id}
          trip={trip}
          lowOccupancyTrip={lowOccupancyTrip}
          onConfirm={onConfirm}
          onComplete={onComplete}
          onLowOccupancyCancel={onLowOccupancyCancel}
        />
      ))}
    </div>
  );
}