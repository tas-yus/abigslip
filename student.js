var mongoose = require("mongoose");

var StudentSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
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
