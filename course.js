var mongoose = require("mongoose");

var CourseSchema = new mongoose.Schema({
  title: String,
  code: String
}, { emitIndexErrors: true });

module.exports = mongoose.model("Course", CourseSchema);
