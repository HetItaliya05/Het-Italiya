export interface User {
  id?: string;
  phone: string;
  uid: string;
  balance: number;
  vipLevel: number;
  totalBets: number;
  checkedInDays: number;
  lastCheckIn: string | null;
  giftCodesUsed: string[];
}

export interface GameHistoryEntry {
  period: string;
  number: number;
  color: 'green' | 'red' | 'violet' | 'red-violet' | 'green-violet';
  bigSmall: 'Big' | 'Small';
}

export interface Bet {
  id: string;
  period: string;
  betOn: string; // 'Green', 'Red', 'Violet', 'Big', 'Small', or '0'-'9'
  amount: number;
  outcome: 'won' | 'lost' | 'pending';
  winAmount: number;
  timestamp: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'success' | 'pending';
  method: string;
  utr?: string;
  screenshotName?: string;
  timestamp: string;
}
