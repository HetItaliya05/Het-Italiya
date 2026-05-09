import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Trophy, Coins, RefreshCw, Sparkles, PlusCircle, ArrowUpRight, Award, Gift } from 'lucide-react';

export const Home: React.FC = () => {
  const { user, balance, setActiveTab, claimGiftCode } = useApp();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [giftInput, setGiftInput] = useState<string>('');
  const [giftRes, setGiftRes] = useState<{ success: boolean; message: string } | null>(null);

  const banners = [
    {
      id: 1,
      title: 'Mega Welcome Bonus ₹500',
      subtitle: 'Claim code: WELCOME100 & DAMAN2026',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 2,
      title: 'VIP Commission Rebate 1.5%',
      subtitle: 'Earn up to ₹1,00,000 every week',
      color: 'from-purple-500 to-indigo-700',
    },
    {
      id: 3,
      title: 'Win Go 1 Min Prediction',
      subtitle: 'The best odds and instant payout',
      color: 'from-emerald-500 to-teal-600',
    }
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(slideInterval);
  }, [banners.length]);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftInput) return;
    const res = claimGiftCode(giftInput);
    setGiftRes(res);
    setGiftInput('');
    setTimeout(() => setGiftRes(null), 4000);
  };

  return (
    <div className="flex flex-col flex-1 bg-[#111624] text-gray-200 select-none pb-20">
      {/* Header Profile / Balances */}
      <div className="p-5 bg-gradient-to-b from-[#1e2538] to-[#111624] border-b border-[#2d3854] flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-11 h-11 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center font-extrabold text-lg text-white shadow-md border border-amber-300">
              {user?.phone.slice(-1) || 'D'}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-300 flex items-center space-x-1">
                <span>UID: {user?.uid || '1234567'}</span>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg font-bold text-[10px] tracking-wider uppercase border border-amber-500/30">
                  VIP {user?.vipLevel || 1}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Enjoy prediction and gaming</p>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('account')}
            className="text-xs bg-[#222b40] hover:bg-[#2c3752] border border-[#2d3854] text-amber-400 font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            My Center
          </button>
        </div>

        {/* Wallet Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 p-5 rounded-2xl flex flex-col space-y-3 shadow-xl border border-amber-300/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full filter blur-xl transform translate-x-8 -translate-y-8" />
          <div className="flex justify-between items-center z-10">
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider text-amber-50/80 uppercase">Total Wallet Balance</span>
              <div className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2.5 mt-1">
                <span>₹{balance.toFixed(2)}</span>
                <button 
                  onClick={() => window.location.reload()}
                  className="p-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl hover:shadow duration-200 border border-amber-400/30"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <Coins className="w-12 h-12 text-amber-100/30" />
          </div>

          <div className="flex space-x-3 mt-1.5 z-10">
            <button
              onClick={() => setActiveTab('wallet')}
              className="flex-1 flex items-center justify-center space-x-2 py-3 bg-white hover:bg-white/90 text-[#111624] text-sm font-extrabold rounded-xl transition shadow active:scale-98"
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className="flex-1 flex items-center justify-center space-x-2 py-3 bg-amber-400 hover:bg-amber-300 hover:text-[#111624] text-white font-extrabold text-sm rounded-xl border border-white/20 transition active:scale-98 bg-opacity-30 backdrop-blur-sm"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* Promotional slider */}
      <div className="px-5 my-5">
        <div className="relative w-full h-36 bg-[#192132] border border-[#2d3854] rounded-2xl overflow-hidden shadow-md">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute top-0 left-0 w-full h-full p-5 flex flex-col justify-between transition-opacity duration-500 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${banner.color} opacity-90`} />
              <div className="z-10 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-wide text-white uppercase text-shadow-md">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-white/80 font-bold mt-1 max-w-xs">{banner.subtitle}</p>
                </div>
                <div className="flex items-center space-x-2 self-end">
                  <span className="text-[10px] text-white/70 font-semibold bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center">
                    <Award className="w-3.5 h-3.5 mr-1" /> Best Rates
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
            {banners.map((_, index) => (
              <div
                key={index}
                className={`w-2.5 h-1 rounded-full transition duration-300 ${
                  index === currentSlide ? 'bg-white w-5' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grid Quick Options/Categories */}
      <div className="px-5 pb-5 grid grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('activity')}
          className="flex flex-col items-center justify-center p-3 bg-[#1e2538] border border-[#2d3854] hover:bg-[#262f47] rounded-xl transition hover:shadow-lg active:scale-95 flex-1"
        >
          <Gift className="w-5 h-5 text-amber-400 mb-1.5" />
          <span className="text-xs font-bold text-gray-300">Check-in</span>
        </button>
        <button
          onClick={() => setActiveTab('promotion')}
          className="flex flex-col items-center justify-center p-3 bg-[#1e2538] border border-[#2d3854] hover:bg-[#262f47] rounded-xl transition hover:shadow-lg active:scale-95 flex-1"
        >
          <Flame className="w-5 h-5 text-amber-400 mb-1.5" />
          <span className="text-xs font-bold text-gray-300">Invite</span>
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className="flex flex-col items-center justify-center p-3 bg-[#1e2538] border border-[#2d3854] hover:bg-[#262f47] rounded-xl transition hover:shadow-lg active:scale-95 flex-1"
        >
          <Coins className="w-5 h-5 text-amber-400 mb-1.5" />
          <span className="text-xs font-bold text-gray-300">Wallet</span>
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className="flex flex-col items-center justify-center p-3 bg-[#1e2538] border border-[#2d3854] hover:bg-[#262f47] rounded-xl transition hover:shadow-lg active:scale-95 flex-1"
        >
          <Trophy className="w-5 h-5 text-amber-400 mb-1.5" />
          <span className="text-xs font-bold text-gray-300">Profile</span>
        </button>
      </div>

      {/* Gift Code Redemption Panel */}
      <div className="px-5 mb-5">
        <div className="bg-[#192132] border border-[#2d3854] p-4 rounded-2xl shadow-md">
          <div className="flex items-center space-x-2.5 mb-3">
            <Gift className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-extrabold tracking-wide uppercase text-white">Redeem Gift Code</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Enter a promotion code to receive up to ₹500 instantly.</p>
          <form onSubmit={handleClaim} className="flex space-x-2">
            <input
              type="text"
              placeholder="e.g. WELCOME100"
              value={giftInput}
              onChange={(e) => setGiftInput(e.target.value)}
              className="flex-1 bg-[#111624] border border-[#2d3854] px-4 py-3 text-sm font-bold text-white rounded-xl focus:outline-none focus:border-amber-500/60"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-[#111624] font-extrabold text-sm rounded-xl transition shadow active:scale-95"
            >
              Claim
            </button>
          </form>

          {giftRes && (
            <div className={`mt-3 text-center text-xs font-bold p-2.5 rounded-xl border ${
              giftRes.success 
                ? 'bg-green-950/40 text-green-400 border-green-800' 
                : 'bg-red-950/40 text-red-400 border-red-800'
            }`}>
              {giftRes.message}
            </div>
          )}
        </div>
      </div>

      {/* Category List Cards */}
      <div className="px-5 space-y-4">
        <h4 className="text-sm font-black text-gray-300 uppercase tracking-wider flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Exclusive Games</span>
        </h4>

        {/* Win Go Category Card */}
        <div
          onClick={() => setActiveTab('wingo')}
          className="relative group bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border border-teal-400/20 p-5 rounded-2xl flex justify-between items-center cursor-pointer shadow-lg transition duration-200 active:scale-98 select-none"
        >
          <div className="z-10 flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] font-black tracking-widest text-emerald-100 bg-emerald-950/40 backdrop-blur-sm px-2 py-0.5 rounded uppercase">
                Hot Release
              </span>
              <h3 className="text-xl font-black text-white mt-2 tracking-wider">WIN GO (Color Prediction)</h3>
              <p className="text-xs text-white/80 font-bold mt-1">30 Seconds / 1 Minute live draws</p>
            </div>
            <button className="self-start mt-4 px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs rounded-xl shadow transition duration-200 flex items-center space-x-1.5">
              <span>Play Now</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <Trophy className="w-16 h-16 text-white/20 transform rotate-12 transition group-hover:scale-110 duration-200" />
        </div>

        {/* TRX Win Go */}
        <div
          onClick={() => setActiveTab('wingo')}
          className="relative group bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-500 hover:to-amber-600 border border-red-400/20 p-5 rounded-2xl flex justify-between items-center cursor-pointer shadow-lg transition duration-200 active:scale-98 select-none"
        >
          <div className="z-10 flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] font-black tracking-widest text-red-100 bg-red-950/40 backdrop-blur-sm px-2 py-0.5 rounded uppercase">
                Popular
              </span>
              <h3 className="text-xl font-black text-white mt-2 tracking-wider">TRX WIN GO</h3>
              <p className="text-xs text-white/80 font-bold mt-1">Bet using Tron or Demo currency</p>
            </div>
            <button className="self-start mt-4 px-4 py-2 bg-white hover:bg-red-50 text-red-900 font-extrabold text-xs rounded-xl shadow transition duration-200 flex items-center space-x-1.5">
              <span>Play Now</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <Flame className="w-16 h-16 text-white/20 transform -rotate-12 transition group-hover:scale-110 duration-200" />
        </div>
      </div>
    </div>
  );
};
