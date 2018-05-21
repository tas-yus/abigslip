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
var Book = require("./book");
var Order = require("./order");
var async = require("async");
var bcrypt = require("bcryptjs");
var User = require("./user");

var appRoutes = require('./routes/app');
var regRoutes = require('./routes/regular');
var adminRoutes = require('./routes/admin');
var bookRoutes = require('./routes/book');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
app.use('/', bookRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.render('index');
});

var books = [
  {title: 'Sci3A', code: 0},
  {title: 'Sci3B', code: 1},
  {title: 'Sci1', code: 2},
  {title: 'Sci2', code: 3},
  {title: 'Sci4', code: 4},
  {title: 'Sci5', code: 5},
  {title: 'Sci6', code: 6},
  {title: 'Sci7A', code: 7},
  {title: 'Sci7B', code: 8},
  {title: 'โครงสร้างอะตอม', code: 9},
  {title: 'พันธะเคมี', code: 10},
  {title: 'แนวโน้มตารางธาตุ', code: 11},
  {title: 'ดุลสมการ', code: 12},
  {title: 'กรด-เบส', code: 13},
  {title: 'ไฟฟ้าเคมี', code: 14},
  {title: 'สมดุลการละลาย', code: 15},
  {title: 'พอลิเมอร์', code: 16},
];

var courses = [
  {
    title: 'Sci1',
    price: '3500',
    numBook: 1,
    bookCodes: [2]
  },
  {
    title: 'Sci2',
    price: '3500',
    numBook: 1,
    bookCodes: [3]
  },
  {
    title: 'Sci4',
    price: '2000',
    numBook: 1,
    bookCodes: [4]
  },
  {
    title: 'Sci5',
    price: '2000',
    numBook: 1,
    bookCodes: [5]
  },
  {
    title: 'Sci6',
    price: '2000',
    numBook: 1,
    bookCodes: [6]
  },
  {
    title: 'โปร Sci 3',
    price: '6500',
    numBook: 2,
    bookCodes: [0, 1]
  },
  {
    title: 'โปร Sci 7',
    price: '6000',
    numBook: 2,
    bookCodes: [7, 8]
  },
  {
    title: 'Chem4A',
    price: '3500',
    numBook: 3,
    bookCodes: [9, 10, 11, 12]
  },
  {
    title: 'Chem5A',
    price: '3500',
    numBook: 2,
    bookCodes: [13, 14, 15, 16]
  },
  {
    title: 'ชดเชย private 1 ครั้ง',
    price: '250',
    numBook: 0,
  },
  {
    title: 'ชดเชย private 2 ครั้ง',
    price: '500',
    numBook: 0,
  },
  {
    title: 'ชดเชย private 3 ครั้งA',
    price: '750',
    numBook: 0,
  },
  {
    title: 'ชดเชย private 4 ครั้ง',
    price: '1000',
    numBook: 0,
  }
]

async.waterfall([
  function(callback) {
    Book.remove({}, (err) => {
      if (err) {
        console.log(err);
      }
      Course.remove({}, (err) => {
        if (err) {
          console.log(err);
        }
        callback();
      });
    });
  },
  function(callback) {
    async.forEach(books, (book, cb) => {
      Book.create(book, (err, book) => {
        if (err) {
          console.log(err);
        }
        console.log(`${book.title} created`);
        cb();
      });
    }, (err) => {
      if (err) {
        console.log(err);
      }
      callback()
    });
  },
  function(callback) {
    async.forEach(courses, (course, cb) => {
      Course.create(course, (err, course) => {
        if (err) {
          console.log(err);
        }
        async.forEach(course.bookCodes, (code, cb2) => {
          Book.findOne({code}, (err, book) => {
            if (err) {
              console.log(err);
            }
            course.books.push(book._id);
            cb2();
          });
        }, (err) => {
          if (err) {
            console.log(err);
          }
          course.save((err, course) => {
            if (err) {
              console.log(err);
            }
            console.log(`${course.title} created`);
            cb();
          });
        });
      });
    }, (err) => {
      if (err) {
        console.log(err);
      }
      callback();
    })
  }
]);

var users = [
  {
    username: 'abigcenteradmin',
    password: 'abig',
    branch: 0,
    isAdmin: true
  },
  {
    username: 'abigcenterbg',
    password: 'abig',
    branch: 1,
    isAdmin: false
  },
  {
    username: 'abigcenterbw',
    password: 'abig',
    branch: 2,
    isAdmin: false
  },
  {
    username: 'abigcenterbb',
    password: 'abig',
    branch: 3,
    isAdmin: false
  },
  {
    username: 'abigcenterbc',
    password: 'abig',
    branch: 4,
    isAdmin: false
  },
  {
    username: 'abigcenterbs',
    password: 'abig',
    branch: 5,
    isAdmin: false
  },
  {
    username: 'abigcenterbp',
    password: 'abig',
    branch: 6,
    isAdmin: false
  },
  {
    username: 'abigcenterbng',
    password: 'abig',
    branch: 7,
    isAdmin: false
  },
  {
    username: 'abigcenterbr',
    password: 'abig',
    branch: 8,
    isAdmin: false
  },
  {
    username: 'abigcenterbh',
    password: 'abig',
    branch: 9,
    isAdmin: false
  },
  {
    username: 'abigcenterbu',
    password: 'abig',
    branch: 10,
    isAdmin: false
  },
  {
    username: 'abigcenterbpk',
    password: 'abig',
    branch: 11,
    isAdmin: false
  },
  {
    username: 'abigcenterbn',
    password: 'abig',
    branch: 12,
    isAdmin: false
  },
  {
    username: 'abigcenterba',
    password: 'abig',
    branch: 13,
    isAdmin: false
  },
  {
    username: 'abigcenterbq',
    password: 'abig',
    branch: 14,
    isAdmin: false
  }
];

Order.remove({}).then(() => {
  console.log("orders removed");
}).catch((err) => {
  console.log(err);
});

Student.remove({}).then(() => {
  console.log("students removed");
}).catch((err) => {
  console.log(err);
});

User.remove({}).then(() => {
  async.forEach(users, (user, callback) => {
    user.password = bcrypt.hashSync(user.password, 10);
    var newUser = new User(user);
    newUser.save((err) => {
      if (err) {
        console.log(err);
      }
      console.log("user created");
      callback();
    })
  }, (err) => {
    if (err) {
      console.log(err);
    }
  });
}).catch((err) => {
  console.log(err);
});


module.exports = app;
