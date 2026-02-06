import React, { Suspense } from 'react';
import NGODirectory from '@/components/NGODirectory';

const NGODirectoryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#EEFCEB]">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#284B63] border-t-transparent mb-4"></div>
              <p className="text-[#284B63] font-medium">Loading...</p>
            </div>
          </div>
        </div>
      }>
        <div className="container mx-auto px-4 py-8">
          <NGODirectory />
        </div>
      </Suspense>
    </div>
  );
};

export default NGODirectoryPage;
