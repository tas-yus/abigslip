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
var settingRoutes = require('./routes/setting');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
mongoose.connect("mongodb://localhost:27017/abigslip");
// mongoose.connect("mongodb://test:test@ds016298.mlab.com:16298/abigslip");
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
app.use('/', settingRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.render('index');
});

var books = [
  {title: 'J100', code: 0},
  {title: 'J200', code: 1},
  {title: 'J300', code: 2},
  {title: 'J400', code: 3},
  {title: 'S100', code: 4},
  {title: 'S200', code: 5},
  {title: 'S250', code: 6},
  {title: 'S300', code: 7},
  {title: 'S350', code: 8},
  {title: 'S400', code: 9},
  {title: 'S500', code: 10},
  {title: 'S550', code: 11},
  {title: 'S600', code: 12},
  {title: 'S710', code: 13},
  {title: 'S800', code: 14},
  {title: 'C411', code: 15},
  {title: 'C412', code: 16},
  {title: 'C413', code: 17},
  {title: 'C421', code: 18},
  {title: 'C422', code: 19},
  {title: 'C423', code: 20},
  {title: 'C430', code: 21},
  {title: 'C511', code: 22},
  {title: 'C512', code: 23},
  {title: 'C513', code: 24},
  {title: 'C521', code: 25},
  {title: 'C522', code: 26},
  {title: 'C523', code: 27},
  {title: 'C531', code: 28},
  {title: 'C532', code: 29},
  {title: 'C533', code: 30},
  {title: 'C540', code: 31},
  {title: 'E100', code: 32},
  {title: 'E200', code: 33},
  {title: 'E301', code: 34},
  {title: 'E303', code: 35},
  {title: 'E304', code: 36},
  {title: 'E400', code: 37},
  {title: 'E402', code: 38},
  {title: 'E710', code: 39},
  {title: 'E720', code: 40},
  {title: 'M600', code: 41},
  {title: 'M700', code: 42},
  {title: 'M800', code: 43},
];

var courses = [
  {
    title: 'Promotion Sci Sci 2A,B / 5A,B',
    price: 6000,
    code: 'BA6000',
    numBook: 2,
    bookCodes: [5,6,10,11]
  },
  {
    title: 'Promotion Sci 3A,3B',
    price: 6500,
    code: 'BA6500',
    numBook: 2,
    bookCodes: [7,8]
  },
  {
    title: 'Promotion J3,J4',
    price: 6000,
    code: 'BJ6000',
    numBook: 2,
    bookCodes: [2,3]
  },
  {
    title: 'ค่าธรรมเนียมเปลี่ยนคอร์สสด เป็น Private',
    price: 1000,
    code: 'BG0001',
    numBook: 0
  },
  {
    title: 'มิดไมล์ 1 คอร์ส',
    price: 1000,
    code: 'BG1000',
    numBook: 3,
    bookCodes: [41, 42, 43]
  },
  {
    title: 'ชดเชย private 1 ครั้ง',
    price: 250,
    code: 'BG1111',
    numBook: 0,
  },
  {
    title: 'ชดเชย private 2 ครั้ง',
    price: 500,
    code: 'BG2222',
    numBook: 0,
  },
  {
    title: 'ชดเชย private 3 ครั้ง',
    price: 750,
    code: 'BG3333',
    numBook: 0,
  },
  {
    title: 'ชดเชย private 4 ครั้ง',
    price: 1000,
    code: 'BG4444',
    numBook: 0,
  },
  {
    title: 'เลือกได้ 2 ใน 6',
    price: 6500,
    code: 'BG8882',
    numBook: 2
  },
  {
    title: 'เลือกได้ 3 ใน 9',
    price: 9000,
    code: 'BG8883',
    numBook: 3,
    bookCodes: [9, 10, 11, 12]
  },
  {
    title: 'Private 1 ใน 3',
    price: 3500,
    code: 'BG9999',
    numBook: 1,
    bookCodes: [13, 14, 15, 16]
  },
  {
    title: 'Mini Private',
    price: 1200,
    code: 'BG1200',
    numBook: 2,
    bookCodes: [13, 14, 15, 16]
  },
  {
    title: 'Mini x2 Private',
    price: 2400,
    code: 'BG2400',
    numBook: 2,
    bookCodes: [13, 14, 15, 16]
  },
  {
    title: 'Sci 5A (สด)',
    price: 3000,
    code: 'BG0500',
    numBook: 2,
    bookCodes: [13, 14, 15, 16]
  },
  {
    title: 'Sci 4A (สด)',
    price: 3000,
    code: 'BG0400',
    numBook: 2,
    bookCodes: [13, 14, 15, 16]
  },
  {
    title: 'Junior 1 (สด)',
    price: 3000,
    code: 'BG6100',
    numBook: 2,
    bookCodes: [13, 14, 15, 16]
  },
  {
    title: 'Sci 1A (สด)',
    price: 3000,
    code: 'BG0100',
    numBook: 2,
    bookCodes: [13, 14, 15, 16]
  },
  {
    title: 'มิดไมล์ Gifted (สด+Private)',
    price: 1285,
    code: 'BG1285',
    numBook: 2,
    bookCodes: [13, 14, 15, 16]
  },
  {
    title: 'มิดไมล์ Gifted (สด)',
    price: 985,
    code: 'BG0985',
    numBook: 2,
    bookCodes: [13, 14, 15, 16]
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
    username: 'abigcentermaster',
    password: 'abig',
    branch: -1,
    isAdmin: true,
    isMaster: true
  },
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
