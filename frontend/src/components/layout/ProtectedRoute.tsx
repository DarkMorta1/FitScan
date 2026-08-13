import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui/skeleton';

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) {
    if (!user.onboardingComplete && user.role !== 'admin') return <Navigate to="/onboarding" replace />;
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return <Outlet />;
}

export function OnboardingRoute() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingComplete || user.role === 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
