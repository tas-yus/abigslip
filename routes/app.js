var express = require('express');
var router = express.Router();
var Order = require('../order');
var Course = require('../course');
var Student = require('../student');
var Excel = require('exceljs');
var path = require("path");
var multer = require("multer");
var fs = require("fs");
var async = require("async");

var workbook = new Excel.Workbook();
var processFormBody = multer({storage: multer.memoryStorage()}).single('file');

router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/api/orders/verify', (req, res) => {
  var queryObject = {
    type: req.body.type,
    code: String(req.body.code).trim(),
    courseCode: String(req.body.courseCode).trim(),
    date: req.body.date,
    price: req.body.price
  };
  Order.findOne(queryObject).then((order) => {
    if (!order) {
      return res.status(400).send({message: "ยังไม่เคยมีสลิปนี้ในระบบ"});
    }
    if (order.claimed) {
      return res.status(400).send({message: "มีสลิปที่เหมือนกันนี้ที่ถูกเคลมแล้ว", order});
    }
    if (!order.createdByServer) {
      return res.status(400).send({message: "มีสลิปที่เหมือนกันนี้ในระบบที่ถูกสร้างโดยพนักงาน", order});
    }
    Order.findByIdAndRemove(req.body.oldId, (err) => {
      if (err) {
        return res.status(400).send({message: "something's wrong"});
      }
      Student.findById(req.body.studentId, (err, student) => {
        if (err) {
          return res.status(400).send({message: "something's wrong"});
        }
        student.orders = student.orders.filter((o) => { return !o.equals(req.body.oldId) });
        student.orders.push(order._id);
        student.save((err) => {
          if (err) {
            return res.status(400).send({message: "something's wrong"});
          }
          order.claimed = true;
          order.claimedBy = req.body.studentId;
          order.claimedAt = new Date();
          order.save((err, order) => {
            if (err) {
              return res.status(400).send({message: "something's wrong"});
            }
            res.status(200).send({message: "ทำการแก้ไข และ match สลิปกับในระบบเรียบร้อย!", id: order._id});
          });
        });
      });
    })
  }).catch((err) => {
    console.log(err);
    res.status(400).send({message: "something's wrong"});
  });
});

router.post('/api/students/:id/courses', (req, res) => {
  Student.findById(req.params.id).then((student) => {
    if (!student) {
      return res.status(400).send({message: "ไม่มีนักเรียนที่ต้องการใน database"});
    }
    var queryObject = {
      type: req.body.type,
      code: String(req.body.code).trim(),
      courseCode: String(req.body.courseCode).trim(),
      price: req.body.price,
      date: req.body.date
    };
    Order.findOne(queryObject, (err, order) => {
      if (err) {
        console.log(err);
        return res.status(400).send({message: "something's wrong"});
      }
      if (order) {
        if (order.claimed) {
          return res.status(400).send({message: "สลิปใช้ไปแล้ว"});
        }
        order.claimed = true;
        order.claimedAt = new Date();
        order.claimedBy = student._id;
        order.save((err, order) => {
          if (err) {
            console.log(err);
            return res.status(400).send({message: "something's wrong"});
          }
          student.orders.push(order._id);
          student.save((err, student) => {
            if (err) {
              console.log(err);
              return res.status(400).send({message: "something's wrong"});
            }
            res.status(200).send({message: "course added to student", id: student._id});
          });

        });
      } else {
        var newOrder = new Order(queryObject);
        newOrder.claimedBy = student._id;
        newOrder.save((err, order) => {
          if (err) {
            console.log(err);
            return res.status(400).send({message: "something's wrong"});
          }
          student.orders.push(order._id);
          student.save((err, student) => {
            if (err) {
              console.log(err);
              return res.status(400).send({message: "something's wrong"});
            }
            res.status(200).send({message: "course added to student", id: student._id});
          });
        });
      }
    });
  }).catch((err) => {
    console.log(err);
    res.status(400).send({message: "something's wrong"});
  });
});

router.get("/api/students/search", (req, res) => {
  var limit = req.query.limit? Number(req.query.limit) : 3;
  var query = req.query.name?
  {
    $or:[{firstname:{$regex: String(req.query.name).trim(), $options: 'i'}},{lastname:{$regex: String(req.query.name).trim(), $options: 'i'}}],
  }
  : {};
  Student.find(query).select("firstname lastname _id").limit(limit).exec((err, students) => {
    if (err) {
      return res.status(400).send({message: "something's wrong "})
    }
    res.status(200).send(students);
  });
});

