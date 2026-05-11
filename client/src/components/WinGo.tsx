import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getNumberColor } from '../utils/gameUtils';
import { Clock } from 'lucide-react';

export const WinGo: React.FC = () => {
  const { 
    balance, 
    currentPeriod, 
    timer, 
    gameHistory, 
    betsHistory, 
    placeBet, 
    setActiveTab 
  } = useApp();

  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [isBettingPanelOpen, setIsBettingPanelOpen] = useState<boolean>(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'game' | 'bets'>('game');

  const openBetPanel = (bet: string) => {
    setSelectedBet(bet);
    setIsBettingPanelOpen(true);
  };

  const handleConfirmBet = () => {
    if (!selectedBet) return;
    const finalAmount = selectedAmount * multiplier;
    const ok = placeBet(selectedBet, finalAmount);
    if (ok) {
      setIsBettingPanelOpen(false);
    } else {
      alert('Insufficient balance to place bet.');
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#111624] text-gray-200 select-none pb-20 max-w-md w-full mx-auto relative">
      
      {/* Top App Header */}
      <div className="flex items-center justify-between p-4 bg-[#1e2538] border-b border-[#2d3854]">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setActiveTab('home')}
            className="text-gray-400 hover:text-white flex items-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-base font-extrabold text-white tracking-wider uppercase">Win Go</span>
        </div>
        <div className="flex items-center bg-[#28324a] px-3.5 py-1.5 rounded-xl border border-[#3b4a70]">
          <span className="text-xs font-bold text-amber-300 mr-2">₹</span>
          <span className="text-sm font-extrabold text-white">{balance.toFixed(2)}</span>
        </div>
      </div>

      {/* Main Period/Status Box */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 flex justify-between items-center shadow-xl border border-amber-300/30">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-amber-100/90 tracking-widest flex items-center space-x-1 uppercase mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Current Period</span>
            </span>
            <span className="text-lg font-black tracking-wider text-white select-text">
              {currentPeriod}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-amber-100/90 tracking-wider uppercase mb-1">Time Left</span>
            <div className="text-3xl font-black font-mono text-white tracking-widest bg-black/25 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-white/20 select-none">
              00:{timer < 10 ? `0${timer}` : timer}
            </div>
          </div>
        </div>
      </div>

      {/* Choice Buttons for Betting */}
      <div className="px-4">
        <div className="bg-[#192132] p-4 rounded-2xl border border-[#2d3854] flex flex-col space-y-4 shadow-md">
          {/* Colors Selection */}
          <div className="flex justify-between space-x-2">
            <button
              disabled={timer <= 3}
              onClick={() => openBetPanel('Green')}
              className={`flex-1 py-3 text-sm font-extrabold rounded-2xl text-white shadow-md bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-95 duration-150 transition disabled:opacity-50`}
            >
              GREEN
            </button>
            <button
              disabled={timer <= 3}
              onClick={() => openBetPanel('Violet')}
              className={`flex-1 py-3 text-sm font-extrabold rounded-2xl text-white shadow-md bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 active:scale-95 duration-150 transition disabled:opacity-50`}
            >
              VIOLET
            </button>
            <button
              disabled={timer <= 3}
              onClick={() => openBetPanel('Red')}
              className={`flex-1 py-3 text-sm font-extrabold rounded-2xl text-white shadow-md bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 active:scale-95 duration-150 transition disabled:opacity-50`}
            >
              RED
            </button>
          </div>

          {/* Numbers grid (0 to 9) */}
          <div className="grid grid-cols-5 gap-2.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const colorClass = getNumberColor(num);
              let bg = '';
              if (colorClass === 'red-violet') bg = 'bg-gradient-to-br from-red-500 via-purple-500 to-violet-600';
              else if (colorClass === 'green-violet') bg = 'bg-gradient-to-br from-green-500 via-purple-500 to-teal-600';
              else if (colorClass === 'green') bg = 'bg-gradient-to-br from-green-500 to-emerald-600';
              else bg = 'bg-gradient-to-br from-red-500 to-rose-600';

              return (
                <button
                  key={num}
                  disabled={timer <= 3}
                  onClick={() => openBetPanel(String(num))}
                  className={`w-full aspect-square rounded-full font-extrabold text-base text-white hover:scale-105 duration-150 active:scale-95 shadow-md border border-white/20 select-none disabled:opacity-50 ${bg}`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Size choices */}
          <div className="flex space-x-3">
            <button
              disabled={timer <= 3}
              onClick={() => openBetPanel('Big')}
              className="flex-1 py-3.5 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-2xl active:scale-95 duration-150 shadow-md select-none disabled:opacity-50 uppercase"
            >
              BIG (5-9)
            </button>
            <button
              disabled={timer <= 3}
              onClick={() => openBetPanel('Small')}
              className="flex-1 py-3.5 bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-extrabold text-sm rounded-2xl active:scale-95 duration-150 shadow-md select-none disabled:opacity-50 uppercase"
            >
              SMALL (0-4)
            </button>
          </div>
        </div>
      </div>

      {/* Gaming Result / History Tabs */}
      <div className="px-4 mt-5">
        <div className="flex bg-[#1e2538] p-1 rounded-2xl border border-[#2d3854]">
          <button
            onClick={() => setActiveHistoryTab('game')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition duration-300 uppercase tracking-wider ${
              activeHistoryTab === 'game' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-[#111624]' 
                : 'text-gray-400'
            }`}
          >
            Game History
          </button>
          <button
            onClick={() => setActiveHistoryTab('bets')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition duration-300 uppercase tracking-wider ${
              activeHistoryTab === 'bets' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-[#111624]' 
                : 'text-gray-400'
            }`}
          >
            My Bets History
          </button>
        </div>

        {activeHistoryTab === 'game' ? (
          <div className="bg-[#192132] border border-[#2d3854] mt-3 rounded-2xl p-3 shadow-md overflow-hidden">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2d3854] text-amber-200/70 font-black uppercase tracking-wider">
                    <th className="py-2.5 pl-2">Period</th>
                    <th className="py-2.5">Number</th>
                    <th className="py-2.5">Big/Small</th>
                    <th className="py-2.5 text-right pr-2">Color</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d3854]/40 font-bold text-gray-300">
                  {gameHistory.map((item, index) => {
                    let colorBadge = 'bg-red-500';
                    if (item.color === 'green') colorBadge = 'bg-green-500';
                    else if (item.color === 'violet') colorBadge = 'bg-purple-500';
                    else if (item.color === 'red-violet') colorBadge = 'bg-gradient-to-r from-red-500 to-purple-500';
                    else if (item.color === 'green-violet') colorBadge = 'bg-gradient-to-r from-green-500 to-purple-500';

                    return (
                      <tr key={index} className="hover:bg-white/5 duration-100 select-text">
                        <td className="py-2 pl-2">{item.period}</td>
                        <td className="py-2 font-black text-sm text-white">
                          <span className={`inline-block px-2.5 py-1 text-xs text-center font-bold text-white rounded-full ${colorBadge}`}>
                            {item.number}
                          </span>
                        </td>
                        <td className="py-2 font-black">{item.bigSmall}</td>
                        <td className="py-2 text-right pr-2 flex justify-end">
                          <span className={`w-3.5 h-3.5 rounded-full inline-block mt-1 ${colorBadge}`} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-[#192132] border border-[#2d3854] mt-3 rounded-2xl p-3 shadow-md overflow-hidden">
            {betsHistory.length === 0 ? (
              <div className="text-center text-xs py-10 font-bold text-gray-500 tracking-wider">
                No betting records available
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2.5 select-text">
                {betsHistory.map((bet) => (
                  <div key={bet.id} className="bg-[#1e2538] border border-[#2d3854] p-3 rounded-xl flex flex-col space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-amber-200/70">Period: </span>
                        <span className="text-white font-black">{bet.period}</span>
                      </div>
                      <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                        bet.outcome === 'won' 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : bet.outcome === 'lost' 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 animate-pulse'
                      }`}>
                        {bet.outcome}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-[#2d3854]/40 pt-2 font-medium">
                      <div className="flex flex-col">
                        <span className="text-gray-400">Bet Choice</span>
                        <span className="text-white font-extrabold uppercase">{bet.betOn}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-gray-400">Total Bet Amount</span>
                        <span className="text-white font-extrabold">₹{bet.amount.toFixed(2)}</span>
                      </div>
                    </div>

                    {bet.outcome === 'won' && (
                      <div className="bg-green-950/40 p-1.5 rounded-xl text-center text-xs text-green-400 font-extrabold border border-green-900/40">
                        Payout: ₹{bet.winAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-Up Overlay Betting Dialog Box */}
      {isBettingPanelOpen && selectedBet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center select-none duration-300 p-4">
          <div className="bg-[#192132] border border-[#2d3854] w-full max-w-md rounded-t-3xl rounded-b-xl shadow-2xl p-5 flex flex-col space-y-4 animate-slide-up">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm Your Bet</span>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs text-gray-400 font-medium">Predicting:</span>
                  <span className="text-sm font-black text-amber-300 uppercase tracking-wider">{selectedBet}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsBettingPanelOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Base Amounts selection */}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Base Bet Coins</span>
              <div className="flex space-x-2">
                {[1, 10, 100, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSelectedAmount(amt)}
                    className={`flex-1 py-2.5 text-xs font-black rounded-xl transition duration-150 border uppercase tracking-wider ${
                      selectedAmount === amt 
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-[#111624] border-amber-300 shadow-md' 
                        : 'bg-[#222b40] border-[#2d3854] text-gray-300'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Multipliers Selection */}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Multiplier</span>
              <div className="flex space-x-2">
                {[1, 3, 5, 10].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => setMultiplier(mult)}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition duration-150 border tracking-wider uppercase ${
                      multiplier === mult 
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-[#111624] border-amber-300 shadow-md' 
                        : 'bg-[#222b40] border-[#2d3854] text-gray-300'
                    }`}
                  >
                    x{mult}
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Summary */}
            <div className="bg-[#1e2538] border border-[#2d3854] p-3.5 rounded-2xl flex justify-between items-center text-xs">
              <div className="flex flex-col">
                <span className="text-gray-400 font-bold tracking-wide">Total Bet Coins</span>
                <span className="text-base font-extrabold text-white mt-0.5">₹{(selectedAmount * multiplier).toFixed(2)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-gray-400 font-bold tracking-wide">Your Wallet</span>
                <span className="text-base font-extrabold text-amber-300 mt-0.5">₹{balance.toFixed(2)}</span>
              </div>
            </div>

            {/* Confirm Bet Button */}
            <button
              onClick={handleConfirmBet}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-[#111624] font-black text-sm tracking-widest rounded-2xl shadow-lg transition active:scale-95 uppercase"
            >
              Submit Prediction Bet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
