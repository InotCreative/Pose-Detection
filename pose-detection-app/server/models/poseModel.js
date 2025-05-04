const mongoose = require('mongoose');

const poseSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  model: {
    type: String,
    required: true
  },
  poses: {
    type: Array,
    required: true
  },
  userId: {
    type: String,
    default: 'anonymous'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pose', poseSchema);