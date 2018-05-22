var mongoose = require('mongoose');

var Userschema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    branch: {type: Number, required: true, unique: true},
    isAdmin: {type: Boolean, default: false},
    isMaster: {type: Boolean, default: false}
});

module.exports = mongoose.model('User', Userschema);
