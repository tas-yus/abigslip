var mongoose = require("mongoose");

var GroupSchema = new mongoose.Schema({
  title: {
    type: String,
    requires: true
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: []
    },
  ],
  price: {
    type: Number,
    requires: true
  },
  courseCodes: [
    {
      type: Number,
      default: []
    }
  ],
  code: {
    type: String,
    requires: true,
  },
  numUse: {
    type: Number,
    default: 0
  }
}, { emitIndexErrors: true });

module.exports = mongoose.model("Group", GroupSchema);
