import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Phone, Lock, Sparkles, Trophy } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    setIsSubmitting(true);
    const result = isLogin ? await login(phone, password) : await register(phone, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#111624] text-gray-100 font-sans select-none justify-between">
      <div className="flex flex-col items-center pt-10 px-6 max-w-md w-full mx-auto">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-gradient-to-tr from-amber-400 to-amber-600 p-3 rounded-2xl shadow-lg border border-amber-300">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <span className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
            DAMAN
          </span>
        </div>
        <p className="text-amber-200/80 text-sm font-semibold mb-8 tracking-wider uppercase">
          Earning Games & Prediction Platform
        </p>

        {/* Tab Selection */}
        <div className="flex w-full bg-[#1e2538] p-1 rounded-2xl mb-6 shadow-md border border-[#2d3854]">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition duration-300 ${
              isLogin 
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-[#111624] font-extrabold shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            LOGIN
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition duration-300 ${
              !isLogin 
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-[#111624] font-extrabold shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="w-full bg-[#192132] p-6 rounded-3xl border border-[#2d3854] shadow-2xl flex flex-col space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 pl-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 h-5 w-5 text-amber-500/80" />
              <span className="absolute left-11 top-3.5 text-amber-500/70 font-semibold border-r border-[#2d3854] pr-2">
                +91
              </span>
              <input
                type="tel"
                placeholder="10-digit Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                className="w-full bg-[#111624] pl-20 pr-4 py-3.5 rounded-xl border border-[#2d3854] text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-base"
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
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-[#111624] font-extrabold rounded-2xl tracking-widest text-base shadow-lg shadow-amber-500/20 active:scale-98 transition transform uppercase"
          >
            {isSubmitting ? 'CONNECTING...' : isLogin ? 'LOG IN' : 'REGISTER NOW'}
          </button>

          {/* Visible Admin Login button (required UI element) */}
          <button
            type="button"
            onClick={() => window.location.assign('/admin-login')}
            className="w-full py-3 mt-3 bg-[#0f1422] border border-amber-400/40 hover:border-amber-400/70 text-amber-200 font-extrabold rounded-2xl tracking-widest text-sm shadow-lg shadow-amber-500/10 active:scale-98 transition transform uppercase"
          >
            Admin Login
          </button>
        </form>

        <div className="text-center mt-6 flex flex-col space-y-2">
          <p className="text-xs text-amber-200/50 flex items-center justify-center space-x-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Encrypted and Secure Server Authentication</span>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-200/40 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MongoDB live authentication enabled</span>
          </div>
        </div>
      </div>

      {/* Promotion banner at bottom */}
      <div className="bg-[#192132]/60 border-t border-[#2d3854]/40 py-4 px-6 text-center text-xs text-gray-400">
        Playing responsibly. 18+ Only.
      </div>
    </div>
  );
};
