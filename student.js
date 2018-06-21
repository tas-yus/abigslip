var mongoose = require("mongoose");

var StudentSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: []
  }],
  lastOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  createdBy: {
    type: Number
  }
}, {
  timestamps: true,
  emitIndexErrors: true
});

module.exports = mongoose.model("Student", StudentSchema);
