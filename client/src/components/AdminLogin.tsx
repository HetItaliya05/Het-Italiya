import React, { useState } from 'react';
import { ShieldCheck, Lock, Phone, KeyRound, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminLoginRequest } from '../apiRequests/admin';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phone.length < 3) {
      setError('Enter a valid phone/email');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await adminLoginRequest(phone, password);
      if (!result.ok) {
        setError(result.error?.message || 'Admin login failed');
        return;
      }

      // TEMP TEST MODE: store admin token in the requested key
      localStorage.setItem('adminToken', result.data.token);
      navigate('/admin/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Admin login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#111624] text-gray-100 font-sans select-none justify-between">
      <div className="flex flex-col items-center pt-10 px-6 max-w-md w-full mx-auto">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-gradient-to-tr from-amber-400 to-amber-600 p-3 rounded-2xl shadow-lg border border-amber-300">
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          <span className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
            DAMAN ADMIN
          </span>
        </div>

        <p className="text-amber-200/80 text-sm font-semibold mb-8 tracking-wider uppercase">
          Secure Admin Authentication
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full bg-[#192132] p-6 rounded-3xl border border-[#2d3854] shadow-2xl flex flex-col space-y-5"
        >
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 pl-1">
              Phone / Email
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 h-5 w-5 text-amber-500/80" />
              <input
                type="text"
                placeholder="admin username"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#111624] pl-12 pr-4 py-3.5 rounded-xl border border-[#2d3854] text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-base"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 pl-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-amber-500/80" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111624] pl-12 pr-4 py-3.5 rounded-xl border border-[#2d3854] text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-base"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center font-semibold bg-red-950/40 p-2 rounded-xl border border-red-900/60">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-[#111624] font-extrabold rounded-2xl tracking-widest text-base shadow-lg shadow-amber-500/20 active:scale-98 transition transform uppercase flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                SIGNING IN...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                ADMIN LOGIN
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 flex flex-col space-y-2">
          <p className="text-xs text-amber-200/50 flex items-center justify-center space-x-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Admin-only access</span>
          </p>
        </div>
      </div>

      <div className="bg-[#192132]/60 border-t border-[#2d3854]/40 py-4 px-6 text-center text-xs text-gray-400">
        Playing responsibly. 18+ Only.
      </div>
    </div>
  );
};

