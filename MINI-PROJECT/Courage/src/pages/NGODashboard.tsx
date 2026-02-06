import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCircle2, LogOut, FileText, Phone, Mail, Clock, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { fetchAssignedRequests, acceptRequest, rejectRequest, fetchConnections } from '../services/requestService';
import { getMe } from '@/services/authService';
import { getUser, signOut } from '@/utils/authStorage';
import { useNavigate } from 'react-router-dom';

interface Request {
  id: number;
  requester_name: string;
  requester_contact?: string;
  requester_email?: string;
  requester_uid?: string;
  requester_role?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at?: string;
  description?: string;
}

interface Connection {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  role: string;
  uid?: string;
  registration_number?: string;
  enrollment_number?: string;
  created_at?: string;
}

const NGODashboard: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'connections'>('requests');
  const [profileOpen, setProfileOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string; role?: string } | null>(getUser());
  const [loadingUser, setLoadingUser] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [requestsData, connectionsData] = await Promise.all([
          fetchAssignedRequests(),
          fetchConnections()
        ]);
        if (active) {
          setRequests(requestsData?.requests || []);
          setConnections(connectionsData?.connections || []);
        }
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        if (active) {
          setRequests([]);
          setConnections([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const response = await getMe();
        if (active) {
          setUserInfo(response?.user ?? getUser());
        }
      } catch {
        if (active) {
          setUserInfo(getUser());
        }
      } finally {
        if (active) setLoadingUser(false);
      }
    };

    fetchUser();

    return () => {
      active = false;
    };
  }, []);

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

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await acceptRequest(requestId);
      // Refresh requests
      const [requestsData, connectionsData] = await Promise.all([
        fetchAssignedRequests(),
        fetchConnections()
      ]);
      setRequests(requestsData?.requests || []);
      setConnections(connectionsData?.connections || []);
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await rejectRequest(requestId);
      // Refresh requests
      const requestsData = await fetchAssignedRequests();
      setRequests(requestsData?.requests || []);
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'accepted':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 h-96 w-96 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Sticky Header with Enhanced Glassmorphism */}
      <div className="sticky top-0 z-40 border-b border-border/50 backdrop-blur-2xl bg-background/40 supports-[backdrop-filter]:bg-background/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md flex items-center justify-center bg-primary text-primary-foreground shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">NGO Dashboard</h1>
            </div>
            
            {/* Profile Dropdown */}
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-xl px-3 py-2 text-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-card/70 active:scale-95 transition-all duration-200"
                aria-label="Open profile menu"
              >
                <UserCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline">Profile</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 supports-[backdrop-filter]:bg-card/40">
                  {/* Profile Header */}
                  <div className="px-4 py-4 border-b border-border/50 bg-muted/20 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-foreground">NGO Profile</p>
                    {loadingUser ? (
                      <p className="text-xs text-muted-foreground mt-2">Loading...</p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
                          <p className="text-sm font-semibold text-foreground">{userInfo?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                          <p className="text-sm text-muted-foreground break-all">{userInfo?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Role</p>
                          <Badge className="mt-1 bg-primary text-primary-foreground">{userInfo?.role || 'NGO'}</Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-all duration-150"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 supports-[backdrop-filter]:bg-card/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-foreground mt-2">{requests.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/20 dark:bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 supports-[backdrop-filter]:bg-card/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{pendingCount}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-200/30 dark:bg-yellow-900/30 backdrop-blur-sm flex items-center justify-center border border-yellow-300/50 dark:border-yellow-700/50">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Requests Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2">Connection Requests</h2>
            <p className="text-sm text-muted-foreground">Manage incoming connection requests from individuals</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'requests' ? 'default' : 'outline'}
              onClick={() => setActiveTab('requests')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Requests ({requests.length})
            </Button>
            <Button
              variant={activeTab === 'connections' ? 'default' : 'outline'}
              onClick={() => setActiveTab('connections')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Connections ({connections.length})
            </Button>
          </div>

          {loading ? (
            <Card className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-2xl shadow-lg supports-[backdrop-filter]:bg-card/30">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </CardContent>
            </Card>
          ) : activeTab === 'requests' ? (
            requests.length === 0 ? (
              <Card className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-2xl shadow-lg supports-[backdrop-filter]:bg-card/30">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-16 w-16 rounded-full bg-primary/20 dark:bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-4 border border-primary/30">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Requests Yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    You don't have any connection requests at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <Card
                  key={req.id}
                  className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 active:translate-y-0 transition-all duration-300 overflow-hidden group supports-[backdrop-filter]:bg-card/30"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg text-foreground">
                            {req.requester_name}
                          </CardTitle>
                          <Badge
                            className={`flex items-center gap-1 border ${getStatusColor(req.status)}`}
                          >
                            {getStatusIcon(req.status)}
                            <span className="capitalize text-xs font-semibold">{req.status}</span>
                          </Badge>
                        </div>
                        {req.created_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {new Date(req.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {req.description && (
                      <div className="p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50">
                        <p className="text-sm text-foreground">{req.description}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Individual Details</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {req.requester_contact && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50 group-hover:bg-muted/40 transition-colors">
                            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground break-all">{req.requester_contact}</span>
                          </div>
                        )}
                        {req.requester_email && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50 group-hover:bg-muted/40 transition-colors">
                            <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground truncate">{req.requester_email}</span>
                          </div>
                        )}
                      </div>
                      {req.requester_uid && (
                        <div className="p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50">
                          <p className="text-xs text-muted-foreground">UID</p>
                          <p className="text-sm text-foreground font-medium">{req.requester_uid}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {req.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(req.id)}
                          className="flex-1 bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectRequest(req.id)}
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950 active:scale-95 transition-all duration-200"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )
          ) : (
            // Connections Tab
            connections.length === 0 ? (
              <Card className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-2xl shadow-lg supports-[backdrop-filter]:bg-card/30">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-16 w-16 rounded-full bg-primary/20 dark:bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-4 border border-primary/30">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Connections Yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Accept connection requests to see individuals here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {connections.map((conn) => (
                  <Card
                    key={conn.id}
                    className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 active:translate-y-0 transition-all duration-300 overflow-hidden group supports-[backdrop-filter]:bg-card/30"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-foreground">{conn.name}</CardTitle>
                          <Badge className="mt-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700">
                            Connected
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {conn.contact_number && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50 group-hover:bg-muted/40 transition-colors">
                              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-sm text-foreground break-all">{conn.contact_number}</span>
                            </div>
                          )}
                          {conn.email && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50 group-hover:bg-muted/40 transition-colors">
                              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-sm text-foreground truncate">{conn.email}</span>
                            </div>
                          )}
                        </div>
                        {conn.uid && (
                          <div className="p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50">
                            <p className="text-xs text-muted-foreground">Individual UID</p>
                            <p className="text-sm text-foreground font-medium">{conn.uid}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
