var mongoose = require("mongoose");

var OrderSchema = new mongoose.Schema({
  date: Date,
  code: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  type: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },
  createdByServer: {
    type: Boolean,
    default: false
  },
  claimedAt: Date,
  claimed: {
    type: Boolean,
    default: false
  }
}, { emitIndexErrors: true });

module.exports = mongoose.model("Order", OrderSchema);
