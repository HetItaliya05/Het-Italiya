import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/AuthPage';
import { Home } from './components/Home';
import { WinGo } from './components/WinGo';
import { Activity } from './components/Activity';
import { Promotion } from './components/Promotion';
import { Wallet } from './components/Wallet';
import { Account } from './components/Account';
import { ABGame } from './components/ABGame';
import { DevGuide } from './components/DevGuide';
import { BottomNav } from './components/BottomNav';
import { AdminPanel } from './components/AdminPanel';

const AppContent: React.FC = () => {
  const { isLoggedIn, activeTab } = useApp();
  const [hash, setHash] = React.useState(() => window.location.hash);

  React.useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (hash.startsWith('#/admin')) {
    return <AdminPanel />;
  }

  if (!isLoggedIn) {
    return <AuthPage />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'wingo':
        return <WinGo />;
      case 'abgame':
        return <ABGame />;
      case 'devguide':
        return <DevGuide />;
      case 'activity':
        return <Activity />;
      case 'promotion':
        return <Promotion />;
      case 'wallet':
        return <Wallet />;
      case 'account':
        return <Account />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090d16] text-gray-200 font-sans select-none antialiased">
      <div className="flex-1 flex flex-col max-w-md w-full mx-auto bg-[#111624] shadow-2xl relative min-h-screen">
        {renderTab()}
        <BottomNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
