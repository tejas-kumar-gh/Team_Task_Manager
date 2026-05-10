import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requireAdmin }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)]">
        <div className="loading-spinner mb-4"></div>
        <p className="text-sm opacity-60">Loading TeamSync...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && user.role !== 'Admin') return <Navigate to="/" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
