import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import UserDashboard from './pages/user/UserDashboard';
import BookAppointmentPage from './pages/user/BookAppointmentPage';
import UserProfilePage from './pages/user/UserProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSlotGenerationPage from './pages/admin/AdminSlotGenerationPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import WebSocketProvider from './components/notifications/WebSocketProvider';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <WebSocketProvider>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute roles={['USER', 'ADMIN']}><UserLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/book-appointment" element={<BookAppointmentPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="generate-slots" element={<AdminSlotGenerationPage />} />
          </Route>
          
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </WebSocketProvider>
    </BrowserRouter>
  );
}

export default App;

