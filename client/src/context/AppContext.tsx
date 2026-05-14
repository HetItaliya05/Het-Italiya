import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, GameHistoryEntry, Bet, Transaction } from '../types';
import { createPeriodCode, generateRandomHistory } from '../utils/gameUtils';
import { sounds } from '../utils/sound';



import { apiFetch } from '../utils/api.ts';
import { walletAddRequest, walletBalanceRequest, walletWithdrawRequest, walletClaimRequest } from '../apiRequests/wallet';



type AuthResult = { success: boolean; message?: string };

interface AppContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => Promise<AuthResult>;
  register: (phone: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  balance: number;
  isWalletLoading: boolean;
  refreshWalletBalance: () => Promise<void>;
  addBalance: (amount: number, method: string) => Promise<void>;
  submitDepositRequest: (amount: number, utr: string, screenshotName: string) => Promise<void>;
  withdrawBalance: (amount: number, method: string) => Promise<boolean>;

  gameHistory: GameHistoryEntry[];
  betsHistory: Bet[];
  transactions: Transaction[];
  placeBet: (betOn: string, amount: number) => boolean;
  currentPeriod: string;
  timer: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  checkIn: () => boolean;
  claimGiftCode: (code: string) => Promise<{ success: boolean; message: string; amount?: number }>;

}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('daman_auth_token');
    const saved = localStorage.getItem('daman_user');
    return saved && token ? JSON.parse(saved) : null;
  });

  const [balance, setBalance] = useState<number>(0);
  const [isWalletLoading, setIsWalletLoading] = useState<boolean>(false);

  // Wallet balance MUST be MongoDB-driven.
  // Do NOT persist wallet balance in localStorage and do NOT mutate it locally.

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

  const refreshWalletBalance = async () => {

    const token = localStorage.getItem('daman_auth_token');
    if (!token) return;

    // Ensure wallet balance comes from backend only
    // (prevents refresh/reset due to any old client-only logic)


    setIsWalletLoading(true);
    try {
      const result = await walletBalanceRequest();
      if (!result.ok) throw new Error(result.error?.message || 'Failed to fetch wallet balance');
      setBalance(Number((result as any).data?.balance ?? 0));
    } catch (e) {
      console.error('refreshWalletBalance error:', e);
      setBalance(0);
    } finally {
      setIsWalletLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('daman_auth_token');
    if (!token) return;

    apiFetch<any>(`/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((result) => {
        if (!result.ok) throw new Error('Session invalid');
        if (result.data?.user) setUser(result.data.user);
      })
      .catch(() => {
        localStorage.removeItem('daman_auth_token');
        localStorage.removeItem('daman_user');
        setUser(null);
        setBalance(0);
      })
      .finally(() => {
        // Always attempt to fetch wallet balance after session validation
        refreshWalletBalance();
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
                  // Wallet balance is MongoDB-driven; re-sync after round end (no local wallet mutation)
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
    const result = await apiFetch<any>(`/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });

    if (!result.ok) {
      sounds.playError();
      const msg =
        typeof result.error === 'string'
          ? result.error
          : result.error?.message || 'Authentication failed';
      return { success: false, message: msg };
    }

    localStorage.setItem('daman_auth_token', result.data.token);
    setUser(result.data.user);
    sounds.playSuccess();

    // Fetch wallet balance right after login
    await refreshWalletBalance();

    return { success: true };

  };

  const login = (phone: string, password: string) => authenticate('login', phone, password);

  const register = (phone: string, password: string) => authenticate('register', phone, password);

  const logout = () => {
    localStorage.removeItem('daman_auth_token');
    localStorage.removeItem('daman_user');
    setUser(null);
    setBalance(0);
  };


  const addBalance = async (amount: number, method: string) => {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) return;

    const result = await walletAddRequest(num);
    if (!result.ok) {
      sounds.playError();
      return;

    }

    setTransactions((prev) => [
      { id: `tx-${Date.now()}`, type: 'deposit', amount: num, status: 'success', method, timestamp: new Date().toISOString() },
      ...prev,
    ]);
    sounds.playSuccess();
    await refreshWalletBalance();
  };

  const submitDepositRequest = async (amount: number, utr: string, screenshotName: string) => {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) return;
    if (!utr) return;

    // Keep existing UI behavior: create a pending/success-like entry locally.
    // Actual wallet balance is updated by backend admin approval via Wallet model.
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        type: 'deposit',
        amount: num,
        status: 'pending',
        method: 'Google Pay UPI Deposit',
        utr,
        screenshotName,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    sounds.playSuccess();
  };

  const withdrawBalance = async (amount: number, method: string): Promise<boolean> => {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) return false;

    const result = await walletWithdrawRequest(num);
    if (!result.ok) {
      sounds.playError();
      return false;
    }

    setTransactions((prev) => [
      { id: `tx-${Date.now()}`, type: 'withdraw', amount: num, status: 'success', method, timestamp: new Date().toISOString() },
      ...prev,
    ]);
    sounds.playSuccess();
    await refreshWalletBalance();
    return true;
  };

  const placeBet = (betOn: string, amount: number): boolean => {
    // Wallet balance is MongoDB-driven; do not mutate/deduct locally.
    // Prevent betting when backend balance cache is insufficient.
    if (!user || balance < amount) {
      sounds.playError();
      return false;
    }

    // NOTE: existing UI keeps bets client-side; wallet is re-synced after game round end.

    // Create bet entry (wallet balance is MongoDB-driven; do not deduct locally)
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
    // Wallet balance is MongoDB-driven; do not mutate locally
    setUser(u => u ? { ...u, checkedInDays: nextDays, lastCheckIn: today } : u);
    sounds.playSuccess();
    return true;
  };

  const claimGiftCode = async (
    code: string
  ): Promise<{ success: boolean; message: string; amount?: number }> => {
    if (!user) return { success: false, message: 'Must be logged in' };

    const normalized = code.trim().toUpperCase();
    if (!normalized) return { success: false, message: 'Invalid code' };

    try {
      const result = await walletClaimRequest(normalized);
      if (!result.ok) {
        sounds.playError();
        return { success: false, message: result.error?.message || 'Claim failed' };
      }

      sounds.playSuccess();
      await refreshWalletBalance();

      const credited = (result as any).data?.creditedAmount;
      return {
        success: true,
        message: `Success! Bonus ₹${credited} added!`,
        amount: credited,
      };
    } catch (e: any) {
      console.error('claimGiftCode error:', e);
      sounds.playError();
      return { success: false, message: e?.message || 'Claim failed' };
    }
  };


  return (
    <AppContext.Provider value={{
      user,
      isLoggedIn: !!user,
      login,
      register,
      logout,
      balance,
      isWalletLoading,
      refreshWalletBalance,
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
