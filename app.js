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

var appRoutes = require('./routes/app');

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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.render('index');
});

// var courses = [
//   {
//     title: "Sci1",
//     code: "BG1001"
//   },
//   {
//     title: "Sci2",
//     code: "BG1002",
//   },
//   {
//     title: "Sci3",
//     code: "BG1003"
//   },
//   {
//     title: "Sci4",
//     code: "BG1004"
//   },
//   {
//     title: "Sci5",
//     code: "BG1005"
//   },
//   {
//     title: "Sci6",
//     code: "BG1006"
//   },
//   {
//     title: "Sci7",
//     code: "BG1007"
//   },
//   {
//     title: "Sci8",
//     code: "BG1008"
//   },
//   {
//     title: "Sci9",
//     code: "BG1009"
//   },
//   {
//     title: "Chem4A",
//     code: "BG1010"
//   },
//   {
//     title: "Chem4B",
//     code: "BG1010"
//   },
//   {
//     title: "Chem4C",
//     code: "BG1010"
//   },
//   {
//     title: "Chem5A",
//     code: "BG1011"
//   },
//   {
//     title: "Chem5B",
//     code: "BG1012"
//   },
//   {
//     title: "Chem5C",
//     code: "BG1013"
//   },
//   {
//     title: "Chem6A",
//     code: "BG1014"
//   },
//   {
//     title: "Chem6B",
//     code: "BG1015"
//   },
//   {
//     title: "Chem6C",
//     code: "BG1016"
//   },
//   {
//     title: "Org1",
//     code: "BG1017"
//   },
//   {
//     title: "Org2",
//     code: "BG1018"
//   },
//   {
//     title: "Org3",
//     code: "BG1019"
//   },
// ];

var orders = [
  {
    code: "01284396",
    courseCode: "BG1007",
    type: 1,
    date: new Date("2018-12-24 10:33:30"),
    claimedAt: new Date(),
    claimed: false,
    price: 3000
  },
  {
    code: "11284395",
    courseCode: "BG1011",
    type: 1,
    date: new Date(2018, 11, 24, 10, 33, 30, 0),
    price: 3000
  },
  {
    code: "018866396",
    courseCode: "BG1003",
    type: 2,
    date: new Date(2018, 11, 24, 10, 33, 30, 0),
    price: 3000
  },
  {
    code: "118866676",
    courseCode: "BG1004",
    type: 2,
    date: new Date(2018, 11, 24, 10, 33, 30, 0),
    price: 3000
  },
  {
    code: "21284",
    courseCode: "BG1001",
    type: 3,
    date: new Date(2018, 11, 24, 10, 33, 30, 0),
    price: 3000
  },
  {
    code: "01284",
    courseCode: "BG1002",
    type: 3,
    date: new Date(2018, 11, 24, 10, 33, 30, 0),
    price: 3000
  }
];

// Course.remove({}).then(() => {
//   console.log("courses removed");
//   return new Promise(function(resolve, reject) {
//     async.forEach(courses, (course, cb) => {
//       Course.create(course).then((course) => {
//         console.log(`${course.title} created`);
//         cb();
//       }).catch((err) => {
//         console.log(err);
//         reject(err);
//       });
//     }, (err) => {
//       if (err) return reject(err);
//       resolve();
//     });
//   });
// }).catch((err) => {
//   console.log(err);
// });

Order.remove({}).then(() => {
  console.log("orders removed");
  return new Promise(function(resolve, reject) {
    async.forEach(orders, (order, cb) => {
      Order.create(order).then((order) => {
        console.log(`Code: ${order.code}, Type: ${order.type} created`);
        cb();
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}).catch((err) => {
  console.log(err);
});

Student.remove({}).then(() => {
  console.log("students removed");
}).catch((err) => {
  console.log(err);
});


module.exports = app;
