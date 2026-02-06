import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin, loginLawyer, loginNgo, loginIndividual } from '../services/authService';
import { setToken, setUser } from '../utils/authStorage';
import { Loader2, Scale } from 'lucide-react';

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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    adminname: '',
    password: '',
    otp: '',
    registrationNumber: '',
    contactNumber: '',
    name: '',
    domain: 'Health',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let response;

      if (role === 'admin') {
        response = await adminLogin(form.adminname, form.password, form.otp);
      } else if (role === 'ngo') {
        response = await loginNgo({ registrationNumber: form.registrationNumber, otp: form.otp });
      } else if (role === 'lawyer') {
        response = await loginLawyer({ contactNumber: form.contactNumber, otp: form.otp });
      } else {
        response = await loginIndividual({ name: form.name, password: form.password });
      }

      if (!response.token || !response.user) {
        setError('Invalid response from server. Please try again.');
        setLoading(false);
        return;
      }

      if (response.status && response.status !== 'verified') {
        setToken(response.token);
        setUser(response.user);
        setSuccess('Logged in successfully. Awaiting verification...');
        setTimeout(() => navigate('/wait'), 1000);
        return;
      }

      // Success - set auth state and redirect to dashboard
      setToken(response.token);
      setUser(response.user);
      setSuccess(`Welcome, ${response.user.name || 'User'}! Redirecting...`);

      // Ensure auth state is persisted before navigation
      setTimeout(() => {
        if (response.user.role === 'admin') navigate('/admin', { replace: true });
        else if (response.user.role === 'ngo') navigate('/ngo', { replace: true });
        else if (response.user.role === 'lawyer') navigate('/lawyer', { replace: true });
        else if (response.user.role === 'individual') navigate('/home', { replace: true });
      }, 300);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-700" />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-1000" />

      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
        <div className="glass-effect bg-card/40 backdrop-blur-3xl border border-border/50 rounded-2xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Header with icon */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-purple-600 shadow-lg">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Login
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-border/60"
              >
                <option value="admin">Admin</option>
                <option value="ngo">NGO</option>
                <option value="lawyer">Lawyer</option>
                <option value="individual">Individual</option>
              </select>
            </div>

            {/* Form inputs based on role */}
            {role === 'admin' && (
              <>
                <input
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="Admin Name"
                  value={form.adminname}
                  onChange={(e) => handleChange('adminname', e.target.value)}
                />
                <input
                  type="password"
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                />
                <input
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="Authenticator OTP (Optional)"
                  value={form.otp}
                  onChange={(e) => handleChange('otp', e.target.value)}
                />
              </>
            )}

            {role === 'ngo' && (
              <>
                <input
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="NGO Registration Number"
                  value={form.registrationNumber}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                />
                <input
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="Authenticator OTP"
                  value={form.otp}
                  onChange={(e) => handleChange('otp', e.target.value)}
                />
              </>
            )}

            {role === 'lawyer' && (
              <>
                <input
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="Contact Number"
                  value={form.contactNumber}
                  onChange={(e) => handleChange('contactNumber', e.target.value)}
                />
                <input
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="Authenticator OTP"
                  value={form.otp}
                  onChange={(e) => handleChange('otp', e.target.value)}
                />
              </>
            )}

            {role === 'individual' && (
              <>
                <input
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-border/60"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <input
                  type="password"
                  className="w-full bg-background/60 backdrop-blur-md border border-border/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-border/60"
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

            {/* Success message */}
            {success && (
              <div className="bg-green-500/20 backdrop-blur-md border border-green-500/50 text-green-600 dark:text-green-400 text-sm font-semibold p-4 rounded-lg">
                {success}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mt-6"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border/30 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors duration-300">
              Register
            </Link>
          </div>

          {/* Decorative line */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/50" />
            Secure Login
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/50" />
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Secure login powered by JWT authentication</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
