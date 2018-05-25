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
var Group = require("./group");

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

// seedDB();

function seedDB() {
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
    // {title: 'E100', code: 32},
    {title: 'E101', code: 33},
    {title: 'E102', code: 34},
    // {title: 'E200', code: 35},
    {title: 'E201', code: 36},
    {title: 'E202', code: 37},
    {title: 'E301', code: 38},
    {title: 'E302', code: 39},
    {title: 'E303', code: 40},
    {title: 'E304', code: 41},
    {title: 'E400', code: 42},
    {title: 'E402', code: 43},
    {title: 'E710', code: 44},
    {title: 'E720', code: 45},
    {title: 'M600', code: 46},
    {title: 'M700', code: 47},
    {title: 'M800', code: 48},
  ];

  var courses = [
    {
      title: 'Junior',
      code: 1,
      numBook: 1,
      bookCodes: [0, 1, 2, 3]
    },
    {
      title: 'Sci',
      code: 2,
      numBook: 1,
      bookCodes: [4,5,6,7,8,9,10,11,12,13,14]
    },
    {
      title: 'เคมีแข่งขัน',
      code: 3,
      numBook: 1,
      bookCodes: [21,31]
    },
    {
      title: 'Organic Chem',
      code: 4,
      numBook: 2,
      bookCodes: [44,45]
    },
    {
      title: 'เคมีม.ปลาย',
      code: 5,
      numBook: 4,
      bookCodes: [15,16,17,18,19,20,22,23,24,25,26,27,28,29,30]
    },
    {
      title: 'Entrance',
      code: 6,
      numBook: 4,
      bookCodes: [33, 34, 36, 37, 38, 39, 40, 41, 42, 43]
    },
    {
      title: 'Private 2 คอร์ส',
      code: 7,
      numBook: 6,
      bookCodes: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
      31,33,34,36,37,38,39,40,41,42,43,44,45],
      strict: false
    },
    {
      title: 'Private 3 คอร์ส',
      code: 8,
      numBook: 9,
      bookCodes: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
      31,33,34,36,37,38,39,40,41,42,43,44,45],
      strict: false
    },
    {
      title: 'J3 + J4',
      code: 9,
      numBook: 2,
      bookCodes: [2, 3]
    },
    {
      title: 'Sci2A + 2B',
      code: 10,
      numBook: 2,
      bookCodes: [5, 6]
    },
    {
      title: 'Sci5A + 5B',
      code: 11,
      numBook: 2,
      bookCodes: [10, 11]
    },
    {
      title: 'Sci3A + 3B',
      code: 12,
      numBook: 2,
      bookCodes: [7,8]
    },
    {
      title: 'มิดไมล์',
      code: 13,
      numBook: 3,
      bookCodes: [46, 47, 48]
    },
    {
      title: 'Chem4A',
      code: 14,
      numBook: 3,
      bookCodes: [15, 16, 17]
    },
    {
      title: 'Chem5A',
      code: 15,
      numBook: 3,
      bookCodes: [22, 23, 24]
    },
    {
      title: 'Entrance1',
      code: 16,
      numBook: 2,
      bookCodes: [33, 34]
    },
    {
      title: 'Entrance2',
      code: 17,
      numBook: 2,
      bookCodes: [36, 37]
    },
    {
      title: 'Junior 4',
      code: 19,
      numBook: 1,
      bookCodes: [3]
    },
    {
      title: '9 วิชาสามัญ',
      code: 20,
      numBook: 4,
      bookCodes: [38,39,40,41]
    },
    {
      title: 'Sci 2B',
      code: 21,
      numBook: 1,
      bookCodes: [6]
    },
    {
      title: 'Chem 5B',
      code: 22,
      numBook: 3,
      bookCodes: [22,23,24]
    },
    {
      title: 'Sci 5A',
      code: 23,
      numBook: 1,
      bookCodes: [10]
    },
    {
      title: 'Sci 3B',
      code: 24,
      numBook: 1,
      bookCodes: [8]
    },
    {
      title: 'Sci 2A',
      code: 25,
      numBook: 1,
      bookCodes: [5]
    },
    {
      title: 'Junior 2',
      code: 26,
      numBook: 1,
      bookCodes: [1]
    },
    {
      title: 'PAT 2',
      code: 27,
      numBook: 2,
      bookCodes: [42,43]
    },
    {
      title: 'Junior 1',
      code: 28,
      numBook: 1,
      bookCodes: [0]
    },
    {
      title: 'Sci 1A',
      code: 29,
      numBook: 1,
      bookCodes: [4]
    },
    {
      title: 'Mini Private 2 คอร์ส',
      code: 30,
      numBook: 2,
      bookCodes: [15,16,17,18,19,20,22,23,24,25,26,27,28,29,30,38,39,40,41,42,43],
    },
    {
      title: 'Sci 4A',
      code: 31,
      numBook: 1,
      bookCodes: [9]
    },
    {
      title: 'Mini Private 1 คอร์ส',
      code: 32,
      numBook: 1,
      bookCodes: [15,16,17,18,19,20,22,23,24,25,26,27,28,29,30,38,39,40,41,42,43],
    },
  ];

  var groups = [
    {
      title: 'Private 1 คอร์ส',
      price: 3500,
      code: 'BG9999',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Private 2 คอร์ส',
      price: 7000,
      code: 'BG9992',
      courseCodes: [7]
    },
    {
      title: 'Private 3 คอร์ส',
      price: 10500,
      code: 'BG9993',
      courseCodes: [8]
    },
    {
      title: 'Private คอร์สเลือกได้ 2 ใน 6',
      price: 6500,
      code: 'BG8882',
      courseCodes: [7]
    },
    {
      title: 'Private คอร์สเลือกได้ 3 ใน 9',
      price: 9000,
      code: 'BG8883',
      courseCodes: [8]
    },
    {
      title: 'Mini Private',
      price: 1200,
      code: 'BG1200',
      courseCodes: [32]
    },
    {
      title: 'Mini Private x2',
      price: 2400,
      code: 'BG2400',
      courseCodes: [30]
    },
    {
      title: 'Promotion J3 + J4',
      price: 6000,
      code: 'BJ6000',
      courseCodes: [9]
    },
    {
      title: 'Promotion Sci Sci 2A,B / 5A,B',
      price: 6000,
      code: 'BA6000',
      courseCodes: [10, 11]
    },
    {
      title: 'Promotion Sci 3A,3B',
      price: 6500,
      code: 'BA6500',
      courseCodes: [12]
    },
    {
      title: 'Gold Card ลด 500',
      price: 3000,
      code: 'GC3000',
      courseCodes: [1,2,3,4,16,17]
    },
    {
      title: 'มิดไมล์ Private',
      price: 1000,
      code: 'BG1000',
      courseCodes: [13]
    },
    {
      title: 'Pro ทุกคอร์ส 3300 เฉพาะสาขา ตจว',
      price: 3300,
      code: 'BF3300',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Grand Opening อยุธยา',
      price: 3000,
      code: 'BA3000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Grand Opening สาขาสยาม',
      price: 3000,
      code: 'BQ3000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Sci 5A (สด)',
      price: 3000,
      code: 'BG0500',
      courseCodes: [23]
    },
    {
      title: 'Sci 3B (สด)',
      price: 3000,
      code: 'BS3500',
      courseCodes: [24]
    },
    {
      title: 'Sci 2A (สด)',
      price: 3000,
      code: 'BS2000',
      courseCodes: [25]
    },
    {
      title: 'Junior 2 (สด)',
      price: 3000,
      code: 'BJ2000',
      courseCodes: [26]
    },
    {
      title: 'Chem 4A (สด)',
      price: 3000,
      code: 'BC4100',
      courseCodes: [14]
    },
    {
      title: 'Chem 5A (สด)',
      price: 3000,
      code: 'BC5100',
      courseCodes: [15]
    },
    {
      title: 'Entrance 1 (สด)',
      price: 3000,
      code: 'BE1000',
      courseCodes: [16]
    },
    {
      title: 'Entrance 2 (สด)',
      price: 3000,
      code: 'BE2000',
      courseCodes: [17]
    },
    {
      title: 'Promotion ม.ปลาย 2500',
      price: 2500,
      code: 'BX2500',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'ค่าธรรมเนียมเปลี่ยนคอร์สสด เป็น Private',
      price: 1000,
      code: 'BG0001',
    },
    {
      title: 'Private บัตรทอง 2000',
      price: 2000,
      code: 'BG2000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'โปร อุบลฯ 2500',
      price: 2500,
      code: 'UB2500',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'โปร สระบุรี 2500',
      price: 2500,
      code: 'SB2500',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'PRO.RAINY SEASON',
      price: 2800,
      code: 'BG2800',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Junior 4 (สด)',
      price: 3000,
      code: 'BG6400',
      courseCodes: [19]
    },
    {
      title: 'ตะลุยโจทย์ 9 วิชาสามัญ 60 (สด)',
      price: 1000,
      code: 'BG9000',
      courseCodes: [20]
    },
    {
      title: 'Sci 2B (สด)',
      price: 3000,
      code: 'BG2500',
      courseCodes: [21]
    },
    {
      title: 'Chem 5B (สด)',
      price: 3000,
      code: 'BG5200',
      courseCodes: [22]
    },
    {
      title: 'Gift Voucher เคมี 9 วิชาสามัญ',
      price: 3000,
      code: 'BG3030',
      courseCodes: [20]
    },
    {
      title: 'PAT 2 (สด)',
      price: 1000,
      code: 'BG4020',
      courseCodes: [27]
    },
    {
      title: 'โปร สระบุรี 2000',
      price: 2000,
      code: 'SB2000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'เคมี 9 วิชา 2800',
      price: 2800,
      code: 'BT2800',
      courseCodes: [20]
    },
    {
      title: 'PAT 2 2400',
      price: 2400,
      code: 'BT2400',
      courseCodes: [27]
    },
    {
      title: 'BX2800',
      price: 2800,
      code: 'BX2800',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'โปรฯ Summer สระบุรี',
      price: 2500,
      code: '2500SB',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'โปรฯ Summer อุบลฯ',
      price: 2500,
      code: '2500UB',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'โปรฯ Summer อยุธยา',
      price: 2500,
      code: '2500AB',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'โปรฯ ลงเพิ่มลดเพิ่ม',
      price: 2000,
      code: 'BT2000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Gift Voucher ลดราคา 500 บาท',
      price: 3000,
      code: 'VC500',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Gift Voucher ลดราคา 1000 บาท',
      price: 2500,
      code: 'VC1000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Gift Voucher ลดราคา 1500 บาท',
      price: 2000,
      code: 'VC1500',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Gift Voucher ลดราคา 2000 บาท',
      price: 1500,
      code: 'VC2000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Gift Voucher ลดราคา 2500 บาท',
      price: 1000,
      code: 'VC2500',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Gift Voucher ลดราคา 3000 บาท',
      price: 500,
      code: 'VC3000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Gift Voucher ลดราคา 3500 บาท',
      price: 0,
      code: 'VC3500',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'ส่วนต่างโปรฯ',
      price: 700,
      code: 'BG0700'
    },
    {
      title: 'ส่วนลดเด็กเก่ง 1000',
      price: 2500,
      code: 'GT1000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'ส่วนลดเด็กเก่ง BS',
      price: 2500,
      code: 'GS1000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'ส่วนลดเด็กเก่ง BU',
      price: 2500,
      code: 'GU1000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'ส่วนลดเด็กเก่ง BA',
      price: 2500,
      code: 'GA1000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Sci 4A (สด) 2561',
      price: 3000,
      code: 'BG0400',
      courseCodes: [31]
    },
    {
      title: 'โปรฯ เคมี TCAS',
      price: 7500,
      code: 'BG7500',
      courseCodes: [16,17,20,27]
    },
    {
      title: 'ส่วนต่าง TCAS 500',
      price: 500,
      code: 'TC500',
      courseCodes: [16,17,20,27]
    },
    {
      title: 'ส่วนต่าง TCAS 1000',
      price: 1000,
      code: 'TC1000',
      courseCodes: [16,17,20,27]
    },
    {
      title: 'ส่วนต่าง TCAS 4000',
      price: 4000,
      code: 'TC4000',
      courseCodes: [16,17,20,27]
    },
    {
      title: 'ส่วนต่าง TCAS 5000',
      price: 5000,
      code: 'TC5000',
      courseCodes: [16,17,20,27]
    },
    {
      title: 'ส่วนต่าง TCAS 2000',
      price: 2000,
      code: 'TC2000',
      courseCodes: [16,17,20,27]
    },
    {
      title: 'ส่วนต่าง TCAS 4700',
      price: 4700,
      code: 'TC4700',
      courseCodes: [16,17,20,27]
    },
    {
      title: 'ส่วนต่าง TCAS 2500',
      price: 2500,
      code: 'TC2500',
      courseCodes: [16,17,20,27]
    },
    {
      title: 'ส่วนต่าง TCAS 1900',
      price: 1900,
      code: 'TC1900',
      courseCodes: [16,17,20,27]
    },
    {
      title: 'Junior 1 (สด) 2561',
      price: 3000,
      code: 'BG6100',
      courseCodes: [28]
    },
    {
      title: 'Sci 1A (สด) 2561',
      price: 3000,
      code: 'BG0100',
      courseCodes: [29]
    },
    {
      title: 'Back to school BS',
      price: 1800,
      code: 'BS1800',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Back to school BU',
      price: 1800,
      code: 'BU1800',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Back to school BPK',
      price: 2000,
      code: 'PK2000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Back to school BA',
      price: 2000,
      code: 'BA2000',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Back to school BN',
      price: 2800,
      code: 'BN2800',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'Back to school BH',
      price: 2800,
      code: 'BH2800',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'ส่วนลดเด็กเก่ง BR2560',
      price: 3000,
      code: 'GR500',
      courseCodes: [1,2,3,4,5,16,17,20,27]
    },
    {
      title: 'ชดเชย private 1 ครั้ง',
      price: 250,
      code: 'BG1111',
    },
    {
      title: 'ชดเชย private 2 ครั้ง',
      price: 500,
      code: 'BG2222',
    },
    {
      title: 'ชดเชย private 3 ครั้ง',
      price: 750,
      code: 'BG3333',
    },
    {
      title: 'ชดเชย private 4 ครั้ง',
      price: 1000,
      code: 'BG4444',
    },
    {
      title: 'มิดไมล์ Private FREE',
      price: 0,
      code: 'FREE',
      courseCodes: [13]
    },
  ];

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
          Group.remove({}, (err) => {
            if (err) {
              console.log(err);
            }
            callback();
          });
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
        callback()
      });
    },
    function(callback) {
      async.forEach(groups, (group, cb) => {
        Group.create(group, (err, group) => {
          if (err) {
            console.log(err);
          }
          async.forEach(group.courseCodes, (code, cb2) => {
            Course.findOne({code}, (err, course) => {
              if (err) {
                console.log(err);
              }
              group.courses.push(course._id);
              cb2();
            });
          }, (err) => {
            if (err) {
              console.log(err);
            }
            group.save((err, course) => {
              if (err) {
                console.log(err);
              }
              console.log(`${group.title} created`);
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
    // {
    //   username: 'abigcentermaster',
    //   password: 'abig',
    //   branch: -2,
    //   isAdmin: true,
    //   isMaster: true,
    //   isSetting: true
    // },
    {
      username: 'abigcentersetting',
      password: 'abig',
      branch: -1,
      isAdmin: false,
      isSetting: true
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
}

module.exports = app;
