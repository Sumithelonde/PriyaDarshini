import React, { useState } from 'react';
import { adminSetupTotp } from '../services/authService';

const AdminSetup: React.FC = () => {
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const response = await adminSetupTotp(uid, password);
      setQrCode(response.qrCode);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Setup failed');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Admin TOTP Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Admin UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
        />
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="w-full bg-primary text-primary-foreground rounded py-2">Generate QR</button>
      </form>

      {qrCode && (
        <div className="mt-6 border rounded p-4">
          <h3 className="font-semibold mb-2">Scan Admin TOTP QR Code</h3>
          <img src={qrCode} alt="Admin TOTP QR" className="w-48 h-48" />
        </div>
      )}
    </div>
  );
};

export default AdminSetup;
