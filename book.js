var mongoose = require("mongoose");

var BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  code: {
    type: Number,
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: []
    }
  ]
}, {
  timestamps: true,
  emitIndexErrors: true
});

module.exports = mongoose.model("Book", BookSchema);
