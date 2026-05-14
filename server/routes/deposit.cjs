const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const DepositTransaction = require('../models/DepositTransaction.cjs');
const User = require('../models/User.cjs');
const Wallet = require('../models/Wallet.cjs');

const { requireAuth, requireAdmin } = require('../middleware/auth.cjs');

const router = express.Router();

const logError = (context, err, extra = {}) => {
  console.error(`❌ ${context}`, {
    message: err?.message,
    stack: err?.stack,
    ...extra,
  });
};

const normalizeAmount = (value) => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
};
const uploadDir = path.join(__dirname, '..', 'uploads', 'payment-slips');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }

    cb(null, true);
  },
});

router.post('/deposit', requireAuth, upload.single('screenshot'), async (req, res, next) => {
  try {
    const amount = normalizeAmount(req.body.amount);
    const utr = String(req.body.utr || '').trim().toUpperCase();

    if (amount === null || amount <= 0 || amount > 100000) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }

    if (!/^[A-Z0-9]{6,32}$/.test(utr)) {
      return res.status(400).json({ message: 'Invalid UTR number' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Payment screenshot is required' });
    }

    const existing = await DepositTransaction.findOne({ utr });

    if (existing) {
      return res.status(409).json({ message: 'UTR already submitted' });
    }

    const transaction = await DepositTransaction.create({
      userId: req.user.id,
      amount,
      utr,
      screenshot: `/uploads/payment-slips/${req.file.filename}`,
      status: 'pending',
    });

    return res.status(201).json({
      message: 'Payment submitted successfully',
      transaction,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/deposits/:transactionId/:action', requireAuth, requireAdmin, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { transactionId, action } = req.params;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid review action' });
    }

    let reviewedTransaction;

    await session.withTransaction(async () => {
      const transaction = await DepositTransaction.findById(transactionId).session(session);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'pending') {
        throw new Error('Transaction already reviewed');
      }

      transaction.status = action === 'approve' ? 'approved' : 'rejected';
      transaction.reviewedBy = req.user.id;
      transaction.reviewedAt = new Date();
      reviewedTransaction = await transaction.save({ session });

      if (action === 'approve') {
        await Wallet.findOneAndUpdate(
          { userId: transaction.userId },
          { $inc: { balance: transaction.amount } },
          { session, upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

    });

    return res.json({
      message: `Deposit ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      transaction: reviewedTransaction,
    });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
});

module.exports = router;