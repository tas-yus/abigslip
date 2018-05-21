var mongoose = require("mongoose");

var OrderSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
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
  branch: {
    type: Number,
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
  claimedAt: {
    type: Date,
  },
  claimed: {
    type: Boolean,
    default: false
  },
  void: {
    type: Boolean,
    default: false
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      default: []
    }
  ]
}, {
  timestamps: true,
  emitIndexErrors: true
});

module.exports = mongoose.model("Order", OrderSchema);
