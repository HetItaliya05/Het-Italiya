const mongoose = require('mongoose');

const depositTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Deposit amount must be greater than zero'],
    },
    utr: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      minlength: 6,
      maxlength: 32,
    },
    screenshot: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit'],
      default: 'deposit',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DepositTransaction', depositTransactionSchema);