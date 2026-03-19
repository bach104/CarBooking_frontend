import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { driverLogin, clearError } from '../../redux/Driver/Driver.Slice';

export default function DriverLogin() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, currentDriver, token } = useAppSelector((state) => state.driver);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [localError, setLocalError] = useState('');

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng
  useEffect(() => {
    if (token && currentDriver) {
      navigate('/driver-dashboard');
    }
  }, [token, currentDriver, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());

    // Validate dữ liệu
    if (!formData.username || !formData.password) {
      setLocalError('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    try {
      // Đăng nhập
      const result = await dispatch(driverLogin({
        username: formData.username,
        password: formData.password
      })).unwrap();
      
      if (result) {
        navigate('/driver-dashboard');
      }
    } catch (error: any) {
      // Error đã được xử lý trong slice
      console.error('Login error:', error);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30 transform hover:scale-105 transition-transform">
            <Car size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">
            Đăng Nhập Tài Xế
          </h2>
          <p className="text-gray-500 font-medium mt-2">
            Chào mừng bạn trở lại!
          </p>
        </div>

        {displayError && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-600 animate-in slide-in-from-top">
            <AlertCircle size={20} className="shrink-0" />
            <span className="text-sm font-medium">{displayError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputGroup label="Tên Đăng Nhập" required>
            <input
              type="text"
              required
              className="w-full py-4 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              placeholder="Nhập tên đăng nhập"
              disabled={loading}
              autoFocus
            />
          </InputGroup>

          <InputGroup label="Mật Khẩu" required>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full py-4 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium pr-12"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="Nhập mật khẩu"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </InputGroup>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                Đăng Nhập
              </>
            )}
          </button>
        </form>

        {/* Forgot password link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              // TODO: Implement forgot password
              alert('Tính năng đang phát triển');
            }}
            className="text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-colors"
            disabled={loading}
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Register link */}
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <button
              onClick={() => navigate('/driver-register')}
              className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
              disabled={loading}
            >
              Đăng ký ngay
            </button>
          </span>
        </div>

        {/* Note */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <a href="#" className="text-emerald-600 hover:underline">Điều khoản dịch vụ</a>{' '}
            và{' '}
            <a href="#" className="text-emerald-600 hover:underline">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </div>
  );
}
function InputGroup({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}