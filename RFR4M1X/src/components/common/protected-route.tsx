import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/auth-store';

export const ProtectedRoute = () => {
  const location = useLocation();
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return null;
  }

  if (!sessionUser) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const location = useLocation();
  const profile = useAuthStore((state) => state.profile);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return null;
  }

  if (!profile) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (profile.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};
