import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Copy, Share2, CheckSquare } from 'lucide-react';

export const Promotion: React.FC = () => {
  const { user } = useApp();


  const [copied, setCopied] = useState<boolean>(false);

  const inviteCode = user ? `DAMAN${user.uid.slice(0, 5)}` : 'DAMAN78523';
  const referralLink = `https://damanapp.download/?r=${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col flex-1 bg-[#111624] text-gray-200 select-none pb-20 max-w-md w-full mx-auto">
      {/* Promotion Title */}
      <div className="p-4 bg-[#1e2538] border-b border-[#2d3854]">
        <h1 className="text-base font-extrabold text-white tracking-wider uppercase flex items-center space-x-2">
          <Flame className="w-5 h-5 text-amber-500" />
          <span>Promotion Center</span>
        </h1>
        <p className="text-xs text-gray-400 font-bold mt-0.5">Invite new players and earn commissions</p>
      </div>

      {/* Main Container */}
      <div className="p-4 space-y-4">
        {/* Referral Card */}
        <div className="bg-[#192132] border border-[#2d3854] p-5 rounded-2xl flex flex-col space-y-4 shadow-md">
          <div className="flex justify-between items-center bg-[#1e2538] border border-[#2d3854] p-3 rounded-xl select-text">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">My Invite Code</span>
              <p className="text-base font-black text-amber-300 mt-0.5">{inviteCode}</p>
            </div>
            <button
              onClick={handleCopy}
              className="p-2.5 bg-[#262f47] hover:bg-[#34405f] active:scale-95 text-amber-300 rounded-xl transition duration-150 border border-[#3b4a70]"
            >
              {copied ? <CheckSquare className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="select-text">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">My Invitation Link</span>
            <div className="flex bg-[#1e2538] border border-[#2d3854] p-3 rounded-xl justify-between items-center mt-1">
              <span className="text-xs text-gray-300 font-mono truncate max-w-[200px]">{referralLink}</span>
              <button
                onClick={handleCopy}
                className="text-xs bg-[#2a344d] hover:bg-[#394668] text-amber-300 font-black px-3 py-1.5 rounded-xl transition flex items-center space-x-1 border border-[#3b4a70]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>



        {/* Team Statistics / Multi tiers */}
        <div className="bg-[#192132] border border-[#2d3854] p-4 rounded-2xl shadow-md">
          <span className="text-xs font-black tracking-wider text-amber-300 uppercase block mb-3 pl-0.5">Team Referral Analysis</span>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#1e2538] border border-[#2d3854] p-3 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Tier 1</span>
              <span className="text-base font-black text-white">4</span>
              <p className="text-[9px] text-gray-500 font-medium">Direct Invites</p>
            </div>
            <div className="bg-[#1e2538] border border-[#2d3854] p-3 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Tier 2</span>
              <span className="text-base font-black text-white">11</span>
              <p className="text-[9px] text-gray-500 font-medium">Secondary</p>
            </div>
            <div className="bg-[#1e2538] border border-[#2d3854] p-3 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Tier 3</span>
              <span className="text-base font-black text-white">32</span>
              <p className="text-[9px] text-gray-500 font-medium">Team Invites</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
