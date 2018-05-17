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
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    default: []
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: []
  }]
}, { emitIndexErrors: true });

module.exports = mongoose.model("Student", StudentSchema);
