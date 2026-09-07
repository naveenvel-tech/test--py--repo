import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import ClinicalExchange from './pages/ClinicalExchange';
import Providers from './pages/Providers';
import AuditLogs from './pages/AuditLogs';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppLayout = ({ children }) => {
  return (
    <SocketProvider>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          {children}
        </div>
      </div>
    </SocketProvider>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Patients />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Appointments />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/exchanges"
        element={
          <ProtectedRoute roles={['admin', 'doctor', 'nurse', 'lab_technician']}>
            <AppLayout>
              <ClinicalExchange />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/providers"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Providers />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout>
              <AuditLogs />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
