import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerNgo, registerLawyer, registerIndividual } from '../services/authService';
import { setToken, setUser } from '../utils/authStorage';
import { Loader2, UserPlus } from 'lucide-react';

const NGO_DOMAINS = [
  'Health',
  'Education',
  'Social Welfare',
  'Environment',
  'Legal Aid',
  'Women Empowerment',
  'Child Welfare',
  'Community Development',
  'Disability Support',
  'Rural Development',
  'Other'
];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    registrationNumber: '',
    enrollmentNumber: '',
    contactNumber: '',
    password: '',
    domain: 'Health',
  });
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setQrCode('');
    setLoading(true);

    try {
      if (role === 'ngo') {
        const response = await registerNgo({
          registrationNumber: form.registrationNumber,
          name: form.name,
          email: form.email,
          domain: form.domain,
        });
        setQrCode(response.totp.qrCode);
        setLoading(false);
        return;
      }

      if (role === 'lawyer') {
        const response = await registerLawyer({
          name: form.name,
          enrollmentNumber: form.enrollmentNumber,
          email: form.email,
          contactNumber: form.contactNumber,
        });
        setQrCode(response.totp.qrCode);
        setLoading(false);
        return;
      }

      const response = await registerIndividual({
        name: form.name,
        contactNumber: form.contactNumber,
        password: form.password,
      });

      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-1000" />

      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
        <div className="glass-effect bg-card/40 backdrop-blur-3xl border border-border/50 rounded-2xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Header with icon */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600 shadow-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
              Register
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-border/60"
              >
                <option value="individual">Individual</option>
                <option value="ngo">NGO</option>
                <option value="lawyer">Lawyer</option>
              </select>
            </div>

            {/* Full Name */}
            <input
              className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-border/60"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />

            {/* Email for NGO and Lawyer */}
            {(role === 'ngo' || role === 'lawyer') && (
              <input
                className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-border/60"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            )}

            {/* NGO Registration Number */}
            {role === 'ngo' && (
              <>
                <input
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="NGO Registration Number"
                  value={form.registrationNumber}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Domain</label>
                  <select
                    value={form.domain}
                    onChange={(e) => handleChange('domain', e.target.value)}
                    className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-border/60"
                  >
                    {NGO_DOMAINS.map((domain) => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Lawyer specific fields */}
            {role === 'lawyer' && (
              <>
                <input
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="Enrollment Number"
                  value={form.enrollmentNumber}
                  onChange={(e) => handleChange('enrollmentNumber', e.target.value)}
                />
                <input
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="Contact Number"
                  value={form.contactNumber}
                  onChange={(e) => handleChange('contactNumber', e.target.value)}
                />
              </>
            )}

            {/* Individual specific fields */}
            {role === 'individual' && (
              <>
                <input
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="Contact Number"
                  value={form.contactNumber}
                  onChange={(e) => handleChange('contactNumber', e.target.value)}
                />
                <input
                  type="password"
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                />
              </>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-600 dark:text-red-400 text-sm font-semibold p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mt-6"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          {/* QR Code section for 2FA */}
          {qrCode && (
            <div className="mt-6 bg-background/40 backdrop-blur-md border border-border/40 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 text-foreground">Scan TOTP QR Code</h3>
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <img src={qrCode} alt="TOTP QR" className="w-40 h-40" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Use an authenticator app (Google Authenticator, Authy, Microsoft Authenticator) to scan this QR code. After scanning, wait for admin verification. You can check status by logging in.
              </p>
              <button
                type="button"
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                onClick={() => navigate('/wait')}
              >
                Continue to Verification
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border/30 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-green-500 font-semibold hover:text-green-400 transition-colors duration-300">
              Login
            </Link>
          </div>

          {/* Decorative line */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/50" />
            Secure Registration
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/50" />
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Your information is protected with industry-standard encryption</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
