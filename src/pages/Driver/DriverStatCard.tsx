import React from 'react';

interface DriverStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

export default function DriverStatCard({ icon, label, value }: DriverStatCardProps) {
  return (
    <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3 md:gap-4">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-[9px] md:text-[10px] text-gray-400 uppercase font-black tracking-wider">{label}</div>
        <div className="text-lg md:text-xl font-black text-gray-900 leading-none mt-1">{value}</div>
      </div>
    </div>
  );
}