import { Inbox } from 'lucide-react';
const EmptyState = ({ icon: Icon = Inbox, title = 'No data found', message = '', actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <Icon className="h-16 w-16 text-gray-300 mb-4" />
    <h3 className="text-lg font-semibold text-gray-600 mb-1">{title}</h3>
    {message && <p className="text-gray-400 text-sm mb-4 max-w-md">{message}</p>}
    {actionLabel && <button onClick={onAction} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors">{actionLabel}</button>}
  </div>
);
export default EmptyState;

