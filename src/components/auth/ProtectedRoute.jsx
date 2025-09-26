import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRequiredRole = user.roles.some(role => roles.includes(role.replace('ROLE_', '')));

  if (!hasRequiredRole) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;