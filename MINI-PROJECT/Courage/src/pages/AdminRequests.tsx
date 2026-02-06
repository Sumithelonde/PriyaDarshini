import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { fetchPendingApprovals, verifyUser } from '../services/requestService';
import { getUser } from '../utils/authStorage';

const AdminRequests: React.FC = () => {
  const navigate = useNavigate();
  const [ngos, setNgos] = useState([] as any[]);
  const [lawyers, setLawyers] = useState([] as any[]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Authentication guard
  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPendingApprovals();
      setNgos(data.ngos || []);
      setLawyers(data.lawyers || []);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (userId: number, action: 'verified' | 'rejected') => {
    try {
      setLoadingId(userId);
      await verifyUser(userId, action);
      await loadData();
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const EmptyState = ({ type }: { type: string }) => (
    <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 backdrop-blur-xl text-center shadow-legal">
      <div className="flex justify-center mb-4">
        <Clock className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground" />
      </div>
      <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">No Pending {type} Requests</h4>
      <p className="text-xs sm:text-sm text-muted-foreground">All pending approvals have been processed. New requests will appear here.</p>
    </div>
  );

  const RequestCard = ({ item, type }: { item: any; type: 'ngo' | 'lawyer' }) => (
    <div className="group rounded-2xl border border-border bg-card/70 p-4 sm:p-6 backdrop-blur-xl shadow-legal transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:-translate-y-1">
      {/* Header with status indicator */}
      <div className="flex items-start justify-between mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-border/60">
        <div className="flex-1 min-w-0">
          <h4 className="text-base sm:text-lg font-semibold text-foreground mb-1 truncate">{item.name}</h4>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 flex-shrink-0" />
            <span className="text-xs font-medium text-amber-300">Pending Review</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
        <div className="flex items-start gap-2 sm:gap-3">
          <span className="text-xs uppercase tracking-widest text-muted-foreground min-w-[80px] sm:min-w-[100px] flex-shrink-0">
            {type === 'ngo' ? 'Registration' : 'Enrollment'}
          </span>
          <span className="text-xs sm:text-sm text-foreground font-medium break-all">
            {type === 'ngo' ? item.registration_number : item.enrollment_number}
          </span>
        </div>
        <div className="flex items-start gap-2 sm:gap-3">
          <span className="text-xs uppercase tracking-widest text-muted-foreground min-w-[80px] sm:min-w-[100px] flex-shrink-0">Email</span>
          <span className="text-xs sm:text-sm text-foreground font-medium break-all">{item.email}</span>
        </div>
        {type === 'lawyer' && (
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground min-w-[80px] sm:min-w-[100px] flex-shrink-0">Contact</span>
            <span className="text-xs sm:text-sm text-foreground font-medium">{item.contact_number}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border/60">
        <button
          onClick={() => handleAction(item.id, 'verified')}
          disabled={loadingId === item.id}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">{loadingId === item.id ? 'Processing...' : 'Approve'}</span>
          <span className="sm:hidden">{loadingId === item.id ? '...' : 'Approve'}</span>
        </button>
        <button
          onClick={() => handleAction(item.id, 'rejected')}
          disabled={loadingId === item.id}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-red-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XCircle className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">{loadingId === item.id ? 'Processing...' : 'Reject'}</span>
          <span className="sm:hidden">{loadingId === item.id ? '...' : 'Reject'}</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-card/70 backdrop-blur-xl mb-4 shadow-legal">
            <div className="h-8 w-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 flex items-start justify-center">
      <div className="w-full max-w-2xl lg:max-w-4xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Pending Approvals</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Review and approve pending NGO and Lawyer registrations</p>
        </div>

        {/* Total Pending Count */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-xl border border-border bg-card/60 p-3 sm:p-4 backdrop-blur-xl text-center shadow-legal">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">NGO Requests</div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{ngos.length}</div>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-3 sm:p-4 backdrop-blur-xl text-center shadow-legal">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Lawyer Requests</div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{lawyers.length}</div>
          </div>
        </div>

        {/* NGO Requests Section */}
        <section className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">NGO Requests</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Organizations awaiting verification</p>
          </div>
          {ngos.length === 0 ? (
            <EmptyState type="NGO" />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {ngos.map((ngo) => (
                <RequestCard key={ngo.id} item={ngo} type="ngo" />
              ))}
            </div>
          )}
        </section>

        {/* Lawyer Requests Section */}
        <section className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Lawyer Requests</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Legal professionals awaiting verification</p>
          </div>
          {lawyers.length === 0 ? (
            <EmptyState type="Lawyer" />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {lawyers.map((lawyer) => (
                <RequestCard key={lawyer.id} item={lawyer} type="lawyer" />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminRequests;
