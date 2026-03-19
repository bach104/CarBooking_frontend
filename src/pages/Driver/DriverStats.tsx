import React from 'react';
import { DriverStats as DriverStatsType } from '../../types/Driver.types';
import { TrendingUp, Star } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DriverStatsProps {
  stats: DriverStatsType;
}

export default function DriverStats({ stats }: DriverStatsProps) {
  const getEarningsData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      earnings: Math.floor(Math.random() * 500) + 100
    }));
  };

  return (
    <div className="space-y-6">
      {/* Earnings Chart */}
      <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={20} /> Thu Nhập Tuần Này
          </h3>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đơn vị: Nghìn VNĐ</div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getEarningsData()}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 'bold', color: '#10B981' }}
              />
              <Area type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Hiệu Suất Chuyến</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gray-600">Tỷ lệ hoàn thành</span>
              <span className="text-lg font-black text-emerald-600">
                {stats.totalTrips > 0 ? Math.round((stats.completedTrips / stats.totalTrips) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full" 
                style={{ width: `${stats.totalTrips > 0 ? (stats.completedTrips / stats.totalTrips) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Đánh Giá Gần Đây</h3>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className={i < Math.floor(stats.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
            ))}
            <span className="ml-2 font-bold text-gray-900">{stats.rating || 0}/5.0</span>
          </div>
          <p className="text-xs text-gray-500 font-medium italic">"Tài xế rất nhiệt tình, lái xe an toàn."</p>
        </div>
      </div>
    </div>
  );
}