router.get('/api/students/:id', (req, res) => {
  Student.findById(req.params.id).populate("orders").then((student) => {
    if (!student) {
      return res.status(400).send({message: "no student found"});
    }
    res.status(200).send(student);
  }).catch((err) => {
    console.log(err);
    res.status(400).send({message: "something's wrong"});
  });
});


//
// router.post('/orders', (req, res) => {
//
// });

// router.get('/students', (req, res) => {
//
// });

router.post('/api/students', (req, res) => {
  var student = new Student ({
    firstname: String(req.body.firstname).trim(),
    lastname: String(req.body.lastname).trim(),
  });
  student.save((err, student) => {
    if (err) {
      console.log(err);
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send({message: "student added", id: student._id});
  });
});

router.get("/api/orders/search", (req, res) => {
  var limit = req.query.limit? Number(req.query.limit) : 5;
  var query;
  var date;
  if (req.query.date) {
    date = parseDate(req.query.date);
  }
  if (req.query.code && req.query.date) {
    query = {
      $and:[{code:{$regex: String(req.query.code).trim(), $options: 'i'}}, {date}],
    }
  } else if(req.query.code && !req.query.date) {
    query = {code: {$regex: String(req.query.code).trim(), $options: 'i'}};
  } else if (!req.query.code && req.query.date) {
    query = {date};
  } else {
    return res.status(400).send({message: "no code or date received"})
  }
  Order.find(query).populate({path: "claimedBy", select: "firstname lastname _id"}).limit(limit).exec((err, orders) => {
    if (err) {
      return res.status(400).send({message: "something's wrong "})
    }
    res.status(200).send(orders);
  });
});

router.post('/api/orders/parse', (req, res) => {
  var parseDate = (date, type) => {
    if (typeof date == "string") {
      var splittedDate = date.split("/");
      return new Date(Number(splittedDate[2]), Number(splittedDate[1])-1, Number(splittedDate[0]),
      0, 0, 0, 0);
    } else if (typeof date.getMonth === "function") {
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      0, 0, 0, 0);
    }
  }
  // if (req.body.type != 1 && req.body.type != 2 && req.body.type != 3 && req.body.type != 4) {
  //   return res.status(400).send({message: "โปรดระบุรูปแบบไฟล์"});
  // }
  var sheets = [{name: 'KTB', type: 1}, {name: 'GSB', type :2}, {name: 'CS', type: 3}];
  workbook.xlsx.readFile(path.join(__dirname, '../public/', req.body.filename)).then(function() {
    async.forEach((sheets), (sheet, cb) => {
      var worksheet = workbook.getWorksheet(sheet.name);
      if (!worksheet) {
        return cb();
      }
      worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
        if (!row.values[1]) return;
        if (rowNumber == 1 && (row.values[1] != "Confirm Code" || row.values[2] != "โทรศัพท์" || row.values[3] != "ค่าเรียน"
        || row.values[5] != "วันที่สมัคร" || row.values[6] != "รหัสคอร์ส")) {
          return res.status(400).send({message: "ไฟล์ผิด Format"});
        }
        if (rowNumber > 1) {
          var date = parseDate(row.values[5], sheet.type);
          if (sheet.type == 3) {
            var code = row.values[1];
          } else {
            var code = row.values[2].replace(/-/g,'');
          }
          code = String(code).trim();
          var courseCode = String(row.values[6]).trim();
          var price = row.values[3];
          var queryObject = {
            code, date, type: sheet.type, courseCode, price, claimed: false
          };
          Order.findOne(queryObject, (err, order) => {
            if (err) {
              console.log(err);
              return res.status(400).send({message: "something's wrong"});
            }
            if (order && order.createdByServer === true) return;
            if (order) {
              order.claimed = true;
              order.save((err, order) => {
                if (err) {
                  console.log(err);
                  return res.status(400).send({message: "something's wrong"})
                }
              });
            } else {
              queryObject.createdByServer = true;
              var newOrder = new Order(queryObject);
              newOrder.save((err, order) => {
                if (err) {
                  console.log(err);
                  return res.status(400).send({message: "something's wrong"})
                }
              });
            }
          });
        }
      });
      cb();
    }, (err) => {
      if (err) {
        console.log(err);
        return res.status(400).send({message: "something's wrong"})
      }
      res.status(200).send({message: "parsing completed"});
    });
  }).catch((err) => {
    console.log(err);
    res.status(400).send({message: "something's wrong"});
  });
});

