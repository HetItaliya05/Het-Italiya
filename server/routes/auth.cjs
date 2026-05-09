const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs');
const { requireAuth } = require('../middleware/auth.cjs');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

const createUid = () => String(Math.floor(1000000 + Math.random() * 9000000));

const toClientUser = (user) => ({
  id: user._id.toString(),
  phone: user.phone,
  uid: user.uid,
  balance: user.walletBalance ?? 0,
  vipLevel: user.vipLevel ?? 1,
  totalBets: user.totalBets ?? 0,
  checkedInDays: user.checkedInDays ?? 0,
  lastCheckIn: user.lastCheckIn ?? null,
  giftCodesUsed: user.giftCodesUsed ?? [],
});

const signToken = (user) => jwt.sign(
  { id: user._id.toString(), role: user.role || 'user' },
  jwtSecret,
  { expiresIn: '7d' }
);

router.post('/register', async (req, res, next) => {
  try {
    const phone = String(req.body.phone || '').replace(/\D/g, '').slice(0, 10);
    const password = String(req.body.password || '');

    if (phone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10 digit phone number is required' });
    }

    if (password.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters' });
    }

    const existing = await User.findOne({ phone });

    if (existing) {
      return res.status(409).json({ message: 'Phone number already registered' });
    }

    let uid = createUid();
    while (await User.exists({ uid })) {
      uid = createUid();
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      phone,
      passwordHash,
      uid,
      walletBalance: 0,
    });

    return res.status(201).json({
      token: signToken(user),
      user: toClientUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const phone = String(req.body.phone || '').replace(/\D/g, '').slice(0, 10);
    const password = String(req.body.password || '');

    if (phone.length !== 10 || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }

    return res.json({
      token: signToken(user),
      user: toClientUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: toClientUser(user) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;