import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircle2, LogOut, Users, Shield, Scale, Clock, CheckCircle, AlertCircle, TrendingUp, Activity, FileText } from 'lucide-react';
import { fetchAdminStats, fetchPendingApprovals } from '../services/requestService';
import { getUser, signOut } from '../utils/authStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({ totalUsers: 0, verifiedNgos: 0, verifiedLawyers: 0, individuals: 0 });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const user = getUser();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      signOut();
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [statsData, pendingData] = await Promise.all([
          fetchAdminStats(),
          fetchPendingApprovals()
        ]);
        setStats(statsData);
        setPendingRequests(pendingData?.requests || []);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, user]);

  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Manage Users':
        toast({
          title: "Coming Soon",
          description: "User management feature is under development.",
        });
        break;
      case 'Verify NGOs':
      case 'Verify Lawyers':
        navigate('/admin/requests');
        break;
      case 'View Cases':
        toast({
          title: "Coming Soon",
          description: "Cases view feature is under development.",
        });
        break;
      case 'Analytics':
        toast({
          title: "Coming Soon",
          description: "Analytics dashboard is under development.",
        });
        break;
      case 'System Alerts':
        toast({
          title: "System Alerts",
          description: "3 alerts: Check email service status and 2 pending verifications.",
          variant: "default",
        });
        break;
      case 'Reports':
        toast({
          title: "Coming Soon",
          description: "Reports feature is under development.",
        });
        break;
      case 'Audit Logs':
        toast({
          title: "Coming Soon",
          description: "Audit logs feature is under development.",
        });
        break;
      default:
        // Unknown action
    }
  };

  const handleStatClick = (label: string, value: number) => {
    if (value > 0) {
      if (label === 'Pending Verifications') {
        navigate('/admin/requests');
      }
    }
  };

  const handleActivityClick = (activity: any) => {
    if (activity.type === 'pending') {
      navigate('/admin/requests');
    } else {
      toast({
        title: activity.action,
        description: `Details for ${activity.name}`,
      });
    }
  };

  // Calculate real-time metrics from actual data
  const pendingCount = pendingRequests.length;
  const todayApproved = pendingRequests.filter(req => 
    req.status === 'verified' && 
    new Date(req.updated_at || req.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Profile */}
      <div className="sticky top-0 z-50 border-b border-border backdrop-blur-md bg-background/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h2>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-foreground shadow-sm hover:bg-accent transition flex-shrink-0"
              >
                <UserCircle2 className="h-6 w-6" />
                <span className="text-sm font-medium">Admin</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-popover/80 text-popover-foreground backdrop-blur-xl shadow-2xl z-50">
                  <div className="px-4 py-3 border-b border-border text-sm">
                    <p className="font-semibold">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || 'admin@legislate.ai'}</p>
                    <p className="text-xs text-muted-foreground">Role: {user?.role || 'admin'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Total Users', value: stats.totalUsers, clickable: false },
            { label: 'Verified NGOs', value: stats.verifiedNgos, clickable: true, route: '/admin/requests' },
            { label: 'Verified Lawyers', value: stats.verifiedLawyers, clickable: true, route: '/admin/requests' },
            { label: 'Individuals', value: stats.individuals, clickable: false },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => item.clickable && item.route && navigate(item.route)}
              disabled={!item.clickable}
              title={item.clickable ? 'Click to view details' : undefined}
              className={`rounded-2xl border border-border bg-card/70 p-4 sm:p-6 backdrop-blur-xl shadow-legal transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:bg-card/80 active:scale-[0.99] text-left ${
                item.clickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</div>
              <div className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold text-foreground">{item.value}</div>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <Link to="/admin/requests" className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg border border-border hover:bg-accent transition font-medium text-sm sm:text-base">
            View Pending Requests
          </Link>
          <Link to="/admin/create" className="bg-card text-foreground px-4 py-2 rounded-lg border border-border hover:bg-accent transition font-medium text-sm sm:text-base">
            Create Admin
          </Link>
        </div>

        {/* Recent Activity & System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-2xl shadow-lg supports-[backdrop-filter]:bg-card/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No recent activity
                </div>
              ) : pendingRequests.slice(0, 5).map((request, idx) => {
                const isNGO = request.role === 'ngo';
                const isLawyer = request.role === 'lawyer';
                const isPending = request.status === 'pending';
                const isVerified = request.status === 'verified';
                const isRejected = request.status === 'rejected';
                
                return (
                  <button
                    key={request.id || idx}
                    onClick={() => isPending && navigate('/admin/requests')}
                    className="w-full flex items-start gap-3 p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50 hover:bg-muted/40 transition-colors text-left"
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isVerified ? 'bg-green-100/50 dark:bg-green-900/30' :
                      isPending ? 'bg-yellow-100/50 dark:bg-yellow-900/30' :
                      isRejected ? 'bg-red-100/50 dark:bg-red-900/30' :
                      'bg-blue-100/50 dark:bg-blue-900/30'
                    }`}>
                      {isNGO ? (
                        <Shield className={`h-4 w-4 ${
                          isVerified ? 'text-green-600 dark:text-green-400' :
                          isPending ? 'text-yellow-600 dark:text-yellow-400' :
                          isRejected ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`} />
                      ) : isLawyer ? (
                        <Scale className={`h-4 w-4 ${
                          isVerified ? 'text-green-600 dark:text-green-400' :
                          isPending ? 'text-yellow-600 dark:text-yellow-400' :
                          isRejected ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`} />
                      ) : (
                        <Users className={`h-4 w-4 ${
                          isVerified ? 'text-green-600 dark:text-green-400' :
                          isPending ? 'text-yellow-600 dark:text-yellow-400' :
                          isRejected ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {isNGO ? 'NGO' : isLawyer ? 'Lawyer' : 'User'} {isPending ? 'verification request' : isVerified ? 'verified' : 'verification rejected'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{request.name || request.email || 'Unknown'}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {request.created_at ? new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* System Overview */}
          <Card className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-2xl shadow-lg supports-[backdrop-filter]:bg-card/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Pending Verifications', value: pendingCount.toString(), icon: Clock, color: 'yellow', clickable: true },
                  { label: 'Total Requests', value: pendingRequests.length.toString(), icon: FileText, color: 'blue', clickable: false },
                  { label: 'Approved Today', value: todayApproved.toString(), icon: CheckCircle, color: 'green', clickable: false },
                  { label: 'Verified Users', value: (stats.verifiedNgos + stats.verifiedLawyers).toString(), icon: AlertCircle, color: 'purple', clickable: true },
                ].map((stat) => (
                  <button
                    key={stat.label}
                    onClick={() => stat.clickable && handleStatClick(stat.label, parseInt(stat.value))}
                    disabled={!stat.clickable}
                    className={`p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50 hover:-translate-y-0.5 transition-all text-left ${
                      stat.clickable ? 'cursor-pointer hover:bg-muted/40' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <stat.icon className={`h-4 w-4 ${
                        stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                        stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        stat.color === 'red' ? 'text-red-600 dark:text-red-400' :
                        stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`} />
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </button>
                ))}
              </div>

              {/* User Distribution */}
              <div className="space-y-2 pt-2">
                <p className="text-sm font-semibold text-foreground mb-2">User Distribution</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-foreground">NGOs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{stats.verifiedNgos}</span>
                      <Badge variant="default" className="text-xs">Verified</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-foreground">Lawyers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{stats.verifiedLawyers}</span>
                      <Badge variant="default" className="text-xs">Verified</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-foreground">Individuals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{stats.individuals}</span>
                      <Badge variant="outline" className="text-xs">Active</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <Card className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-2xl shadow-lg supports-[backdrop-filter]:bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { icon: Users, label: 'Manage Users', color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400', route: null },
                { icon: Shield, label: 'Verify NGOs', color: 'bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400', route: '/admin/requests' },
                { icon: Scale, label: 'Verify Lawyers', color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400', route: '/admin/requests' },
                { icon: FileText, label: 'View Cases', color: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400', route: null },
                { icon: Activity, label: 'Analytics', color: 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400', route: null },
                { icon: AlertCircle, label: 'System Alerts', color: 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400', route: null },
                { icon: TrendingUp, label: 'Reports', color: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400', route: null },
                { icon: Clock, label: 'Audit Logs', color: 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 dark:text-gray-400', route: null },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => action.route ? navigate(action.route) : handleQuickAction(action.label)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 transition-all duration-200 hover:-translate-y-1 active:scale-95 ${action.color}`}
                >
                  <action.icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
