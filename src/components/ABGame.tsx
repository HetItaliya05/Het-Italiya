import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, Trophy, ShieldCheck, HelpCircle } from 'lucide-react';

interface ABBetHistory {
  period: string;
  choice: 'Option A' | 'Option B';
  amount: number;
  outcome: 'won' | 'lost' | 'pending';
  winAmount: number;
}

interface ABGameHistory {
  period: string;
  winningChoice: 'Option A' | 'Option B';
  time: string;
}

export const ABGame: React.FC = () => {
  const { balance, addBalance, withdrawBalance } = useApp();
  
  // States for AB Game
  const [timer, setTimer] = useState<number>(15);
  const [period, setPeriod] = useState<string>('202603001');
  const [betOn, setBetOn] = useState<'Option A' | 'Option B' | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betMultiplier, setBetMultiplier] = useState<number>(1);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const [winningChoice, setWinningChoice] = useState<'Option A' | 'Option B' | null>(null);
  const [gameHistory, setGameHistory] = useState<ABGameHistory[]>([]);
  const [betHistory, setBetHistory] = useState<ABBetHistory[]>([]);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Sound generator
  const playWinSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Ignored browser audio block
    }
  };

  useEffect(() => {
    // Generate initial period
    const now = new Date();
    const periodStr = now.toISOString().slice(0, 10).replace(/-/g, '') + 'AB0' + Math.floor(Math.random() * 1000 + 100);
    setPeriod(periodStr);

    // Initial game history mock
    setGameHistory([
      { period: '2026030991', winningChoice: 'Option A', time: '12:00:15' },
      { period: '2026030990', winningChoice: 'Option B', time: '11:59:45' },
    ]);
  }, []);

  // Timer Countdown Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Calculate result when countdown hits 0
          const outcomeChoice: 'Option A' | 'Option B' = Math.random() > 0.5 ? 'Option A' : 'Option B';
          setWinningChoice(outcomeChoice);
          setPopupVisible(true);
          playWinSound();

          // Process bets
          setBetHistory((prevBets) =>
            prevBets.map((bet) => {
              if (bet.period === period && bet.outcome === 'pending') {
                if (bet.choice === outcomeChoice) {
                  const winAmt = bet.amount * 2;
                  addBalance(winAmt, `A/B Trading Win on ${outcomeChoice}`);
                  return { ...bet, outcome: 'won', winAmount: winAmt };
                }
                return { ...bet, outcome: 'lost', winAmount: 0 };
              }
              return bet;
            })
          );

          // Add to Game History
          setGameHistory((prevHistory) => [
            {
              period,
              winningChoice: outcomeChoice,
              time: new Date().toLocaleTimeString(),
            },
            ...prevHistory.slice(0, 24),
          ]);

          // Create new round period
          const nextPeriod = new Date().toISOString().slice(0, 10).replace(/-/g, '') + 'AB0' + Math.floor(Math.random() * 1000 + 100);
          setPeriod(nextPeriod);

          // Auto close popup modal after 4 seconds
          setTimeout(() => {
            setPopupVisible(false);
          }, 4000);

          return 15; // reset timer to 15 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [period, addBalance]);

  const placeABBet = () => {
    if (!betOn) {
      alert('કૃપા કરીને Option A અથવા Option B પસંદ કરો.');
      return;
    }
    const finalAmt = betAmount * betMultiplier;
    if (balance < finalAmt) {
      alert('Insufficient wallet balance!');
      return;
    }

    withdrawBalance(finalAmt, `A/B Round Bet on ${betOn}`);
    setBetHistory((prev) => [
      {
        period,
        choice: betOn,
        amount: finalAmt,
        outcome: 'pending',
        winAmount: 0,
      },
      ...prev,
    ]);
    alert(`Success! ₹${finalAmt} placed on ${betOn}`);
  };

  return (
    <div className="flex flex-col flex-1 bg-[#0d0d0d] text-gray-100 select-none pb-24 max-w-md w-full mx-auto relative font-sans">
      {/* Centered Modal / Result Popup with Red + Black Dark Theme (CSS Transitions and scale) */}
      {popupVisible && winningChoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-5 select-none duration-300">
          <div className="bg-[#121212] border-2 border-[#ff3333] w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-center space-y-4 animate-scale-up text-center relative overflow-hidden">
            {/* Top Red Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
            
            <div className="w-16 h-16 bg-[#ff1a1a]/20 border border-[#ff3333] rounded-full flex items-center justify-center mb-1 animate-pulse">
              <Trophy className="w-8 h-8 text-[#ff3333]" />
            </div>

            <h3 className="text-xl font-black uppercase text-white tracking-widest">
              Round Result
            </h3>
            
            <p className="text-lg font-extrabold text-white">
              {winningChoice === 'Option A'
                ? 'Congratulations! Option A wins 🎉'
                : 'Congratulations! Option B wins 🎉'}
            </p>

            <p className="text-xs text-[#ff4d4d] bg-[#1a0505] border border-[#ff3333]/30 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
              {winningChoice} is declared the winner
            </p>

            <div className="pt-2 w-full">
              <button
                onClick={() => setPopupVisible(false)}
                className="w-full py-3 bg-gradient-to-r from-[#ff1a1a] to-[#990000] hover:from-[#ff3333] hover:to-[#cc0000] text-white font-extrabold text-sm tracking-wider rounded-xl transition transform active:scale-95 shadow-lg border border-[#ff4d4d]/30"
              >
                CLOSE NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Profile / Balances */}
      <div className="p-4 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border-b border-[#2d1111] flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-[#ff1a1a] to-[#800000] p-2.5 rounded-xl border border-[#ff4d4d]/30">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-widest uppercase">
                A/B Trading Game
              </h2>
              <p className="text-xs font-semibold text-gray-500">Option A vs Option B Prediction</p>
            </div>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-2 bg-[#1a1a1a] hover:bg-[#262626] border border-[#333333] rounded-xl text-[#ff3333] transition"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Live Guide Explanation */}
        {showGuide && (
          <div className="bg-[#121212] border border-[#331111] p-4 rounded-xl text-xs space-y-2 select-text shadow-md">
            <h4 className="font-extrabold text-[#ff4d4d] tracking-wide uppercase">નિયમો અને માર્ગદર્શન (Gujarati Rules & Guide):</h4>
            <p className="text-gray-400 font-medium leading-relaxed">
              ૧. આ ગેમમાં તમે <strong>Option A</strong> અથવા <strong>Option B</strong> પર સટ્ટો લગાવી શકો છો.
              <br />
              ૨. ટાઈમર દર ૧૫ સેકન્ડે ૦ પર પહોંચશે અને પરિણામ જાહેર કરશે.
              <br />
              ૩. પરિણામ જાહેર થતાં જ એક સુંદર પોપઅપ ખુલશે અને વિજેતાની જાહેરાત થશે.
            </p>
            <hr className="border-[#2d1111] my-2" />
            <h4 className="font-extrabold text-[#ff4d4d] tracking-wide uppercase">English Guide & Rules:</h4>
            <p className="text-gray-400 font-medium leading-relaxed">
              1. Place bets on either Option A or Option B.
              2. The timer resets every 15 seconds.
              3. Once time is up, a results notification pops up indicating the winning option.
            </p>
          </div>
        )}

        <div className="bg-[#1a1a1a] border border-[#2d1111] p-3.5 rounded-xl flex justify-between items-center mt-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Trading Ledger</span>
            <span className="text-lg font-black text-white mt-0.5 tracking-tight">₹{balance.toFixed(2)}</span>
          </div>
          <span className="bg-[#ff1a1a]/15 text-[#ff4d4d] px-2.5 py-1 rounded-lg text-xs font-bold border border-[#ff3333]/25 uppercase tracking-wide flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Round</span>
          </span>
        </div>
      </div>

      {/* Current Round Display */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-[#1a0505] via-[#1a1a1a] to-[#0d0d0d] border border-[#331111] p-4 rounded-xl flex justify-between items-center shadow-lg relative overflow-hidden select-text">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 tracking-wider flex items-center space-x-1 uppercase">
              <Clock className="w-3.5 h-3.5 text-[#ff3333]" />
              <span>Current Round Period</span>
            </span>
            <span className="text-base font-black tracking-wider text-white select-text mt-0.5">
              {period}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1">Countdown</span>
            <div className="text-2xl font-black font-mono text-[#ff3333] tracking-widest bg-black/50 border border-[#ff3333]/30 px-3 py-1 rounded-xl animate-pulse">
              00:{timer < 10 ? `0${timer}` : timer}
            </div>
          </div>
        </div>
      </div>

      {/* Betting Options: Option A and Option B */}
      <div className="px-4">
        <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-2xl flex flex-col space-y-4 shadow-md">
          <div className="flex space-x-3">
            <button
              onClick={() => setBetOn('Option A')}
              className={`flex-1 flex flex-col items-center justify-center p-4 border rounded-2xl transition duration-150 transform hover:scale-102 active:scale-98 ${
                betOn === 'Option A'
                  ? 'bg-gradient-to-br from-[#ff3333] to-[#800000] border-[#ff4d4d] shadow-lg shadow-red-950/40 font-black'
                  : 'bg-[#1a1a1a] border-[#331111] hover:border-[#4d1a1a] text-gray-400 font-bold'
              }`}
            >
              <span className="text-sm uppercase tracking-widest text-white mb-0.5">Option A</span>
              <span className="text-[10px] uppercase font-semibold text-gray-300">Predict A wins</span>
            </button>

            <button
              onClick={() => setBetOn('Option B')}
              className={`flex-1 flex flex-col items-center justify-center p-4 border rounded-2xl transition duration-150 transform hover:scale-102 active:scale-98 ${
                betOn === 'Option B'
                  ? 'bg-gradient-to-br from-[#ff3333] to-[#800000] border-[#ff4d4d] shadow-lg shadow-red-950/40 font-black'
                  : 'bg-[#1a1a1a] border-[#331111] hover:border-[#4d1a1a] text-gray-400 font-bold'
              }`}
            >
              <span className="text-sm uppercase tracking-widest text-white mb-0.5">Option B</span>
              <span className="text-[10px] uppercase font-semibold text-gray-300">Predict B wins</span>
            </button>
          </div>

          {/* Amount Choices & Multipliers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5 pl-0.5">Unit Coins</span>
              <div className="flex space-x-1 bg-[#1a1a1a] p-1 rounded-xl border border-[#2d1111]">
                {[10, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBetAmount(amt)}
                    className={`flex-1 py-1.5 text-xs font-black tracking-wider transition rounded-lg ${
                      betAmount === amt
                        ? 'bg-[#ff1a1a] text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5 pl-0.5">Scale Multiplier</span>
              <div className="flex space-x-1 bg-[#1a1a1a] p-1 rounded-xl border border-[#2d1111]">
                {[1, 5].map((mult) => (
                  <button
                    key={mult}
                    type="button"
                    onClick={() => setBetMultiplier(mult)}
                    className={`flex-1 py-1.5 text-xs font-black tracking-wider transition rounded-lg ${
                      betMultiplier === mult
                        ? 'bg-[#ff1a1a] text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    x{mult}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Place Bet Submission Button */}
          <button
            onClick={placeABBet}
            disabled={timer <= 2}
            className="w-full py-3.5 bg-gradient-to-r from-[#ff1a1a] to-[#990000] hover:from-[#ff3333] hover:to-[#cc0000] disabled:opacity-40 text-white font-black text-sm tracking-widest rounded-xl transition transform active:scale-95 shadow-md border border-[#ff4d4d]/30 uppercase"
          >
            Submit Prediction Wager (₹{betAmount * betMultiplier})
          </button>
        </div>
      </div>

      {/* Mini Live Data Results of Previous rounds */}
      <div className="px-4 mt-5 space-y-4">
        {/* Section 1: Previous Rounds */}
        <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl shadow-md select-text">
          <span className="text-xs font-black text-[#ff3333] uppercase tracking-wider block mb-3 pl-0.5">Recent AB Draws Results</span>
          {gameHistory.length === 0 ? (
            <div className="text-center text-xs py-8 text-gray-500">No records found.</div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 select-text">
              {gameHistory.map((item, idx) => (
                <div key={idx} className="bg-[#1a1a1a] border border-[#2d1111] p-2.5 rounded-xl flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-bold">Round {item.period}</span>
                    <span className="text-[10px] text-gray-600 mt-0.5">{item.time}</span>
                  </div>
                  <span className={`font-black uppercase text-[10px] px-2.5 py-1 rounded-xl border ${
                    item.winningChoice === 'Option A'
                      ? 'bg-red-950/40 text-red-400 border-red-900/40'
                      : 'bg-[#ff1a1a]/15 text-[#ff4d4d] border-[#ff3333]/30'
                  }`}>
                    {item.winningChoice}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Personal Bets logged */}
        {betHistory.length > 0 && (
          <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl shadow-md select-text">
            <span className="text-xs font-black text-[#ff3333] uppercase tracking-wider block mb-3 pl-0.5">My AB Prediction Wagers</span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 select-text">
              {betHistory.map((bet, idx) => (
                <div key={idx} className="bg-[#1a1a1a] border border-[#2d1111] p-2.5 rounded-xl flex flex-col space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-bold">Round: {bet.period}</span>
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
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-xs text-white uppercase font-black">{bet.choice}</span>
                    <span className="text-xs text-white font-extrabold">₹{bet.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
