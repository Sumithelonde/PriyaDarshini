import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminCreate } from '../services/authService';
import { getUser } from '../utils/authStorage';

const AdminCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ adminname: '', uid: '', email: '', password: '' });
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Authentication guard
  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminCreate(form);
      setQrCode(response.totp.qrCode);
      setSuccess(true);
      setForm({ adminname: '', uid: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ 
    icon: Icon, 
    placeholder, 
    value, 
    type = 'text',
    onChange 
  }: { 
    icon: any; 
    placeholder: string; 
    value: string;
    type?: string;
    onChange: (value: string) => void;
  }) => (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground transition-all duration-200 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-accent/70 p-4 border border-border backdrop-blur-md">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Create Admin Account</h1>
          <p className="text-muted-foreground text-base sm:text-lg">Set up a new administrator with TOTP-based two-factor authentication</p>
        </div>

        {/* Form Section */}
        <div className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8 backdrop-blur-xl shadow-legal">
          <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                icon={User}
                placeholder="Admin Name"
                value={form.adminname}
                onChange={(value) => handleChange('adminname', value)}
              />
              <InputField
                icon={Shield}
                placeholder="UID (User ID)"
                value={form.uid}
                onChange={(value) => handleChange('uid', value)}
              />
              <InputField
                icon={Mail}
                placeholder="Email Address"
                type="email"
                value={form.email}
                onChange={(value) => handleChange('email', value)}
              />
              <InputField
                icon={Lock}
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(value) => handleChange('password', value)}
              />

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-destructive">{error}</div>
                </div>
              )}

              {/* Success Message */}
              {success && !qrCode && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-600 dark:text-emerald-300">Admin account created successfully! Scan the QR code to complete setup.</div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !form.adminname || !form.uid || !form.email || !form.password}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shield className="h-5 w-5" />
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
            </form>
        </div>

        {/* QR Code Section */}
        {qrCode && (
          <div className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8 backdrop-blur-xl shadow-legal flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-foreground flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  Scan QR Code
                </h3>
              <p className="text-muted-foreground text-sm">Use an authenticator app like Google Authenticator or Authy</p>
              </div>

            <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-md">
                <img src={qrCode} alt="Admin TOTP QR" className="w-64 h-64 rounded-lg" />
              </div>

              <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Next Steps</p>
              <ol className="text-sm text-muted-foreground space-y-1 text-left">
                  <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 font-semibold text-foreground">1.</span>
                    <span>Open your authenticator app</span>
                  </li>
                  <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 font-semibold text-foreground">2.</span>
                    <span>Scan this QR code</span>
                  </li>
                  <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 font-semibold text-foreground">3.</span>
                    <span>Admin login is now complete</span>
                  </li>
                </ol>
              </div>

              <button
                onClick={() => {
                  setQrCode('');
                  setSuccess(false);
                }}
              className="w-full rounded-lg border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-card/80 active:scale-[0.98]"
              >
                Create Another Admin
              </button>
            </div>
          )}

        {/* Info Box */}
        <div className="rounded-xl border border-border bg-card/60 p-4 sm:p-6 backdrop-blur-xl shadow-legal">
          <p className="text-xs sm:text-sm text-muted-foreground space-y-2">
            <span className="block font-semibold text-foreground mb-2">ℹ️ Security Information</span>
            <span className="block">• Each admin account requires TOTP (Time-based One-Time Password) authentication</span>
            <span className="block">• Store the QR code securely or have the admin scan it immediately</span>
            <span className="block">• Backup codes can be provided separately for account recovery</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminCreate;
