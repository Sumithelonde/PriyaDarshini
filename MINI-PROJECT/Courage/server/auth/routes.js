import express from 'express';
import { hashPassword, verifyPassword, generateTotpSecret, verifyTotp, signJwt } from './auth.js';
import {
  createUser,
  findUserByRoleIdentifier,
  getCounts,
  getUsersByRoleStatus,
  updateUserStatus,
  createRequest,
  getRequestsForTarget,
  getRequestsForRequester,
  getVerifiedUsers,
  updateUserTotp,
  ensureDefaultAdminTotp,
  updateRequestStatus,
  getAcceptedConnections,
} from './db.js';
import { requireAuth, requireRole, requireVerified } from './middleware.js';

const router = express.Router();

const sanitizeUser = (user) => ({
  id: user.id,
  role: user.role,
  status: user.status,
  name: user.name,
  adminname: user.adminname,
  uid: user.uid,
  email: user.email,
  registrationNumber: user.registration_number,
  enrollmentNumber: user.enrollment_number,
  contactNumber: user.contact_number,
});

router.get('/auth/me', requireAuth, (req, res) => {
  return res.status(200).json({ user: sanitizeUser(req.user) });
});

router.post('/auth/admin/setup-totp', async (req, res) => {
  try {
    const { uid, password } = req.body;

    if (!uid || !password) {
      return res.status(400).json({ error: 'uid and password are required' });
    }

    const admin = await findUserByRoleIdentifier('admin', 'admin');

    if (!admin || admin.uid !== uid) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (admin.totp_secret) {
      return res.status(400).json({ error: 'Admin TOTP already configured' });
    }

    const totp = await ensureDefaultAdminTotp();
    return res.status(200).json({ message: 'TOTP configured', ...totp });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/auth/admin/login', async (req, res) => {
  try {
    const { adminname, password, otp } = req.body;

    if (!adminname || !password) {
      return res.status(400).json({ error: 'adminname and password are required' });
    }

    const admin = await findUserByRoleIdentifier('admin', adminname);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If admin has TOTP configured, verify it
    if (admin.totp_secret) {
      if (!otp) {
        return res.status(400).json({ error: 'OTP required' });
      }
      const totpOk = verifyTotp(otp, admin.totp_secret);
      if (!totpOk) {
        return res.status(401).json({ error: 'Invalid OTP' });
      }
    }

    const token = signJwt({ userId: admin.id, role: admin.role, status: admin.status });
    return res.status(200).json({ token, user: sanitizeUser(admin) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/auth/admin/create', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { adminname, uid, email, password } = req.body;

    if (!adminname || !uid || !email || !password) {
      return res.status(400).json({ error: 'adminname, uid, email, password are required' });
    }

    const passwordHash = await hashPassword(password);
    const totp = await generateTotpSecret(`Legislate AI Admin (${adminname})`);

    const user = await createUser({
      role: 'admin',
      status: 'verified',
      name: adminname,
      adminname,
      uid,
      email,
      password_hash: passwordHash,
      totp_secret: totp.base32,
      registration_number: null,
      enrollment_number: null,
      contact_number: null,
    });

    return res.status(201).json({ user: sanitizeUser(user), totp });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/auth/ngo/register', async (req, res) => {
  try {
    const { registrationNumber, name, email } = req.body;

    if (!registrationNumber || !name || !email) {
      return res.status(400).json({ error: 'registrationNumber, name, and email are required' });
    }

    const totp = await generateTotpSecret(`NGO ${name}`);
    const user = await createUser({
      role: 'ngo',
      status: 'pending',
      name,
      adminname: null,
      uid: null,
      email,
      password_hash: null,
      totp_secret: totp.base32,
      registration_number: registrationNumber,
      enrollment_number: null,
      contact_number: null,
    });

    return res.status(201).json({ user: sanitizeUser(user), totp });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/auth/lawyer/register', async (req, res) => {
  try {
    const { name, enrollmentNumber, email, contactNumber } = req.body;

    if (!name || !enrollmentNumber || !email || !contactNumber) {
      return res.status(400).json({ error: 'name, enrollmentNumber, email, contactNumber are required' });
    }

    const totp = await generateTotpSecret(`Lawyer ${name}`);
    const user = await createUser({
      role: 'lawyer',
      status: 'pending',
      name,
      adminname: null,
      uid: null,
      email,
      password_hash: null,
      totp_secret: totp.base32,
      registration_number: null,
      enrollment_number: enrollmentNumber,
      contact_number: contactNumber,
    });

    return res.status(201).json({ user: sanitizeUser(user), totp });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/auth/individual/register', async (req, res) => {
  try {
    const { name, contactNumber, password } = req.body;

    if (!name || !contactNumber || !password) {
      return res.status(400).json({ error: 'name, contactNumber, password are required' });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      role: 'individual',
      status: 'verified',
      name,
      adminname: null,
      uid: null,
      email: null,
      password_hash: passwordHash,
      totp_secret: null,
      registration_number: null,
      enrollment_number: null,
      contact_number: contactNumber,
    });

    const token = signJwt({ userId: user.id, role: user.role, status: user.status });
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Individual registration error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/auth/ngo/login', async (req, res) => {
  try {
    const { registrationNumber, otp } = req.body;

    if (!registrationNumber || !otp) {
      return res.status(400).json({ error: 'registrationNumber and otp are required' });
    }

    const user = await findUserByRoleIdentifier('ngo', registrationNumber);
    if (!user) {
      return res.status(404).json({ error: 'NGO not found' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Profile rejected' });
    }

    if (user.status !== 'verified') {
      return res.status(200).json({ status: user.status, message: 'Pending verification' });
    }

    const totpOk = verifyTotp(otp, user.totp_secret);
    if (!totpOk) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    const token = signJwt({ userId: user.id, role: user.role, status: user.status });
    return res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/auth/lawyer/login', async (req, res) => {
  try {
    const { contactNumber, otp } = req.body;

    if (!contactNumber || !otp) {
      return res.status(400).json({ error: 'contactNumber and otp are required' });
    }

    const user = await findUserByRoleIdentifier('lawyer', contactNumber);
    if (!user) {
      return res.status(404).json({ error: 'Lawyer not found' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Profile rejected' });
    }

    if (user.status !== 'verified') {
      return res.status(200).json({ status: user.status, message: 'Pending verification' });
    }

    const totpOk = verifyTotp(otp, user.totp_secret);
    if (!totpOk) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    const token = signJwt({ userId: user.id, role: user.role, status: user.status });
    return res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/auth/individual/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'name and password are required' });
    }

    const user = await findUserByRoleIdentifier('individual', name);
    if (!user) {
      return res.status(404).json({ error: 'Individual not found' });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signJwt({ userId: user.id, role: user.role, status: user.status });
    return res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/admin/stats', requireAuth, requireRole('admin'), async (req, res) => {
  const stats = await getCounts();
  return res.status(200).json(stats);
});

router.get('/admin/pending', requireAuth, requireRole('admin'), async (req, res) => {
  const ngos = await getUsersByRoleStatus('ngo', 'pending');
  const lawyers = await getUsersByRoleStatus('lawyer', 'pending');
  return res.status(200).json({ ngos, lawyers });
});

router.post('/admin/verify', requireAuth, requireRole('admin'), async (req, res) => {
  const { userId, action } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ error: 'userId and action are required' });
  }

  if (!['verified', 'rejected'].includes(action)) {
    return res.status(400).json({ error: 'action must be verified or rejected' });
  }

  const user = await updateUserStatus(userId, action);
  return res.status(200).json({ user: sanitizeUser(user) });
});

router.get('/users', requireAuth, requireRole('individual'), async (req, res) => {
  const { role } = req.query;

  if (!role || !['ngo', 'lawyer'].includes(role)) {
    return res.status(400).json({ error: 'role must be ngo or lawyer' });
  }

  const users = await getVerifiedUsers(role);
  return res.status(200).json({ users });
});

router.post('/requests', requireAuth, requireRole('individual'), requireVerified, async (req, res) => {
  const { targetId, targetRole } = req.body;

  if (!targetId || !targetRole) {
    return res.status(400).json({ error: 'targetId and targetRole are required' });
  }

  if (!['ngo', 'lawyer'].includes(targetRole)) {
    return res.status(400).json({ error: 'targetRole must be ngo or lawyer' });
  }

  const request = await createRequest({
    requesterId: req.user.id,
    requesterRole: req.user.role,
    targetId,
    targetRole,
  });

  return res.status(201).json({ request });
});

router.get('/requests/assigned', requireAuth, requireRole('ngo', 'lawyer'), requireVerified, async (req, res) => {
  const requests = await getRequestsForTarget(req.user.id, req.user.role);
  return res.status(200).json({ requests });
});

router.get('/requests/mine', requireAuth, requireRole('individual'), requireVerified, async (req, res) => {
  const requests = await getRequestsForRequester(req.user.id);
  return res.status(200).json({ requests });
});

router.put('/requests/:id', requireAuth, requireRole('ngo', 'lawyer'), requireVerified, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be accepted or rejected' });
  }

  const request = await updateRequestStatus(id, status);
  return res.status(200).json({ request });
});

router.get('/requests/connections', requireAuth, requireVerified, async (req, res) => {
  const connections = await getAcceptedConnections(req.user.id, req.user.role);
  return res.status(200).json({ connections });
});

export default router;
