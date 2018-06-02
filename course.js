var mongoose = require("mongoose");

var CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      default: []
    },
  ],
  bookCodes: [
    {
      type: Number,
      default: []
    }
  ],
  code: {
    type: Number,
  },
  numBook: {
    type: Number,
    required: true
  },
  strict: {
    type: Boolean,
    default: true
  },
  numUse: {
    type: Number,
    default: 0
  }
}, { emitIndexErrors: true });

module.exports = mongoose.model("Course", CourseSchema);
