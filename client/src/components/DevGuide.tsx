import React, { useState } from 'react';
import { BookOpen, Terminal, Code, HelpCircle, Layers, ShieldCheck, DollarSign, PlusCircle } from 'lucide-react';

export const DevGuide: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'ws' | 'wallet' | 'deposit'>('ws');

  return (
    <div className="flex flex-col flex-1 bg-[#0d0d0d] text-gray-100 select-none pb-24 max-w-md w-full mx-auto font-sans">
      
      {/* Dev Header */}
      <div className="p-4 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border-b border-[#2d1111] flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-[#ff1a1a] to-[#800000] p-2.5 rounded-xl border border-[#ff4d4d]/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-widest uppercase">
              Developer Guide
            </h2>
            <p className="text-xs font-semibold text-gray-500">Node.js + React Color Trading Source</p>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex bg-[#121212] border border-[#2d1111] p-1 rounded-xl">
          <button
            onClick={() => setCurrentTab('ws')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition tracking-wider ${
              currentTab === 'ws'
                ? 'bg-[#ff1a1a] text-white shadow font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            WebSocket Timer
          </button>
          <button
            onClick={() => setCurrentTab('wallet')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition tracking-wider ${
              currentTab === 'wallet'
                ? 'bg-[#ff1a1a] text-white shadow font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Secure Wallet Systems
          </button>
          <button
            onClick={() => setCurrentTab('deposit')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition tracking-wider ${
              currentTab === 'deposit'
                ? 'bg-[#ff1a1a] text-white shadow font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Dummy Deposit Logic
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 select-text overflow-y-auto">
        {currentTab === 'deposit' && (
          <>
            <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-[#ff4d4d]" />
                <h3 className="text-sm font-black text-white uppercase">Dummy Deposit Guide (ડિપોઝિટ માર્ગદર્શન)</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                <strong>English:</strong> Create a realistic UPI deposit flow with Google Pay, QR, slip upload, UTR, and pending admin review.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                <strong>Gujarati:</strong> આ ગાઈડમાં Google Pay, QR, પેમેન્ટ સ્લિપ upload, UTR અને admin pending review flow બનાવવાનું શીખવવામાં આવ્યું છે.
              </p>
            </div>

            <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-[#ff4d4d]" />
                <h3 className="text-sm font-black text-white uppercase">Backend Logic (Node.js)</h3>
              </div>
              <div className="bg-black/40 border border-[#331111] p-3 rounded-xl overflow-x-auto text-xs text-amber-200/90 font-mono space-y-1">
                <p>{"// POST /api/deposit with Multer image upload"}</p>
                <p>{"router.post('/deposit', requireAuth, upload.single('screenshot'), async (req, res) => {"}</p>
                <p>{"  const amount = Number(req.body.amount);"}</p>
                <p>{"  const utr = String(req.body.utr || '').toUpperCase();"}</p>
                <p>{"  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });"}</p>
                <p>{"  if (!/^[A-Z0-9]{6,32}$/.test(utr)) return res.status(400).json({ message: 'Invalid UTR' });"}</p>
                <p>{"  if (!req.file) return res.status(400).json({ message: 'Screenshot required' });"}</p>
                <br />
                <p>{"  const transaction = await DepositTransaction.create({"}</p>
                <p>{"    userId: req.user.id,"}</p>
                <p>{"    amount,"}</p>
                <p>{"    utr,"}</p>
                <p>{"    screenshot: `/uploads/payment-slips/${req.file.filename}`,"}</p>
                <p>{"    type: 'deposit',"}</p>
                <p>{"    status: 'pending'"}</p>
                <p>{"  });"}</p>
                <br />
                <p className="text-gray-500">{"  // Balance is updated later by admin approve endpoint."}</p>
                <p>{"  res.status(201).json({ message: 'Payment submitted successfully', transaction });"}</p>
                <p>{"});"}</p>
              </div>
            </div>

            <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-[#ff4d4d]" />
                <h3 className="text-sm font-black text-white uppercase">Frontend Submit Flow</h3>
              </div>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                Amount, screenshot, UTR and terms checkbox must be validated before submit.
              </p>
              <div className="bg-black/40 border border-[#331111] p-3 rounded-xl overflow-x-auto text-xs text-amber-200/90 font-mono space-y-1">
                <p>{"const formData = new FormData();"}</p>
                <p>{"formData.append('amount', amount);"}</p>
                <p>{"formData.append('utr', utr);"}</p>
                <p>{"formData.append('screenshot', paymentSlip);"}</p>
                <br />
                <p>{"await fetch('/api/deposit', {"}</p>
                <p>{"  method: 'POST',"}</p>
                <p>{"  headers: { Authorization: `Bearer ${token}` },"}</p>
                <p>{"  body: formData"}</p>
                <p>{"});"}</p>
              </div>
            </div>
          </>
        )}

        {currentTab === 'ws' && (
          <>
            {/* Intro */}
            <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-[#ff4d4d]" />
                <h3 className="text-sm font-black text-white uppercase">Guide Overview (પરિચય)</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                <strong>English:</strong> Learn to implement real-time server-side timers and clients using WebSockets and Express.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                <strong>Gujarati:</strong> આ ગાઈડમાં તમે શીખશો કે કેવી રીતે Node.js + WebSockets નો ઉપયોગ કરીને રીઅલ-ટાઇમ ટાઈમર અને પરિણામ મોકલી શકાય છે.
              </p>
            </div>

            {/* Step 1: Node.js Logic */}
            <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-[#ff4d4d]" />
                <h3 className="text-sm font-black text-white uppercase">1. Backend (Node.js + WS)</h3>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Express અને <code>ws</code> પેકેજનો ઉપયોગ કરીને ટાઈમર સિંક્રોનાઇઝ કરો.
              </p>
              <div className="bg-black/40 border border-[#331111] p-3 rounded-xl overflow-x-auto text-xs text-amber-200/90 font-mono space-y-1">
                <p>{"// server.js (Node.js & WebSocket)"}</p>
                <p>{"const express = require('express');"}</p>
                <p>{"const { WebSocketServer } = require('ws');"}</p>
                <p>{"const app = express();"}</p>
                <p>{"const port = 5000;"}</p>
                <p className="text-gray-500">{"// Timer tracking variables"}</p>
                <p>{"let timer = 15;"}</p>
                <p>{"let period = '2026030999';"}</p>
                <p>{"let result = null;"}</p>
                <p>{"let wss;"}</p>
                <br />
                <p>{"// Sync timer and broadcast results every second"}</p>
                <p>{"setInterval(() => {"}</p>
                <p>{"  timer--;"}</p>
                <p>{"  if (timer <= 0) {"}</p>
                <p>{"    result = Math.random() > 0.5 ? 'Option A' : 'Option B';"}</p>
                <p className="text-gray-500">{"    // Broadcast winning message"}</p>
                <p>{"    broadcast({ type: 'RESULT', result, period });"}</p>
                <p>{"    timer = 15;"}</p>
                <p>{"    period = String(Number(period) + 1);"}</p>
                <p>{"  } else {"}</p>
                <p>{"    broadcast({ type: 'TICK', timer, period });"}</p>
                <p>{"  }"}</p>
                <p>{"}, 1000);"}</p>
                <br />
                <p>{"function broadcast(data) {"}</p>
                <p>{"  if (!wss) return;"}</p>
                <p>{"  wss.clients.forEach((client) => {"}</p>
                <p>{"    if (client.readyState === 1) {"}</p>
                <p>{"      client.send(JSON.stringify(data));"}</p>
                <p>{"    }"}</p>
                <p>{"  });"}</p>
                <p>{"}"}</p>
                <br />
                <p>{"const server = app.listen(port, () => {"}</p>
                <p>{"  console.log(`Server running on port ${port}`);"}</p>
                <p>{"});"}</p>
                <p>{"wss = new WebSocketServer({ server });"}</p>
              </div>
            </div>

            {/* Step 2: React Logic */}
            <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-[#ff4d4d]" />
                <h3 className="text-sm font-black text-white uppercase">2. Frontend (React Integration)</h3>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                React ની અંદર WebSocket સાથે કનેક્ટ કરો અને પરિણામ પોપઅપ સેટ કરો.
              </p>
              <div className="bg-black/40 border border-[#331111] p-3 rounded-xl overflow-x-auto text-xs text-amber-200/90 font-mono space-y-1">
                <p>{"import React, { useEffect, useState } from 'react';"}</p>
                <br />
                <p>{"export const ABClient = () => {"}</p>
                <p>{"  const [timer, setTimer] = useState(15);"}</p>
                <p>{"  const [result, setResult] = useState('');"}</p>
                <p>{"  const [open, setOpen] = useState(false);"}</p>
                <br />
                <p>{"  useEffect(() => {"}</p>
<p>{"    const ws = new WebSocket('wss://het-italiya-1.onrender.com');"}</p>
                <p>{"    ws.onmessage = (event) => {"}</p>
                <p>{"      const data = JSON.parse(event.data);"}</p>
                <p>{"      if (data.type === 'TICK') {"}</p>
                <p>{"        setTimer(data.timer);"}</p>
                <p>{"      } else if (data.type === 'RESULT') {"}</p>
                <p>{"        setResult(data.result);"}</p>
                <p>{"        setOpen(true);"}</p>
                <p>{"        setTimeout(() => setOpen(false), 4000);"}</p>
                <p>{"      }"}</p>
                <p>{"    };"}</p>
                <p>{"    return () => ws.close();"}</p>
                <p>{"  }, []);"}</p>
                <br />
                <p>{"  return ("}</p>
                <p>{"    <div>"}</p>
                <p>{"      <h2>Time Left: {timer}s</h2>"}</p>
                <p>{"      {open && ("}</p>
                <p>{"        <div className='popup'>"}</p>
                <p>{"          <h3>Congratulations! {result} wins 🎉</h3>"}</p>
                <p>{"        </div>"}</p>
                <p>{"      )}"}</p>
                <p>{"    </div>"}</p>
                <p>{"  );"}</p>
                <p>{"};"}</p>
              </div>
            </div>

            {/* Gujarati + English Key takeaways */}
            <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[#ff4d4d]" />
                <h3 className="text-sm font-black text-white uppercase">Important Points (યાદ રાખવા જેવી બાબતો)</h3>
              </div>
              <div className="space-y-2 text-xs text-gray-300 font-medium">
                <p>
                  <strong>૧. WebSocket Sinks</strong>: Node.js નો WebSocket સારો છે કારણ કે તે દરેક ક્લાયન્ટ ને એક સાથે મેસેજ મોકલે છે.
                </p>
                <p>
                  <strong>૨. Timer Logic</strong>: સર્વરનું ટાઈમર મુખ્ય સ્ત્રોત હોવું જોઈએ જેથી દરેક યૂઝરને સેમ ટાઈમ બતાવે.
                </p>
                <p>
                  <strong>3. State Reset</strong>: જ્યારે પોપઅપ ઓટો-ક્લોઝ થાય, ત્યારે નવો બેટિંગ રાઉન્ડ શરુ કરો.
                </p>
              </div>
            </div>
          </>
        )}

        {currentTab === 'wallet' && (
          <>
            {/* Wallet Overview Intro */}
            <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-[#ff4d4d]" />
                <h3 className="text-sm font-black text-white uppercase">Wallet Overview (વોલેટ પરિચય)</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                <strong>English:</strong> Learn to implement a secure user wallet schema, default it to 0, prevent negative values, and provide API update routes.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                <strong>Gujarati:</strong> આ ગાઈડમાં વોલેટ સિસ્ટમ કઈ રીતે સેટ કરવી તે બતાવવામાં આવ્યું છે. જ્યારે નવું એકાઉન્ટ બને ત્યારે બેલેન્સ 0 સેટ થાય છે અને નેગેટિવ બેલેન્સ રોકવામાં આવે છે.
              </p>
            </div>

            {/* Schema Code */}
            <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-[#ff4d4d]" />
                <h3 className="text-sm font-black text-white uppercase">1. Schema & Backend (Node.js)</h3>
              </div>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                <strong>English:</strong> Set up your mongoose model with a numeric field, default 0, and min limit of 0 to stop any illegal actions.
                <br />
                <strong>Gujarati:</strong> mongoose મોડેલમાં મિનિમમ 0 ની લિમિટ સેટ કરો જેથી નેગેટિવ બેલેન્સ અટકાવી શકાય.
              </p>
              <div className="bg-black/40 border border-[#331111] p-3 rounded-xl overflow-x-auto text-xs text-amber-200/90 font-mono space-y-1">
                <p>{"// models/User.js"}</p>
                <p>{"const mongoose = require('mongoose');"}</p>
                <br />
                <p>{"const userSchema = new mongoose.Schema({"}</p>
                <p>{"  phone: { type: String, required: true, unique: true },"}</p>
                <p>{"  walletBalance: {"}</p>
                <p>{"    type: Number,"}</p>
                <p>{"    default: 0,"}</p>
                <p>{"    min: [0, 'Balance cannot be negative']"}</p>
                <p>{"  }"}</p>
                <p>{"});"}</p>
                <br />
                <p>{"module.exports = mongoose.model('User', userSchema);"}</p>
              </div>
            </div>

            {/* Safe APIs Code */}
            <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#ff4d4d]" />
                <h3 className="text-sm font-black text-white uppercase">2. Secure Wallet APIs</h3>
              </div>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                Secure transaction APIs for getting and securely checking wagers before debiting the wallet.
              </p>
              <div className="bg-black/40 border border-[#331111] p-3 rounded-xl overflow-x-auto text-xs text-amber-200/90 font-mono space-y-1">
                <p>{"// routes/wallet.js"}</p>
                <p>{"const express = require('express');"}</p>
                <p>{"const router = express.Router();"}</p>
                <p>{"const User = require('../models/User');"}</p>
                <br />
                <p>{"// GET /wallet -> return current balance"}</p>
                <p>{"router.get('/wallet', async (req, res) => {"}</p>
                <p>{"  const user = await User.findById(req.userId);"}</p>
                <p>{"  res.json({ walletBalance: user?.walletBalance ?? 0 });"}</p>
                <p>{"});"}</p>
                <br />
                <p>{"// POST /wallet/update -> update balance after trade"}</p>
                <p>{"router.post('/wallet/update', async (req, res) => {"}</p>
                <p>{"  const { amountChange } = req.body;"}</p>
                <p>{"  const user = await User.findById(req.userId);"}</p>
                <br />
                <p>{"  // Check negative limit before committing"}</p>
                <p>{"  if (user.walletBalance + amountChange < 0) {"}</p>
                <p>{"    return res.status(400).json({ error: 'Insufficient balance' });"}</p>
                <p>{"  }"}</p>
                <br />
                <p>{"  user.walletBalance += amountChange;"}</p>
                <p>{"  await user.save();"}</p>
                <p>{"  res.json({ walletBalance: user.walletBalance });"}</p>
                <p>{"});"}</p>
                <br />
                <p>{"module.exports = router;"}</p>
              </div>
            </div>

            {/* Step 3: Frontend Integration */}
            <div className="bg-[#121212] border border-[#2d1111] p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-[#ff4d4d]" />
                <h3 className="text-sm font-black text-white uppercase">3. Frontend (Dashboard)</h3>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                React displays zero default and gracefully ignores empty values.
              </p>
              <div className="bg-black/40 border border-[#331111] p-3 rounded-xl overflow-x-auto text-xs text-amber-200/90 font-mono space-y-1">
                <p>{"import React, { useState, useEffect } from 'react';"}</p>
                <br />
                <p>{"export const WalletView = () => {"}</p>
                <p>{"  const [balance, setBalance] = useState(0);"}</p>
                <br />
                <p>{"  useEffect(() => {"}</p>
                <p>{"    fetch('/api/wallet')"}</p>
                <p>{"      .then(res => res.json())"}</p>
                <p>{"      .then(data => setBalance(data.walletBalance ?? 0));"}</p>
                <p>{"  }, []);"}</p>
                <br />
                <p>{"  return ("}</p>
                <p>{"    <div>"}</p>
                <p>{"      <h3>Wallet Total Balance: ₹{balance.toFixed(2)}</h3>"}</p>
                <p>{"    </div>"}</p>
                <p>{"  );"}</p>
                <p>{"};"}</p>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};
