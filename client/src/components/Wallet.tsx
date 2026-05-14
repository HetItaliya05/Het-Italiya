import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Coins,
  Copy,
  Loader2,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  QrCode,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const UPI_ID = 'daman.demo@okgpay';
const ACCOUNT_HOLDER = 'DAMAN TRADING PRIVATE LIMITED';
const UPI_QR_IMAGE = 'https://i.ibb.co/9H8Dj23F/or.jpg';

const upiApps = [
  { name: 'PhonePe', short: 'Pe', className: 'from-violet-600 to-purple-800' },
  { name: 'Google Pay', short: 'G', className: 'from-blue-500 to-emerald-500' },
  { name: 'Paytm', short: 'Pay', className: 'from-sky-500 to-blue-700' },
  { name: 'More', short: '...', className: 'from-zinc-600 to-zinc-800' },
];

export const Wallet: React.FC = () => {
  const { balance, submitDepositRequest, withdrawBalance, transactions } = useApp();
  const [activeMode, setActiveMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('100');
  const [isAmountEditable, setIsAmountEditable] = useState<boolean>(false);
  const [utr, setUtr] = useState<string>('');
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [paymentSlipPreview, setPaymentSlipPreview] = useState<string>('');
  const [agreed, setAgreed] = useState<boolean>(false);
  const [bankInfo, setBankInfo] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<'upi' | 'holder' | null>(null);

  const parsedAmount = useMemo(() => Number(amount || 0), [amount]);

  const copyText = async (field: 'upi' | 'holder', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1600);
    } catch {
      setMessage({ type: 'error', text: 'Copy failed. Please copy manually.' });
    }
  };

  const setSlipFile = (file: File | null) => {
    if (!file) {
      setPaymentSlip(null);
      setPaymentSlipPreview('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Only image files are allowed for payment slip.' });
      return;
    }

    setPaymentSlip(file);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = () => setPaymentSlipPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSlipDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    setSlipFile(file ?? null);
  };

  const handleDepositSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setMessage({ type: 'error', text: 'Amount 0 કરતાં મોટું હોવું જોઈએ. Amount must be greater than 0.' });
      return;
    }

    if (!paymentSlip) {
      setMessage({ type: 'error', text: 'Please upload your payment slip screenshot.' });
      return;
    }

    if (!/^[a-zA-Z0-9]{6,32}$/.test(utr.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid UTR number.' });
      return;
    }

    if (!agreed) {
      setMessage({ type: 'error', text: 'Please agree to terms and conditions.' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    // Demo mode: stores a pending deposit request without real payment gateway access.
    window.setTimeout(() => {
      submitDepositRequest(parsedAmount, utr.trim().toUpperCase(), paymentSlip.name);
      setIsProcessing(false);
      setShowSuccess(true);
      setUtr('');
      setPaymentSlip(null);
      setPaymentSlipPreview('');
      setAgreed(false);
      setIsAmountEditable(false);
      setMessage({ type: 'success', text: 'Payment Submitted Successfully. Wallet balance updated.' });
    }, 1800);
  };

  const handleWithdrawSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const withdrawAmount = Number(amount);

    if (!Number.isFinite(withdrawAmount) || withdrawAmount < 300) {
      setMessage({ type: 'error', text: 'Minimum withdrawal is ₹300' });
      return;
    }

    if (withdrawAmount > balance) {
      setMessage({ type: 'error', text: 'Insufficient wallet balance.' });
      return;
    }

    if (!bankInfo.trim()) {
      setMessage({ type: 'error', text: 'Please input valid account/address details.' });
      return;
    }

    const success = withdrawBalance(withdrawAmount, `Withdrawal to ${bankInfo}`);

    if (success) {
      setMessage({ type: 'success', text: `Successfully withdrew ₹${withdrawAmount.toFixed(2)}. Processing now.` });
      setAmount('100');
      setBankInfo('');
    } else {
      setMessage({ type: 'error', text: 'Withdrawal failed. Try again later.' });
    }

    window.setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="flex flex-col flex-1 bg-[#080808] text-gray-200 select-none pb-20 max-w-md w-full mx-auto">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm animate-upi-fade">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-amber-400/40 bg-[#111111] p-6 text-center shadow-2xl shadow-red-950/40 animate-upi-modal">
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-1.5 text-gray-400 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-green-400/40 bg-green-500/15">
              <CheckCircle2 className="h-9 w-9 text-green-400" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">Deposit Request</p>
            <h2 className="mt-2 text-2xl font-black text-white">Payment Submitted Successfully</h2>
            <p className="mt-2 text-sm font-semibold text-gray-400">
              Your UPI payment has been submitted successfully.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-400 via-red-600 to-red-800 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:brightness-110 active:scale-95"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-red-950/70 bg-gradient-to-b from-[#19130a] to-[#080808] p-4 flex justify-between items-center">
        <div>
          <h1 className="text-base font-extrabold text-white tracking-wider uppercase flex items-center space-x-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <span>Wallet Portal</span>
          </h1>
          <p className="text-xs text-gray-500 font-bold mt-0.5">Premium UPI deposit verification</p>
        </div>
        <div className="bg-[#121212] border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Balance</span>
          <span className="text-sm font-black text-amber-300 tracking-tight">₹{(balance ?? 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex bg-[#111111] p-1 rounded-2xl border border-red-950/70">
          <button
            onClick={() => { setActiveMode('deposit'); setMessage(null); setAmount('100'); }}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition duration-300 uppercase tracking-wider flex items-center justify-center space-x-1.5 ${
              activeMode === 'deposit'
                ? 'bg-gradient-to-r from-amber-400 via-red-600 to-red-800 text-white'
                : 'text-gray-500'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => { setActiveMode('withdraw'); setMessage(null); setAmount('300'); }}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition duration-300 uppercase tracking-wider flex items-center justify-center space-x-1.5 ${
              activeMode === 'withdraw'
                ? 'bg-gradient-to-r from-amber-400 via-red-600 to-red-800 text-white'
                : 'text-gray-500'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {activeMode === 'deposit' ? (
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            <section className="rounded-3xl border border-amber-500/25 bg-[#111111] p-4 shadow-xl shadow-black/30">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Payment Method</p>
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-amber-400/35 bg-gradient-to-r from-[#231808] to-[#150909] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-green-500 to-yellow-400 text-lg font-black text-white shadow-lg shadow-black/30">
                    G
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">Google Pay</p>
                    <p className="text-xs font-semibold text-gray-500">Selected by default</p>
                  </div>
                </div>
                <span className="rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-300">
                  Active
                </span>
              </div>
            </section>

            <section className="rounded-3xl border border-red-950/70 bg-[#111111] p-4 shadow-xl shadow-black/30">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Deposit Amount</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    disabled={!isAmountEditable}
                    onChange={(event) => setAmount(event.target.value)}
                    className="w-full bg-[#080808] disabled:bg-[#0c0c0c] border border-red-950/70 px-4 py-3.5 text-lg font-black text-white rounded-2xl focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 disabled:text-gray-300"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAmountEditable((value) => !value)}
                  className="mb-0.5 flex items-center gap-1.5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3.5 text-xs font-black uppercase tracking-wider text-amber-300 transition hover:bg-amber-400/20"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>{isAmountEditable ? 'Lock' : 'Edit'}</span>
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-red-950/70 bg-gradient-to-b from-[#151515] to-[#090909] p-5 text-center shadow-xl shadow-black/30">
              <div className="flex items-center justify-center gap-2 text-white">
                <QrCode className="h-5 w-5 text-amber-300" />
                <p className="text-sm font-black uppercase tracking-wider">Scan & Pay using UPI</p>
              </div>
              <p className="mt-2 text-xs font-semibold text-gray-500">Choose a UPI app to make the payment</p>

              <div className="mx-auto my-5 flex w-64 flex-col items-center rounded-[2rem] border border-amber-400/40 bg-white p-3 shadow-2xl shadow-red-950/30">
                <img
                  src={UPI_QR_IMAGE}
                  alt="UPI QR code"
                  className="h-56 w-56 rounded-3xl object-cover"
                />
              </div>

              <div className="grid gap-3 text-left">
                <div className="rounded-2xl border border-red-950/60 bg-black/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">UPI ID</span>
                      <p className="mt-1 font-mono text-sm font-black text-amber-300">{UPI_ID}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText('upi', UPI_ID)}
                      className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-2 text-amber-300 transition hover:bg-amber-400/20"
                      aria-label="Copy UPI ID"
                    >
                      {copiedField === 'upi' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-red-950/60 bg-black/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Account Holder Name</span>
                      <p className="mt-1 text-sm font-black text-white">{ACCOUNT_HOLDER}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText('holder', ACCOUNT_HOLDER)}
                      className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-2 text-amber-300 transition hover:bg-amber-400/20"
                      aria-label="Copy account holder name"
                    >
                      {copiedField === 'holder' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {upiApps.map((app) => (
                  <button
                    key={app.name}
                    type="button"
                    className="rounded-2xl border border-red-950/60 bg-[#111111] p-2.5 transition hover:-translate-y-0.5 hover:border-amber-400/40"
                  >
                    <span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${app.className} text-[10px] font-black text-white`}>
                      {app.name === 'More' ? <MoreHorizontal className="h-4 w-4" /> : app.short}
                    </span>
                    <span className="mt-1.5 block truncate text-[10px] font-bold text-gray-400">{app.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-red-950/70 bg-[#111111] p-4 shadow-xl shadow-black/30">
              <label className="text-xs font-black uppercase tracking-wider text-gray-400">Upload your payment slip</label>
              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleSlipDrop}
                className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-amber-400/30 bg-[#080808] px-4 py-7 text-center transition hover:border-amber-300/60 hover:bg-amber-400/5"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setSlipFile(event.target.files?.[0] ?? null)}
                />
                {paymentSlipPreview ? (
                  <div className="w-full">
                    <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-black/60 p-2 shadow-lg shadow-black/30">
                      <img
                        src={paymentSlipPreview}
                        alt="Uploaded payment slip preview"
                        className="h-56 w-full rounded-2xl object-contain bg-black"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-red-950/60 bg-[#101010] px-3 py-2 text-left">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-white">{paymentSlip?.name}</p>
                        <p className="text-[10px] font-semibold text-green-400">Photo uploaded and preview is visible</p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          setSlipFile(null);
                        }}
                        className="rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-950/20 text-red-300">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-black text-white">Drag & drop screenshot or tap to upload</p>
                    <p className="mt-1 text-xs font-medium text-gray-600">PNG, JPG, JPEG accepted. Photo preview will appear here.</p>
                  </>
                )}
              </label>
            </section>

            <section className="rounded-3xl border border-red-950/70 bg-[#111111] p-4 shadow-xl shadow-black/30">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">UTR Number</label>
              <input
                type="text"
                placeholder="Enter UTR / Transaction ID"
                value={utr}
                onChange={(event) => setUtr(event.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32))}
                className="w-full bg-[#080808] border border-red-950/70 px-4 py-3.5 text-sm font-black uppercase tracking-wider text-white rounded-2xl focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 placeholder:text-gray-700"
                required
              />
            </section>

            <label className="flex items-start gap-3 rounded-2xl border border-red-950/60 bg-[#111111] p-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-amber-400"
              />
              <span className="text-xs font-semibold leading-relaxed text-gray-400">
                I agree to terms and conditions. હું પુષ્ટિ કરું છું કે દાખલ કરેલી UTR અને પેમેન્ટ સ્લિપ સાચી છે.
              </span>
            </label>

            {message && (
              <div className={`text-center text-xs p-2.5 font-bold rounded-xl border ${
                message.type === 'success' ? 'bg-green-950/40 text-green-300 border-green-800/40' : 'bg-red-950/40 text-red-300 border-red-800/40'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 bg-gradient-to-r from-amber-400 via-red-600 to-red-800 hover:brightness-110 disabled:opacity-60 text-white font-black tracking-widest text-sm rounded-2xl transition shadow-lg shadow-red-950/30 active:scale-95 uppercase flex items-center justify-center space-x-2 ${isProcessing ? 'cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Proceed</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleWithdrawSubmit} className="bg-[#111111] border border-red-950/60 p-5 rounded-3xl flex flex-col space-y-4 shadow-xl shadow-black/30">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Withdrawal Amount (₹)</label>
              <input
                type="number"
                placeholder="Minimum ₹300"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full bg-[#090909] border border-red-950/70 px-4 py-3.5 text-base font-bold text-white rounded-xl focus:outline-none focus:border-red-500/70"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Payout Target (Bank Account / Address)</label>
              <input
                type="text"
                placeholder="IFSC / Bank details or USDT Address"
                value={bankInfo}
                onChange={(event) => setBankInfo(event.target.value)}
                className="w-full bg-[#090909] border border-red-950/70 px-4 py-3.5 text-sm font-bold text-white rounded-xl focus:outline-none focus:border-red-500/70"
                required
              />
            </div>

            {message && (
              <div className={`text-center text-xs p-2.5 font-bold rounded-xl border ${
                message.type === 'success' ? 'bg-green-950/40 text-green-300 border-green-800/40' : 'bg-red-950/40 text-red-300 border-red-800/40'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black tracking-widest text-sm rounded-xl transition shadow active:scale-95 uppercase flex items-center justify-center space-x-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Request Withdrawal</span>
            </button>
          </form>
        )}

        <div className="bg-[#111111] border border-red-950/60 p-4 rounded-3xl shadow-md">
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider block mb-3 pl-0.5">Transactions Activity Log</span>
          {transactions.length === 0 ? (
            <div className="text-center text-xs py-8 font-bold text-gray-600 tracking-wider">
              No recent payment transactions recorded
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 select-text">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-[#171717] border border-red-950/50 p-3 rounded-2xl flex justify-between items-center text-xs font-medium">
                  <div className="flex flex-col">
                    <span className="text-white font-extrabold uppercase">{tx.type}</span>
                    <span className="text-gray-500 text-[10px] truncate max-w-[190px] mt-0.5">
                      {tx.utr ? `UTR: ${tx.utr}` : tx.method}
                    </span>
                    {tx.screenshotName && (
                      <span className="text-gray-600 text-[10px] truncate max-w-[190px] mt-0.5">{tx.screenshotName}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`font-black text-sm block ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-black uppercase ${tx.status === 'pending' ? 'text-amber-300' : 'text-gray-600'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};