import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../redux/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, currentStaff, isAuthenticated } = useAppSelector((state) => state.staff);
  const location = useLocation();

  console.log('🔒 Protected route check:', { 
    token: !!token, 
    isAuthenticated, 
    staffExists: !!currentStaff 
  });

  if (!token || !isAuthenticated) {
    console.log('⛔ Not authenticated, redirecting to login');
    return <Navigate to="/staff-login" state={{ from: location }} replace />;
  }

  console.log('✅ Access granted');
  return <>{children}</>;
}