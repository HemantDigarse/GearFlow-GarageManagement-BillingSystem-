import { AlertTriangle } from 'lucide-react';
const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <AlertTriangle className="h-16 w-16 text-red-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-700 mb-1">Error</h3>
    <p className="text-gray-500 text-sm mb-4">{message}</p>
    {onRetry && <button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors">Try Again</button>}
  </div>
);
export default ErrorState;

