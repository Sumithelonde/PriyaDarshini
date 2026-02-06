import React, { useEffect, useState } from 'react';
import { fetchVerifiedUsers, createRequest, fetchMyRequests, fetchConnections } from '../services/requestService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, FileText, Users, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  registration_number?: string;
}

interface Request {
  id: number;
  target_id: number;
  target_name: string;
  status: string;
  created_at?: string;
}

interface Connection {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  role: string;
}

const IndividualDashboard: React.FC = () => {
  const [tab, setTab] = useState('ngo');
  const [ngos, setNgos] = useState<User[]>([]);
  const [lawyers, setLawyers] = useState<User[]>([]);
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const { toast } = useToast();

  // Load myRequests on mount to check for existing requests
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await fetchMyRequests();
        setMyRequests(data.requests || []);
      } catch (error) {
        console.error('Failed to load requests:', error);
      }
    };
    loadRequests();
  }, []);

  const loadData = async () => {
    try {
      if (tab === 'ngo') {
        const data = await fetchVerifiedUsers('ngo');
        setNgos(data.users || []);
      } else if (tab === 'lawyer') {
        const data = await fetchVerifiedUsers('lawyer');
        setLawyers(data.users || []);
      } else if (tab === 'requests') {
        const data = await fetchMyRequests();
        setMyRequests(data.requests || []);
      } else if (tab === 'connections') {
        const data = await fetchConnections();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  const isAlreadyRequested = (targetId: number): string => {
    const request = myRequests.find(req => req.target_id === targetId);
    if (!request) return 'not-requested';
    if (request.status === 'pending') return 'pending';
    if (request.status === 'accepted') return 'connected';
    if (request.status === 'rejected') return 'rejected';
    return 'not-requested';
  };

  const handleRequest = async (targetId: number, targetRole: 'ngo' | 'lawyer') => {
    const status = isAlreadyRequested(targetId);
    
    // Prevent sending request if already connected or request is pending
    if (status === 'pending' || status === 'connected') {
      toast({
        title: "Action Not Allowed",
        description: status === 'connected' ? 'You are already connected.' : 'Request already sent and is pending.',
        variant: "destructive"
      });
      return;
    }

    try {
      await createRequest({ targetId, targetRole });
      toast({
        title: "Request Sent",
        description: `Your connection request has been sent successfully.`,
      });
      // Reload requests
      const data = await fetchMyRequests();
      setMyRequests(data.requests || []);
    } catch (error: any) {
      console.error('Failed to send request:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMsg = error.response?.data?.error || 'Failed to send request. Please try again.';
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
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
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">Individual Dashboard</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'ngo', label: 'NGOs', icon: FileText },
            { key: 'lawyer', label: 'Lawyers', icon: FileText },
            { key: 'requests', label: 'My Requests', icon: FileText },
            { key: 'connections', label: 'Connections', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={tab === key ? 'default' : 'outline'}
              onClick={() => setTab(key)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* NGOs Tab */}
        {tab === 'ngo' && (
          <div>
            {ngos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No verified NGOs available.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ngos.map((ngo) => (
                  <Card key={ngo.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{ngo.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{ngo.email}</span>
                      </div>
                      {ngo.registration_number && (
                        <div className="text-sm">
                          <strong>Reg:</strong> {ngo.registration_number}
                        </div>
                      )}
                      <Button
                        onClick={() => handleRequest(ngo.id, 'ngo')}
                        disabled={isAlreadyRequested(ngo.id) !== 'not-requested'}
                        variant={isAlreadyRequested(ngo.id) === 'connected' ? 'default' : 'default'}
                        className={`w-full ${
                          isAlreadyRequested(ngo.id) === 'connected'
                            ? 'bg-green-600 hover:bg-green-600 cursor-default'
                            : isAlreadyRequested(ngo.id) === 'pending'
                            ? 'bg-yellow-600 hover:bg-yellow-600 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        {isAlreadyRequested(ngo.id) === 'connected'
                          ? '✓ Connected'
                          : isAlreadyRequested(ngo.id) === 'pending'
                          ? 'Request Pending'
                          : 'Connect Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lawyers Tab */}
        {tab === 'lawyer' && (
          <div>
            {lawyers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No verified lawyers available.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {lawyers.map((lawyer) => (
                  <Card key={lawyer.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{lawyer.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{lawyer.email}</span>
                      </div>
                      {lawyer.contact_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{lawyer.contact_number}</span>
                        </div>
                      )}
                      <Button
                        onClick={() => handleRequest(lawyer.id, 'lawyer')}
                        disabled={isAlreadyRequested(lawyer.id) !== 'not-requested'}
                        variant={isAlreadyRequested(lawyer.id) === 'connected' ? 'default' : 'default'}
                        className={`w-full ${
                          isAlreadyRequested(lawyer.id) === 'connected'
                            ? 'bg-green-600 hover:bg-green-600 cursor-default'
                            : isAlreadyRequested(lawyer.id) === 'pending'
                            ? 'bg-yellow-600 hover:bg-yellow-600 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        {isAlreadyRequested(lawyer.id) === 'connected'
                          ? '✓ Connected'
                          : isAlreadyRequested(lawyer.id) === 'pending'
                          ? 'Request Pending'
                          : 'Connect Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <div>
            {myRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No requests yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myRequests.map((req) => (
                  <Card key={req.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-semibold">{req.target_name}</p>
                        {req.created_at && (
                          <p className="text-xs text-muted-foreground">
                            Sent: {new Date(req.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge className={`flex items-center gap-1 ${getStatusColor(req.status)}`}>
                        {getStatusIcon(req.status)}
                        <span className="capitalize">{req.status}</span>
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Connections Tab */}
        {tab === 'connections' && (
          <div>
            {connections.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No connections yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Send connection requests to NGOs and Lawyers to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {connections.map((conn) => (
                  <Card key={conn.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{conn.name}</CardTitle>
                      <Badge className="w-fit bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700">
                        Connected
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{conn.email}</span>
                      </div>
                      {conn.contact_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{conn.contact_number}</span>
                        </div>
                      )}
                      <Badge variant="outline" className="capitalize">
                        {conn.role}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualDashboard;
