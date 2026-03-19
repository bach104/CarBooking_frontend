import { 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { Booking } from '../../types';

interface StatsTabProps {
  bookings: Booking[];
  customers: any[];
  drivers: any[];
  vehicles: any[];
}

export default function StatsTab({ bookings, customers, drivers, vehicles }: StatsTabProps) {
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
        .reduce((sum, b) => sum + (b.price || 0), 0)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">Doanh Thu (7 ngày qua)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getRevenueData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">Trạng Thái Booking</h3>
          <div className="h-64">
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
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Khách Hàng</div>
          <div className="text-3xl font-bold text-gray-900">{customers.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Tài Xế</div>
          <div className="text-3xl font-bold text-gray-900">{drivers.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Phương Tiện</div>
          <div className="text-3xl font-bold text-gray-900">{vehicles.length}</div>
        </div>
      </div>
    </div>
  );
}