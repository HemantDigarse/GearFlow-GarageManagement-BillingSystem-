const colors = {
  ACTIVE: 'bg-green-100 text-green-700', COMPLETED: 'bg-green-100 text-green-700', PAID: 'bg-green-100 text-green-700', SUCCESS: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700', SCHEDULED: 'bg-yellow-100 text-yellow-700', PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700',
  INACTIVE: 'bg-red-100 text-red-700', CANCELLED: 'bg-red-100 text-red-700', UNPAID: 'bg-red-100 text-red-700', FAILED: 'bg-red-100 text-red-700', REFUNDED: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  ON_HOLD: 'bg-gray-100 text-gray-700', NO_SHOW: 'bg-gray-100 text-gray-700',
  CREATED: 'bg-indigo-100 text-indigo-700',
  LOW: 'bg-gray-100 text-gray-600', MEDIUM: 'bg-blue-100 text-blue-600', HIGH: 'bg-orange-100 text-orange-600', URGENT: 'bg-red-100 text-red-600',
};
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
    {status?.replace(/_/g, ' ')}
  </span>
);
export default StatusBadge;

