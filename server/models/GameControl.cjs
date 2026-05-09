const mongoose = require('mongoose');

const gameControlSchema = new mongoose.Schema(
  {
    gameKey: {
      type: String,
      default: 'AB_TRADING',
      unique: true,
    },
    currentPeriod: {
      type: String,
      required: true,
    },
    timerDuration: {
      type: Number,
      default: 30,
      min: 5,
      max: 300,
    },
    manualOverride: {
      type: Boolean,
      default: false,
    },
    forcedResult: {
      type: String,
      enum: ['A', 'B', null],
      default: null,
    },
    lastResult: {
      type: String,
      enum: ['A', 'B', null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GameControl', gameControlSchema);