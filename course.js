var mongoose = require("mongoose");

var CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true
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
  price: {
    type: Number,
    require: true
  },
  numBook: {
    type: Number,
    require: true
  }
}, { emitIndexErrors: true });

module.exports = mongoose.model("Course", CourseSchema);
