import React from 'react';
import { Vehicle } from '../../types';

interface VehiclesTabProps {
  vehicles: Vehicle[];
}

export default function VehiclesTab({ vehicles }: VehiclesTabProps) {
  return (
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
  );
}