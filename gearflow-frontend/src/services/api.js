import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getCurrentUser = () => API.get('/auth/me');

// Admin APIs
export const getAdminDashboard = () => API.get('/admin/dashboard');
export const getGarages = (params) => API.get('/admin/garages', { params });
export const getGarageById = (id) => API.get(`/admin/garages/${id}`);
export const createGarage = (data) => API.post('/admin/garages', data);
export const updateGarage = (id, data) => API.put(`/admin/garages/${id}`, data);
export const updateGarageStatus = (id, status) => API.patch(`/admin/garages/${id}/status`, { status });
export const getOwners = () => API.get('/admin/owners');
export const getOwnerById = (id) => API.get(`/admin/owners/${id}`);
export const updateOwnerStatus = (id, active) => API.patch(`/admin/owners/${id}/status`, { active });
export const getAdminAnalytics = () => API.get('/admin/analytics');
export const getActivityLogs = () => API.get('/admin/activity-logs');

// Garage Owner APIs
export const getGarageDashboard = () => API.get('/garage/dashboard');
export const getCustomers = (params) => API.get('/garage/customers', { params });
export const getCustomerById = (id) => API.get(`/garage/customers/${id}`);
export const createCustomer = (data) => API.post('/garage/customers', data);
export const updateCustomer = (id, data) => API.put(`/garage/customers/${id}`, data);
export const deleteCustomer = (id) => API.delete(`/garage/customers/${id}`);
export const searchCustomers = (q) => API.get('/garage/customers/search', { params: { q } });

export const getVehicles = (params) => API.get('/garage/vehicles', { params });
export const getVehicleById = (id) => API.get(`/garage/vehicles/${id}`);
export const createVehicle = (data) => API.post('/garage/vehicles', data);
export const updateVehicle = (id, data) => API.put(`/garage/vehicles/${id}`, data);
export const deleteVehicle = (id) => API.delete(`/garage/vehicles/${id}`);
export const getVehiclesByCustomer = (customerId) => API.get(`/garage/vehicles/customer/${customerId}`);

export const getServices = () => API.get('/garage/services');
export const createService = (data) => API.post('/garage/services', data);
export const updateService = (id, data) => API.put(`/garage/services/${id}`, data);
export const toggleServiceStatus = (id) => API.patch(`/garage/services/${id}/toggle`);

export const getEmployees = () => API.get('/garage/employees');
export const getEmployeeById = (id) => API.get(`/garage/employees/${id}`);
export const createEmployee = (data) => API.post('/garage/employees', data);
export const updateEmployee = (id, data) => API.put(`/garage/employees/${id}`, data);
export const toggleEmployeeStatus = (id) => API.patch(`/garage/employees/${id}/toggle`);

export const getJobCards = (params) => API.get('/garage/job-cards', { params });
export const getJobCardById = (id) => API.get(`/garage/job-cards/${id}`);
export const createJobCard = (data) => API.post('/garage/job-cards', data);
export const updateJobCard = (id, data) => API.put(`/garage/job-cards/${id}`, data);
export const updateJobCardStatus = (id, status) => API.patch(`/garage/job-cards/${id}/status`, { status });

export const getInvoices = (params) => API.get('/garage/invoices', { params });
export const getInvoiceById = (id) => API.get(`/garage/invoices/${id}`);
export const generateInvoice = (jobCardId, data) => API.post(`/garage/invoices/generate/${jobCardId}`, data);

export const getPayments = (params) => API.get('/garage/payments', { params });
export const recordPayment = (data) => API.post('/garage/payments', data);
export const getPaymentsByInvoice = (invoiceId) => API.get(`/garage/payments/invoice/${invoiceId}`);

export const getAppointments = (params) => API.get('/garage/appointments', { params });
export const createAppointment = (data) => API.post('/garage/appointments', data);
export const updateAppointment = (id, data) => API.put(`/garage/appointments/${id}`, data);
export const updateAppointmentStatus = (id, status) => API.patch(`/garage/appointments/${id}/status`, { status });
export const getTodayAppointments = () => API.get('/garage/appointments/today');

export const getRevenueReport = (period) => API.get('/garage/reports/revenue', { params: { period } });
export const getServiceReport = () => API.get('/garage/reports/services');
export const getPaymentReport = (status) => API.get('/garage/reports/payments', { params: { status } });
export const getEmployeeReport = () => API.get('/garage/reports/employees');

export const getProfile = () => API.get('/profile');
export const updateProfile = (data) => API.put('/profile', data);
export const changePassword = (data) => API.put('/profile/change-password', data);
export const updateGarageProfile = (data) => API.put('/profile/garage', data);

export default API;