router.get("/api/orders/:id", (req, res) => {
  Order.findById(req.params.id).populate({path: "claimedBy", select: "firstname lastname _id"}).exec((err, order) => {
    if (err) {
      console.log(err);
      return res.status(400).send({err, message: "Something went wrong"});
    }
    if (!order) {
      return res.status(400).send({message: "ไม่มีสลิปดังกล่าว"})
    }
    return res.status(200).send(order);
  });
});

router.post('/api/slips/upload', (req, res) => {
  processFormBody(req, res, function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({err, message: "Something went wrong"});
    }
    if (!req.file) {
      return res.status(400).send({message: "โปรดอัพโหลดไฟล์"});
    }
    if (extractFileType(req.file.originalname) != "xlsx") {
      return res.status(400).send({message: "โปรดอัพโหลดไฟล์ excel นามสกุล .xlsx หรือ .xls เท่านั้น"});
    }
    // request.file has the following properties of interest
    //      fieldname      - Should be 'uploadedphoto' since that is what we sent
    //      originalname:  - The name of the file the user uploaded
    //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
    //      buffer:        - A node Buffer containing the contents of the file
    //      size:          - The size of the file in bytes
    if (req.file.size >= 3*1024*1024) {
      return res.status(400).send("File too large");
    }
    // We need to create the file in the directory "images" under an unique name. We make
    // the original file name unique by adding a unique prefix with a timestamp.
    var timestamp = new Date().valueOf();
    var filename = 'U' +  String(timestamp) + req.file.originalname;
    fs.writeFile(path.join(__dirname, '../public', filename), req.file.buffer, function (err) {
      if (err) {
        console.log(err);
        return res.status(400).send({err, message: "Something went wrong"});
      }
      res.status(200).send({message: "File Uploaded!", filename});
    });
  });
});

function extractFileType(filename) {
  var array = filename.split(".");
  console.log(array);
  return array[array.length-1];
}

function parseDate (date) {
  if (typeof date == "string") {
    var splittedDate = date.split("-");
    return new Date(Number(splittedDate[0]), Number(splittedDate[1])-1, Number(splittedDate[2]),
    0, 0, 0, 0);
  }
}

router.post("/api/excel", (req, res) => {
  var from = parseDate(req.body.from);
  var to = parseDate(req.body.to);
  var type = req.body.type;
  var queryObject;
  if (type == 1) {
    queryObject = {
      $or:[{
        date: {
            $gte: from,
            $lt: to
        }
      },
      {
        claimedAt: {
          $gte: from,
          $lt: to
        }
      }
      ]
    };
  } else if (type == 2) {
    queryObject = {
      date: {
          $gte: from,
          $lt: to
      },
      claimed: false,
      createdByServer: false
    };
  } else if (type == 3) {
    queryObject = {
      date: {
          $gte: from,
          $lt: to
      },
      claimed: false,
      createdByServer: true
    };
  } else {
    return res.status(400).send({message: "ไม่ได้ระบุรูปแบบ excel ที่ต้องการ"});
  }
  Order.find(queryObject).populate({path: "claimedBy", select: "firstname lastname"}).exec((err, orders) => {
      var workbook = new Excel.Workbook();
      var worksheet = workbook.addWorksheet("Sheet1");
      var rows = [["วันที่", "รหัสโอน", "รหัสคอร์ส", "ราคา", "รูปแบบ", "เคลมแล้ว?", "วันที่เคลม", "ชื่อนักเรียน"]];
      var types = ["KTB", "GSB", "CS"];
      async.forEach(orders, (order, cb) => {
        var row = [order.date, order.code, order.courseCode, order.price, types[order.type-1]];
        if (order.claimed) {
          row.push("Yes");
          row.push(order.claimedAt);
          if (order.claimedBy) {
            row.push(`${order.claimedBy.firstname} ${order.claimedBy.lastname}`);
          }
        }
        rows.push(row);
        cb();
      }, (err) => {
        if (err) {
          return res.status(400).send({message: "something's wrong "})
        }
        worksheet.addRows(rows);
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + 'output.xlsx';
        workbook.xlsx.writeFile(path.join(__dirname, '../public/', filename)).then(function() {
          console.log("xlsx file is written.");
          res.status(200).send({message: 'xlsx file is written.', filename: filename});
        });
      });
    });
});

module.exports = router;
