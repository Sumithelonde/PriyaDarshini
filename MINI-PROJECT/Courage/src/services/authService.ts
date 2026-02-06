import api from './api';
import { signOut } from '../utils/authStorage';

/**
 * Setup TOTP for admin authentication
 */
export const adminSetupTotp = (uid: string, password: string) =>
  api.post('/auth/admin/setup-totp', { uid, password }).then((res) => res.data);

/**
 * Admin login with OTP
 */
export const adminLogin = (adminname: string, password: string, otp?: string) =>
  api.post('/auth/admin/login', { adminname, password, otp }).then((res) => res.data);

/**
 * Get current user info and validate token
 * If token is invalid, will trigger API interceptor logout
 */
export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token invalid or expired
      signOut();
      throw new Error('Session expired. Please log in again.');
    }
    throw error;
  }
};

export const adminCreate = (payload: { adminname: string; uid: string; email: string; password: string }) =>
  api.post('/auth/admin/create', payload).then((res) => res.data);

export const registerNgo = (payload: { registrationNumber: string; name: string; email: string }) =>
  api.post('/auth/ngo/register', payload).then((res) => res.data);

export const registerLawyer = (payload: { name: string; enrollmentNumber: string; email: string; contactNumber: string }) =>
  api.post('/auth/lawyer/register', payload).then((res) => res.data);

export const registerIndividual = (payload: { name: string; contactNumber: string; password: string }) =>
  api.post('/auth/individual/register', payload).then((res) => res.data);

export const loginNgo = (payload: { registrationNumber: string; otp: string }) =>
  api.post('/auth/ngo/login', payload).then((res) => res.data);

export const loginLawyer = (payload: { contactNumber: string; otp: string }) =>
  api.post('/auth/lawyer/login', payload).then((res) => res.data);

export const loginIndividual = (payload: { name: string; password: string }) =>
  api.post('/auth/individual/login', payload).then((res) => res.data);
