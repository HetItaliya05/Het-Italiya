const express = require('express');
const mongoose = require('mongoose');
const Wallet = require('../models/Wallet.cjs');
const { requireAuth } = require('../middleware/auth.cjs');

const router = express.Router();

const normalizeAmount = (value) => {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
};

const success = (res, data, status = 200) =>
  res.status(status).json({
    success: true,
    ...data,
  });

const fail = (res, status, message, extra = {}) =>
  res.status(status).json({
    success: false,
    message,
    ...extra,
  });

const logError = (context, err, extra = {}) => {
  console.error(`❌ ${context}`, {
    message: err?.message,
    stack: err?.stack,
    ...extra,
  });
};

// GET/POST routes use req.user.id from requireAuth

const validateAmountForWallet = (amountRaw) => {
  const amountNum = normalizeAmount(amountRaw);
  if (amountNum === null) return { ok: false, status: 400, message: 'Invalid amount' };
  if (Number.isNaN(amountNum)) return { ok: false, status: 400, message: 'Invalid amount' };
  if (!Number.isFinite(amountNum)) return { ok: false, status: 400, message: 'Invalid amount' };
  if (amountNum <= 0) return { ok: false, status: 400, message: 'Amount must be greater than 0' };
  return { ok: true, amount: amountNum };
};

// Optional: normalize Mongoose document to plain JSON
// GET wallet balance (auto-create if missing)
router.get('/balance', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, 'Unauthorized');

    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $setOnInsert: { balance: 0 } },
      { new: true, upsert: true, lean: true }
    );

    return success(res, { balance: wallet.balance });
  } catch (err) {
    console.error('GET /wallet/balance error:', err);
    next(err);
  }
});

// ADD balance
router.post('/add', requireAuth, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, 'Unauthorized');

    const { ok, amount, status: statusCode, message } = validateAmountForWallet(req.body?.amount);
    if (!ok) return fail(res, statusCode, message);

    let updated;

    await session.withTransaction(async () => {
      updated = await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { balance: amount } },
        { new: true, upsert: true, setDefaultsOnInsert: true, session }
      );

      if (!updated) throw new Error('Wallet not found/created');
    });

    return success(res, { balance: updated.balance });
  } catch (err) {
    console.error('POST /wallet/add error:', err);
    next(err);
  } finally {
    session.endSession();
  }
});

// WITHDRAW balance
router.post('/withdraw', requireAuth, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, 'Unauthorized');

    const { ok, amount, status: statusCode, message } = validateAmountForWallet(req.body?.amount);
    if (!ok) return fail(res, statusCode, message);

    const updated = await Wallet.findOneAndUpdate(
      { userId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true, session }
    );

    if (!updated) {
      return fail(res, 409, 'Insufficient wallet balance');
    }

    return success(res, { balance: updated.balance });
  } catch (err) {
    console.error('POST /wallet/withdraw error:', err);
    next(err);
  } finally {
    session.endSession();
  }
});

module.exports = router;

