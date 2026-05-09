import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, GameHistoryEntry, Bet, Transaction } from '../types';
import { createPeriodCode, generateRandomHistory } from '../utils/gameUtils';
import { sounds } from '../utils/sound';

const API_BASE = 'http://localhost:5000/api';

type AuthResult = { success: boolean; message?: string };

interface AppContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => Promise<AuthResult>;
  register: (phone: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  balance: number;
  addBalance: (amount: number, method: string) => void;
  submitDepositRequest: (amount: number, utr: string, screenshotName: string) => void;
  withdrawBalance: (amount: number, method: string) => boolean;
  gameHistory: GameHistoryEntry[];
  betsHistory: Bet[];
  transactions: Transaction[];
  placeBet: (betOn: string, amount: number) => boolean;
  currentPeriod: string;
  timer: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  checkIn: () => boolean;
  claimGiftCode: (code: string) => { success: boolean; message: string; amount?: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('daman_auth_token');
    const saved = localStorage.getItem('daman_user');
    return saved && token ? JSON.parse(saved) : null;
  });

  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>(() => {
    const saved = localStorage.getItem('daman_game_history');
    return saved ? JSON.parse(saved) : generateRandomHistory(15);
  });

  const [betsHistory, setBetsHistory] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('daman_bets_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('daman_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [timer, setTimer] = useState<number>(30);
  const [currentPeriod, setCurrentPeriod] = useState<string>(() => createPeriodCode());

  // Set the current period based on system clock initially
  useEffect(() => {
    setCurrentPeriod(createPeriodCode());
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('daman_auth_token');

    if (!token) return;

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Session expired');
        return response.json();
      })
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('daman_auth_token');
        localStorage.removeItem('daman_user');
        setUser(null);
      });
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('daman_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('daman_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('daman_game_history', JSON.stringify(gameHistory));
  }, [gameHistory]);

  useEffect(() => {
    localStorage.setItem('daman_bets_history', JSON.stringify(betsHistory));
  }, [betsHistory]);

  useEffect(() => {
    localStorage.setItem('daman_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Handle period countdown & generation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Time is up! Process previous round's bets & create new period
          const newPeriod = createPeriodCode(0);
          setCurrentPeriod(newPeriod);
          
          // Generate winning outcome
          const num = Math.floor(Math.random() * 10);
          const colors: string[] = [];
          if (num === 0) colors.push('red', 'violet');
          else if (num === 5) colors.push('green', 'violet');
          else if ([1, 3, 7, 9].includes(num)) colors.push('green');
          else colors.push('red');

          const size = num >= 5 ? 'Big' : 'Small';

          const newEntry: GameHistoryEntry = {
            period: createPeriodCode(-1),
            number: num,
            color: colors.includes('violet') ? (num === 0 ? 'red-violet' : 'green-violet') : (colors.includes('green') ? 'green' : 'red'),
            bigSmall: size
          };

          setGameHistory(prevHistory => [newEntry, ...prevHistory.slice(0, 49)]);

          // Update pending bets
          let anyWon = false;
          let anyLoss = false;

          setBetsHistory(prevBets => {
            return prevBets.map(bet => {
              if (bet.period === newEntry.period && bet.outcome === 'pending') {
                let didWin = false;
                let multiplier = 0;

                // Match Green/Red/Violet
                if (['Green', 'Red', 'Violet'].includes(bet.betOn)) {
                  if (colors.map(c => c.toLowerCase()).includes(bet.betOn.toLowerCase())) {
                    didWin = true;
                    // Exact calculation: Green or Red gives 2x minus 2% fee, Violet gives 4.5x
                    multiplier = bet.betOn === 'Violet' ? 4.5 : 1.95;
                  }
                } 
                // Match Big/Small
                else if (['Big', 'Small'].includes(bet.betOn)) {
                  if (bet.betOn === size) {
                    didWin = true;
                    multiplier = 1.95;
                  }
                } 
                // Match exact number
                else {
                  if (parseInt(bet.betOn) === num) {
                    didWin = true;
                    multiplier = 8.82; // standard 9x minus fee
                  }
                }

                if (didWin) {
                  anyWon = true;
                  const winAmt = bet.amount * multiplier;
                  if (user) {
                    setUser(u => u ? { ...u, balance: u.balance + winAmt } : u);
                  }
                  return { ...bet, outcome: 'won', winAmount: winAmt };
                } else {
                  anyLoss = true;
                  return { ...bet, outcome: 'lost', winAmount: 0 };
                }
              }
              return bet;
            });
          });

          if (anyWon) {
            sounds.playWin();
          } else if (anyLoss) {
            sounds.playError();
          }

          return 30; // reset countdown to 30
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPeriod, user]);

  const authenticate = async (endpoint: 'login' | 'register', phone: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        sounds.playError();
        return { success: false, message: data.message || 'Authentication failed' };
      }

      localStorage.setItem('daman_auth_token', data.token);
      setUser(data.user);
      sounds.playSuccess();
      return { success: true };
    } catch (error) {
      sounds.playError();
      return {
        success: false,
        message: 'Server not connected. Start Node API and MongoDB Compass, then try again.',
      };
    }
  };

  const login = (phone: string, password: string) => authenticate('login', phone, password);

  const register = (phone: string, password: string) => authenticate('register', phone, password);

  const logout = () => {
    localStorage.removeItem('daman_auth_token');
    setUser(null);
  };

  const addBalance = (amount: number, method: string) => {
    if (!user) return;
    setUser(u => u ? { ...u, balance: u.balance + amount } : u);
    setTransactions(prev => [
      { id: `tx-${Date.now()}`, type: 'deposit', amount, status: 'success', method, timestamp: new Date().toISOString() },
      ...prev
    ]);
    sounds.playSuccess();
  };

  const submitDepositRequest = (amount: number, utr: string, screenshotName: string) => {
    if (!user || amount <= 0) return;

    setUser(u => u ? { ...u, balance: u.balance + amount } : u);
    setTransactions(prev => [
      {
        id: `tx-${Date.now()}`,
        type: 'deposit',
        amount,
        status: 'success',
        method: 'Google Pay UPI Deposit',
        utr,
        screenshotName,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
    sounds.playSuccess();
  };

  const withdrawBalance = (amount: number, method: string): boolean => {
    if (!user || user.balance < amount) {
      sounds.playError();
      return false;
    }
    setUser(u => u ? { ...u, balance: u.balance - amount } : u);
    setTransactions(prev => [
      { id: `tx-${Date.now()}`, type: 'withdraw', amount, status: 'success', method, timestamp: new Date().toISOString() },
      ...prev
    ]);
    sounds.playSuccess();
    return true;
  };

  const placeBet = (betOn: string, amount: number): boolean => {
    if (!user || user.balance < amount) {
      sounds.playError();
      return false;
    }
    setUser(u => u ? { ...u, balance: u.balance - amount, totalBets: u.totalBets + amount } : u);
    
    // Create bet entry
    const newBet: Bet = {
      id: `bet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      period: currentPeriod,
      betOn,
      amount,
      outcome: 'pending',
      winAmount: 0,
      timestamp: new Date().toISOString()
    };

    setBetsHistory(prev => [newBet, ...prev]);
    sounds.playClick();
    return true;
  };

  const checkIn = (): boolean => {
    if (!user) return false;
    const today = new Date().toISOString().slice(0, 10);
    if (user.lastCheckIn === today) return false;

    // Daily reward amount: 10 * days
    const nextDays = user.checkedInDays + 1;
    const bonus = nextDays * 10;
    setUser(u => u ? { ...u, checkedInDays: nextDays, lastCheckIn: today, balance: u.balance + bonus } : u);
    sounds.playSuccess();
    return true;
  };

  const claimGiftCode = (code: string): { success: boolean; message: string; amount?: number } => {
    if (!user) return { success: false, message: 'Must be logged in' };
    const normalized = code.trim().toUpperCase();

    if (user.giftCodesUsed.includes(normalized)) {
      sounds.playError();
      return { success: false, message: 'Code already claimed' };
    }

    let bonus = 0;
    if (normalized === 'WELCOME100') bonus = 100;
    else if (normalized === 'DAMAN2026') bonus = 250;
    else if (normalized === 'VIPBONUS') bonus = 500;
    else {
      sounds.playError();
      return { success: false, message: 'Invalid code' };
    }

    setUser(u => u ? {
      ...u,
      balance: u.balance + bonus,
      giftCodesUsed: [...u.giftCodesUsed, normalized]
    } : u);

    sounds.playSuccess();
    return { success: true, message: `Success! Bonus ₹${bonus} added!`, amount: bonus };
  };

  return (
    <AppContext.Provider value={{
      user,
      isLoggedIn: !!user,
      login,
      register,
      logout,
      balance: user ? user.balance : 0,
      addBalance,
      submitDepositRequest,
      withdrawBalance,
      gameHistory,
      betsHistory,
      transactions,
      placeBet,
      currentPeriod,
      timer,
      activeTab,
      setActiveTab,
      checkIn,
      claimGiftCode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
