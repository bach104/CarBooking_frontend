import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Phone, CreditCard, CheckCircle2, ArrowLeft, Car } from 'lucide-react';
import { motion } from 'motion/react';

export default function DriverRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    license_number: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/drivers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => navigate('/driver-dashboard'), 2000);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md w-full border border-emerald-100"
        >
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-200">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Đăng Ký Thành Công!</h2>
          <p className="text-gray-500 font-medium">Chào mừng bạn gia nhập đội ngũ tài xế. Đang chuyển hướng...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-6 sticky top-0 z-50">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-all">
            <ArrowLeft size={20} /> Quay Lại
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Đăng Ký Tài Xế</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl max-w-lg w-full border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <Car size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Trở Thành Đối Tác</h2>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Gia nhập đội ngũ vận tải</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <UserPlus size={14} /> Họ và Tên
              </label>
              <input 
                required
                type="text" 
                placeholder="Nguyễn Văn A"
                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Phone size={14} /> Số Điện Thoại
              </label>
              <input 
                required
                type="tel" 
                placeholder="090 123 4567"
                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold transition-all"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={14} /> Số Bằng Lái
              </label>
              <input 
                required
                type="text" 
                placeholder="LX123456789"
                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold transition-all"
                value={formData.license_number}
                onChange={e => setFormData({...formData, license_number: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Đang Xử Lý...' : 'Đăng Ký Ngay'}
            </button>
          </form>

          <div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Lợi ích khi tham gia</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Thu nhập ổn định, thanh toán nhanh
              </li>
              <li className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Thời gian làm việc linh hoạt
              </li>
              <li className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Hỗ trợ kỹ thuật 24/7
              </li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
