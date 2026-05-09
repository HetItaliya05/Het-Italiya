const mongoose = require('mongoose');

const withdrawalTransactionSchema = new mongoose.Schema(
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
      min: [1, 'Withdrawal amount must be greater than zero'],
    },
    payoutDetails: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['withdraw'],
      default: 'withdraw',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WithdrawalTransaction', withdrawalTransactionSchema);