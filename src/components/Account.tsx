import React from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/sound';
import { Volume2, VolumeX, Shield, Award, LogOut, ExternalLink, Headset } from 'lucide-react';

export const Account: React.FC = () => {
  const { user, balance, logout, setActiveTab, transactions, betsHistory } = useApp();
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(sounds.enabled);

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setSoundEnabled(sounds.enabled);
  };

  const totalWon = betsHistory
    .filter((b) => b.outcome === 'won')
    .reduce((sum, b) => sum + b.winAmount, 0);

  const totalBet = betsHistory.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="flex flex-col flex-1 bg-[#111624] text-gray-200 select-none pb-20 max-w-md w-full mx-auto">
      {/* Upper Account Heading Header */}
      <div className="p-5 bg-gradient-to-b from-[#1e2538] to-[#111624] border-b border-[#2d3854] flex flex-col space-y-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg border border-amber-300">
            {user ? user.phone.slice(-1) : 'D'}
          </div>
          <div>
            <div className="text-base font-extrabold text-white flex items-center space-x-2">
              <span>+91 {user?.phone || '9999999999'}</span>
              <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase">
                VIP {user?.vipLevel || 1}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-bold mt-0.5">UID: {user?.uid || '12345678'}</p>
          </div>
        </div>

        {/* Balance Status Header */}
        <div className="bg-[#1e2538] border border-[#2d3854] p-4 rounded-2xl flex justify-between items-center shadow-md">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Withdrawable Balance</span>
            <span className="text-xl font-black text-white mt-0.5">₹{balance.toFixed(2)}</span>
          </div>
          <button
            onClick={() => setActiveTab('wallet')}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-[#111624] font-extrabold text-xs rounded-xl shadow active:scale-95 transition"
          >
            Deposit
          </button>
        </div>
      </div>

      {/* Main Account Area Details */}
      <div className="px-5 space-y-4 pt-1">
        
        {/* Game Stats */}
        <div className="bg-[#192132] border border-[#2d3854] p-4 rounded-2xl shadow-md select-text">
          <span className="text-xs font-black text-amber-200 uppercase tracking-wider block mb-3 pl-0.5">
            Gaming & Finance Analytics
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1e2538] border border-[#2d3854] p-3.5 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Bet Placed</span>
              <span className="text-base font-black text-white mt-1">₹{totalBet.toFixed(2)}</span>
            </div>
            <div className="bg-[#1e2538] border border-[#2d3854] p-3.5 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Coins Won</span>
              <span className="text-base font-black text-green-400 mt-1">₹{totalWon.toFixed(2)}</span>
            </div>
            <div className="bg-[#1e2538] border border-[#2d3854] p-3.5 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Transactions Log</span>
              <span className="text-base font-black text-white mt-1">{transactions.length}</span>
            </div>
            <div className="bg-[#1e2538] border border-[#2d3854] p-3.5 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Checked-in Days</span>
              <span className="text-base font-black text-amber-300 mt-1">{user?.checkedInDays || 0}</span>
            </div>
          </div>
        </div>

        {/* Options Row Lists */}
        <div className="bg-[#192132] border border-[#2d3854] p-1.5 rounded-2xl shadow-md flex flex-col divide-y divide-[#2d3854]/40">
          {/* Audio Setup */}
          <button
            onClick={toggleSound}
            className="flex justify-between items-center px-3.5 py-3.5 text-sm font-bold text-gray-300 hover:bg-white/5 transition rounded-xl duration-150"
          >
            <div className="flex items-center space-x-3">
              {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
              <span>In-game sound effects</span>
            </div>
            <span className="text-xs font-black uppercase text-amber-300">
              {soundEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </button>

          {/* Contact help / support */}
          <a
            href="https://t.me/damanapp"
            target="_blank"
            rel="noreferrer"
            className="flex justify-between items-center px-3.5 py-3.5 text-sm font-bold text-gray-300 hover:bg-white/5 transition rounded-xl duration-150"
          >
            <div className="flex items-center space-x-3">
              <Headset className="w-5 h-5 text-amber-400" />
              <span>Contact Live Chat</span>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-500" />
          </a>

          {/* Rules and Security center */}
          <button
            onClick={() => alert('Platform operates on AES-256 standard and strict random draws algorithms.')}
            className="flex justify-between items-center px-3.5 py-3.5 text-sm font-bold text-gray-300 hover:bg-white/5 transition rounded-xl duration-150"
          >
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>Platform Safety Rules</span>
            </div>
            <Award className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Action button */}
        <button
          onClick={logout}
          className="w-full py-4 bg-[#2a344d] hover:bg-red-950/40 border border-[#3b4a70] hover:border-red-800 text-gray-300 hover:text-red-400 font-extrabold text-sm tracking-widest rounded-2xl flex items-center justify-center space-x-2 transition duration-200 active:scale-95 uppercase shadow-md"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out and Exit Account</span>
        </button>
      </div>
    </div>
  );
};
