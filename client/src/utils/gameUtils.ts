import { GameHistoryEntry } from '../types';

export const getNumberColor = (num: number): 'green' | 'red' | 'violet' | 'red-violet' | 'green-violet' => {
  if (num === 0) return 'red-violet';
  if (num === 5) return 'green-violet';
  if ([1, 3, 7, 9].includes(num)) return 'green';
  return 'red';
};

export const getNumberSize = (num: number): 'Big' | 'Small' => {
  return num >= 5 ? 'Big' : 'Small';
};

export const createPeriodCode = (offset: number = 0): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  // Number of 30-sec slots or 1-min slots since midnight
  const minutes = date.getHours() * 60 + date.getMinutes();
  const seconds = date.getSeconds();
  const periodIndex = minutes * 2 + Math.floor(seconds / 30) + 1 + offset;
  return `${dateStr}030${String(periodIndex).padStart(4, '0')}`;
};

export const generateRandomHistory = (count: number): GameHistoryEntry[] => {
  const list: GameHistoryEntry[] = [];
  for (let i = 0; i < count; i++) {
    const period = createPeriodCode(-i);
    const num = Math.floor(Math.random() * 10);
    list.push({
      period,
      number: num,
      color: getNumberColor(num),
      bigSmall: getNumberSize(num),
    });
  }
  return list;
};
