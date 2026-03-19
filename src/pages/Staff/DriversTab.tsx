import { Driver } from '../../types';

interface DriversTabProps {
  drivers: Driver[];
}

export default function DriversTab({ drivers }: DriversTabProps) {
  return (
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
  );
}