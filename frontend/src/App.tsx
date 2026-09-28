import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { Teams } from './pages/Teams';
import { TeamDetails } from './pages/TeamDetails';
import { MemberDetails } from './pages/MemberDetails';
import { Tasks } from './pages/Tasks';
import { Attendance } from './pages/Attendance';
import { Announcements } from './pages/Announcements';
import { LeaveRequests } from './pages/LeaveRequests';
import { UserManagement } from './pages/UserManagement';
import { Profile } from './pages/Profile';
import { NotFound, Unauthorized } from './pages/NotFound';

// Guard component for Admin only routes
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAdmin) {
    return <Navigate to="/403" replace />;
  }
  return <>{children}</>;
};

// Root index redirect based on role
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/403" element={<Unauthorized />} />
          <Route path="/404" element={<NotFound />} />

          {/* Authenticated Workspace routes */}
          <Route element={<AppLayout />}>
            <Route index element={<RootRedirect />} />

            {/* Dashboard routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="/dashboard" element={<UserDashboard />} />

            {/* Teams & Members */}
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:id" element={<TeamDetails />} />
            <Route path="/members/:id" element={<MemberDetails />} />

            {/* Tasks */}
            <Route path="/tasks" element={<Tasks />} />

            {/* Attendance */}
            <Route path="/attendance" element={<Attendance />} />

            {/* Announcements */}
            <Route path="/announcements" element={<Announcements />} />

            {/* Leave Management */}
            <Route path="/leaves" element={<LeaveRequests />} />

            {/* Admin User Management */}
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              }
            />

            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
