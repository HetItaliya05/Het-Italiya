import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Flame, Wallet, User, Shield, BookOpen } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'abgame', label: 'AB Game', icon: Shield },
    { id: 'devguide', label: 'Guide', icon: BookOpen },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'promotion', label: 'Invite', icon: Flame },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-[#192132] border-t border-[#2d3854] px-1 py-2 flex justify-around items-center z-40 select-none shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id || (tab.id === 'home' && activeTab === 'wingo');
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-200 flex-1 relative ${
              isActive 
                ? 'text-amber-400 font-black' 
                : 'text-gray-500 hover:text-gray-300 font-bold'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-1 h-1 bg-amber-400 rounded-full" />
            )}
            <Icon className={`w-4.5 h-4.5 mb-1 transition duration-150 ${
              isActive ? 'scale-110 text-amber-400' : 'scale-100'
            }`} />
            <span className="text-[9px] tracking-wide uppercase truncate max-w-full">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
