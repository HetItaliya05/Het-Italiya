const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin.cjs');
const User = require('../models/User.cjs');
const DepositTransaction = require('../models/DepositTransaction.cjs');
const WithdrawalTransaction = require('../models/WithdrawalTransaction.cjs');
const GameControl = require('../models/GameControl.cjs');
const { requireAuth, requireAdmin } = require('../middleware/auth.cjs');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('Missing required environment variable: JWT_SECRET');
}


const signAdminToken = (admin) => jwt.sign(
  { id: admin._id.toString(), role: 'admin', username: admin.username },
  jwtSecret,
  { expiresIn: '8h' }
);

const adminGuard = [requireAuth, requireAdmin];

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username: String(username).toLowerCase().trim() });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const passwordOk = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    return res.json({
      token: signAdminToken(admin),
      admin: { id: admin._id, username: admin.username, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/overview', adminGuard, async (_req, res, next) => {
  try {
    const [totalUsers, deposits, withdrawals] = await Promise.all([
      User.countDocuments(),
      DepositTransaction.find(),
      WithdrawalTransaction.find(),
    ]);

    const totalDeposits = deposits.filter((item) => item.status === 'approved').reduce((sum, item) => sum + item.amount, 0);
    const totalWithdrawals = withdrawals.filter((item) => item.status === 'approved').reduce((sum, item) => sum + item.amount, 0);
    const totalProfit = totalDeposits - totalWithdrawals;

    return res.json({ totalUsers, totalDeposits, totalWithdrawals, totalProfit });
  } catch (error) {
    next(error);
  }
});

router.get('/users', adminGuard, async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const search = String(req.query.search || '').trim();
    const query = search ? { phone: { $regex: search, $options: 'i' } } : {};

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:userId', adminGuard, async (req, res, next) => {
  try {
    const allowed = ['phone', 'walletBalance', 'role'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));

    if (updates.walletBalance !== undefined && Number(updates.walletBalance) < 0) {
      return res.status(400).json({ message: 'Wallet balance cannot be negative' });
    }

    const user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true, runValidators: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:userId', adminGuard, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/deposits', adminGuard, async (_req, res, next) => {
  try {
    const deposits = await DepositTransaction.find().populate('userId', 'phone walletBalance').sort({ createdAt: -1 });
    return res.json({ deposits });
  } catch (error) {
    next(error);
  }
});

router.patch('/deposits/:transactionId/:action', adminGuard, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { transactionId, action } = req.params;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    let reviewedTransaction;

    await session.withTransaction(async () => {
      const transaction = await DepositTransaction.findById(transactionId).session(session);

      if (!transaction || transaction.status !== 'pending') {
        throw new Error('Pending deposit not found');
      }

      transaction.status = action === 'approve' ? 'approved' : 'rejected';
      transaction.reviewedBy = req.user.id;
      transaction.reviewedAt = new Date();
      reviewedTransaction = await transaction.save({ session });

      if (action === 'approve') {
        await User.findByIdAndUpdate(transaction.userId, { $inc: { walletBalance: transaction.amount } }, { session });
      }
    });

    return res.json({ transaction: reviewedTransaction });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
});

router.get('/withdrawals', adminGuard, async (_req, res, next) => {
  try {
    const withdrawals = await WithdrawalTransaction.find().populate('userId', 'phone walletBalance').sort({ createdAt: -1 });
    return res.json({ withdrawals });
  } catch (error) {
    next(error);
  }
});

router.patch('/withdrawals/:transactionId/:action', adminGuard, async (req, res, next) => {
  try {
    const { action, transactionId } = req.params;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const withdrawal = await WithdrawalTransaction.findById(transactionId);

    if (!withdrawal || withdrawal.status !== 'pending') {
      return res.status(404).json({ message: 'Pending withdrawal not found' });
    }

    withdrawal.status = action === 'approve' ? 'approved' : 'rejected';
    withdrawal.reviewedBy = req.user.id;
    withdrawal.reviewedAt = new Date();
    await withdrawal.save();

    return res.json({ withdrawal });
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', adminGuard, async (req, res, next) => {
  try {
    const type = req.query.type;
    const [deposits, withdrawals] = await Promise.all([
      type === 'withdraw' ? [] : DepositTransaction.find().lean(),
      type === 'deposit' ? [] : WithdrawalTransaction.find().lean(),
    ]);

    const transactions = [
      ...deposits.map((item) => ({ ...item, type: 'deposit' })),
      ...withdrawals.map((item) => ({ ...item, type: 'withdraw' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

router.get('/control-game', adminGuard, async (_req, res, next) => {
  try {
    const control = await GameControl.findOneAndUpdate(
      { gameKey: 'AB_TRADING' },
      { $setOnInsert: { currentPeriod: `${Date.now()}`, timerDuration: 30 } },
      { upsert: true, new: true }
    );

    return res.json({ control });
  } catch (error) {
    next(error);
  }
});

router.patch('/control-game', adminGuard, async (req, res, next) => {
  try {
    const { timerDuration, manualOverride, forcedResult } = req.body;
    const updates = {};

    if (timerDuration !== undefined) updates.timerDuration = Number(timerDuration);
    if (manualOverride !== undefined) updates.manualOverride = Boolean(manualOverride);
    if (forcedResult !== undefined) updates.forcedResult = forcedResult || null;

    const control = await GameControl.findOneAndUpdate({ gameKey: 'AB_TRADING' }, updates, {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    return res.json({ control });
  } catch (error) {
    next(error);
  }
});

module.exports = router;