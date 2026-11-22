import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Protected Route
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import GarageOwnerLayout from './layouts/GarageOwnerLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import GarageManagement from './pages/admin/GarageManagement';
import GarageDetail from './pages/admin/GarageDetail';
import GarageOwnerManagement from './pages/admin/GarageOwnerManagement';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';
import ActivityLogs from './pages/admin/ActivityLogs';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';

// Garage Owner Pages
import GarageOverview from './pages/garage-owner/GarageOverview';
import CustomerList from './pages/garage-owner/CustomerList';
import CustomerForm from './pages/garage-owner/CustomerForm';
import CustomerDetail from './pages/garage-owner/CustomerDetail';
import VehicleList from './pages/garage-owner/VehicleList';
import VehicleForm from './pages/garage-owner/VehicleForm';
import VehicleDetail from './pages/garage-owner/VehicleDetail';
import ServiceList from './pages/garage-owner/ServiceList';
import JobCardList from './pages/garage-owner/JobCardList';
import JobCardForm from './pages/garage-owner/JobCardForm';
import JobCardDetail from './pages/garage-owner/JobCardDetail';
import EmployeeList from './pages/garage-owner/EmployeeList';
import EmployeeForm from './pages/garage-owner/EmployeeForm';
import AppointmentList from './pages/garage-owner/AppointmentList';
import InvoiceList from './pages/garage-owner/InvoiceList';
import InvoiceDetail from './pages/garage-owner/InvoiceDetail';
import PaymentList from './pages/garage-owner/PaymentList';
import Reports from './pages/garage-owner/Reports';
import GarageProfile from './pages/garage-owner/GarageProfile';
import GarageSettings from './pages/garage-owner/GarageSettings';

// Root redirect component
function RootRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/overview" replace />;
  }

  if (user.role === 'GARAGE_OWNER') {
    return <Navigate to="/garage/overview" replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Root Redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="garages" element={<GarageManagement />} />
        <Route path="garages/:id" element={<GarageDetail />} />
        <Route path="owners" element={<GarageOwnerManagement />} />
        <Route path="analytics" element={<PlatformAnalytics />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Garage Owner Routes */}
      <Route
        path="/garage"
        element={
          <ProtectedRoute role="GARAGE_OWNER">
            <GarageOwnerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<GarageOverview />} />

        {/* Customers */}
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/new" element={<CustomerForm />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="customers/:id/edit" element={<CustomerForm />} />

        {/* Vehicles */}
        <Route path="vehicles" element={<VehicleList />} />
        <Route path="vehicles/new" element={<VehicleForm />} />
        <Route path="vehicles/:id" element={<VehicleDetail />} />
        <Route path="vehicles/:id/edit" element={<VehicleForm />} />

        {/* Services */}
        <Route path="services" element={<ServiceList />} />

        {/* Job Cards */}
        <Route path="job-cards" element={<JobCardList />} />
        <Route path="job-cards/new" element={<JobCardForm />} />
        <Route path="job-cards/:id" element={<JobCardDetail />} />

        {/* Employees */}
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/new" element={<EmployeeForm />} />
        <Route path="employees/:id/edit" element={<EmployeeForm />} />

        {/* Appointments */}
        <Route path="appointments" element={<AppointmentList />} />

        {/* Invoices */}
        <Route path="invoices" element={<InvoiceList />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />

        {/* Payments */}
        <Route path="payments" element={<PaymentList />} />

        {/* Reports */}
        <Route path="reports" element={<Reports />} />

        {/* Profile & Settings */}
        <Route path="profile" element={<GarageProfile />} />
        <Route path="settings" element={<GarageSettings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
