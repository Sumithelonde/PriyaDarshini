import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error?: Error;
  componentName?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, componentName = 'Component' }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#EEFCEB] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-8 w-8 text-orange-500" />
          <h2 className="text-xl font-semibold text-[#153243]">Unable to Load</h2>
        </div>
        
        <p className="text-[#284B63] mb-6">
          The {componentName} feature encountered an issue. This usually resolves on refresh.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 p-3 bg-gray-100 rounded text-xs text-gray-700">
            <summary className="cursor-pointer font-semibold">Error Details</summary>
            <pre className="mt-2 overflow-auto">{error.message}</pre>
          </details>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => window.location.reload()}
            className="flex-1 bg-[#153243] hover:bg-[#284B63]"
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/home')}
            className="flex-1"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
