var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var fs = require("fs");
var Course = require("./course");
var Student = require("./student");
var Order = require("./order");
var async = require("async");
var bcrypt = require("bcryptjs");
var User = require("./user");

var appRoutes = require('./routes/app');
var regRoutes = require('./routes/regular');
var adminRoutes = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
// mongoose.connect("mongodb://localhost:27017/abigslip");
mongoose.connect("mongodb://test:test@ds016298.mlab.com:16298/abigslip");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
});

app.use('/', appRoutes);
app.use('/', regRoutes);
app.use('/', adminRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.render('index');
});

// var users = [
//   {
//     username: 'abigcenteradmin',
//     password: 'abig',
//     branch: 0,
//     isAdmin: true
//   },
//   {
//     username: 'abigcenterbg',
//     password: 'abig',
//     branch: 1,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterbw',
//     password: 'abig',
//     branch: 2,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterbb',
//     password: 'abig',
//     branch: 3,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterbc',
//     password: 'abig',
//     branch: 4,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterbs',
//     password: 'abig',
//     branch: 5,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterbp',
//     password: 'abig',
//     branch: 6,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterbng',
//     password: 'abig',
//     branch: 7,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterbr',
//     password: 'abig',
//     branch: 8,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterbh',
//     password: 'abig',
//     branch: 9,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterbu',
//     password: 'abig',
//     branch: 10,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterbpk',
//     password: 'abig',
//     branch: 11,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterbn',
//     password: 'abig',
//     branch: 12,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterba',
//     password: 'abig',
//     branch: 13,
//     isAdmin: false
//   },
//   {
//     username: 'abigcenterbq',
//     password: 'abig',
//     branch: 14,
//     isAdmin: false
//   }
// ];
//
// Order.remove({}).then(() => {
//   console.log("orders removed");
// }).catch((err) => {
//   console.log(err);
// });
//
// Student.remove({}).then(() => {
//   console.log("students removed");
// }).catch((err) => {
//   console.log(err);
// });
//
// User.remove({}).then(() => {
//   async.forEach(users, (user, callback) => {
//     user.password = bcrypt.hashSync(user.password, 10);
//     var newUser = new User(user);
//     newUser.save((err) => {
//       if (err) {
//         console.log(err);
//       }
//       console.log("user created");
//       callback();
//     })
//   }, (err) => {
//     if (err) {
//       console.log(err);
//     }
//   });
// }).catch((err) => {
//   console.log(err);
// });


module.exports = app;
