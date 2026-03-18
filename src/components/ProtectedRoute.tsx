import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../redux/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'staff' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { token, currentStaff, isAuthenticated } = useAppSelector((state) => state.staff);
  const location = useLocation();

  console.log('🔒 Protected route check:', { 
    token: !!token, 
    isAuthenticated, 
    role: currentStaff?.role,
    requiredRole 
  });

  if (!token || !isAuthenticated) {
    console.log('⛔ Not authenticated, redirecting to login');
    return <Navigate to="/staff-login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'admin' && currentStaff?.role !== 'admin') {
    console.log('⛔ Not admin, redirecting to dashboard');
    return <Navigate to="/staff-dashboard" replace />;
  }

  console.log('✅ Access granted');
  return <>{children}</>;
}