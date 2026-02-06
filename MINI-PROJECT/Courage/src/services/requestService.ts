import api from './api';

export const fetchAdminStats = () => api.get('/admin/stats').then((res) => res.data);

export const fetchPendingApprovals = () => api.get('/admin/pending').then((res) => res.data);

export const verifyUser = (userId: number, action: 'verified' | 'rejected') =>
  api.post('/admin/verify', { userId, action }).then((res) => res.data);

export const fetchVerifiedUsers = (role: 'ngo' | 'lawyer') =>
  api.get('/users', { params: { role } }).then((res) => res.data);

export const createRequest = (payload: { targetId: number; targetRole: 'ngo' | 'lawyer' }) =>
  api.post('/requests', payload).then((res) => res.data);

export const fetchAssignedRequests = () => api.get('/requests/assigned').then((res) => res.data);

export const fetchMyRequests = () => api.get('/requests/mine').then((res) => res.data);

export const acceptRequest = (requestId: number) =>
  api.put(`/requests/${requestId}`, { status: 'accepted' }).then((res) => res.data);

export const rejectRequest = (requestId: number) =>
  api.put(`/requests/${requestId}`, { status: 'rejected' }).then((res) => res.data);

export const fetchConnections = () => api.get('/requests/connections').then((res) => res.data);
