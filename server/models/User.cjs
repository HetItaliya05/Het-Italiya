const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // NOTE: wallet balance is persisted in separate Wallet collection.
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, 'Wallet balance cannot be negative'],
      select: false,
    },
    vipLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalBets: {
      type: Number,
      default: 0,
      min: 0,
    },
    checkedInDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastCheckIn: {
      type: String,
      default: null,
    },
    giftCodesUsed: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);