import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Gift, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export const Activity: React.FC = () => {
  const { user, checkIn } = useApp();
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const days = [
    { day: 1, reward: 10 },
    { day: 2, reward: 20 },
    { day: 3, reward: 30 },
    { day: 4, reward: 40 },
    { day: 5, reward: 50 },
    { day: 6, reward: 60 },
    { day: 7, reward: 70 },
  ];

  const handleCheckIn = () => {
    const success = checkIn();
    if (success) {
      setMsg({ type: 'success', text: 'Checked in successfully! Reward added to balance.' });
    } else {
      setMsg({ type: 'error', text: 'You have already checked in today.' });
    }
    setTimeout(() => setMsg(null), 3500);
  };

  const currentDay = user ? user.checkedInDays + 1 : 1;

  return (
    <div className="flex flex-col flex-1 bg-[#111624] text-gray-200 select-none pb-20 max-w-md w-full mx-auto">
      {/* Activity Top Heading */}
      <div className="p-4 bg-[#1e2538] border-b border-[#2d3854]">
        <h1 className="text-base font-extrabold text-white tracking-wider uppercase flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          <span>Activity & Rewards</span>
        </h1>
        <p className="text-xs text-gray-400 font-bold mt-0.5">Collect continuous rewards everyday</p>
      </div>

      {/* Main Container */}
      <div className="p-4 space-y-5">
        {/* Check In Panel */}
        <div className="bg-[#192132] border border-[#2d3854] p-5 rounded-2xl flex flex-col space-y-4 shadow-md">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold tracking-wider uppercase text-white">Daily Attendance</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Attend consecutive days to collect increasing coins! Earn up to ₹70 on the seventh day.
          </p>

          {/* Continuous checklist of Days */}
          <div className="grid grid-cols-4 gap-2">
            {days.map((item) => {
              const isChecked = user && user.checkedInDays >= item.day;
              const isNext = user && user.checkedInDays + 1 === item.day;

              return (
                <div
                  key={item.day}
                  className={`border p-2.5 rounded-xl flex flex-col items-center justify-center space-y-1 transition duration-200 text-center ${
                    isChecked
                      ? 'bg-amber-500/10 border-amber-500/40 opacity-70'
                      : isNext
                        ? 'bg-[#222b40] border-amber-500/60 shadow-lg'
                        : 'bg-[#1e2538] border-[#2d3854]'
                  }`}
                >
                  <span className="text-[10px] text-gray-400 font-extrabold tracking-wider uppercase">Day {item.day}</span>
                  <div className="text-amber-300 font-extrabold text-xs">₹{item.reward}</div>
                  {isChecked ? (
                    <CheckCircle2 className="w-4 h-4 text-amber-500 mt-1" />
                  ) : (
                    <div className="w-4 h-4 border border-dashed border-amber-500/40 rounded-full mt-1" />
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleCheckIn}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-[#111624] font-black tracking-widest text-sm rounded-xl transition shadow active:scale-95 uppercase flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Check In Day {currentDay > 7 ? 1 : currentDay}</span>
          </button>

          {msg && (
            <div className={`text-center text-xs p-2.5 font-bold rounded-xl border ${
              msg.type === 'success' ? 'bg-green-950/40 text-green-300 border-green-800/40' : 'bg-red-950/40 text-red-300 border-red-800/40'
            }`}>
              {msg.text}
            </div>
          )}
        </div>

        {/* Promotion details and tips */}
        <div className="bg-[#192132] border border-[#2d3854] p-5 rounded-2xl flex flex-col space-y-4 shadow-md select-text">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold tracking-wider uppercase text-white">VIP Level Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-[#1e2538] border border-[#2d3854] p-3 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current Tier</span>
                <span className="text-sm font-black text-amber-300">VIP {user?.vipLevel || 1}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rebate Rate</span>
                <p className="text-xs font-black text-white mt-0.5">0.6% / Period</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-medium text-gray-300 bg-[#111624] p-3 rounded-xl border border-[#2d3854]/40">
              <Sparkles className="w-5 h-5 text-amber-500/80 flex-shrink-0" />
              <span>Bet ₹10,000 more to upgrade to VIP Level 2 and receive extra weekly bonuses.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
