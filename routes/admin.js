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
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var User = require("../user");
var Book = require("../book");
var Group = require("../group");

var workbook = new Excel.Workbook();
var processFormBody = multer({storage: multer.memoryStorage()}).single('file');

function allowAdmin (req, res, next) {
  if (!jwt.decode(req.query.token).user.isAdmin) {
    return res.status(401).send({message: "Unauthorized"});
  }
  next();
};

router.use('/api/', (req, res, next) => {
  jwt.verify(req.query.token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).send({message: "Unauthorized"});
    }
    next();
  });
});

router.get('/api/orders', allowAdmin, (req, res) => {
  var limit = req.query.limit? Number(req.query.limit) : 100;
  var daysInMonth = function (month, year) {
      return new Date(year, month, 0).getDate();
  }
  var from = new Date(req.query.year, req.query.month, 1);
  var to = new Date(req.query.year, req.query.month, daysInMonth(Number(req.query.month)+1, req.query.year) + 1);
  var type = req.query.type;
  var queryObject = {
    date: {
        $gte: from,
        $lt: to
    },
    void: false
  };
  if (type == 8) {
    queryObject.void = true;
  } else if (type == 7) {
    queryObject.claimed = false;
  } else if (type == 6) {
    queryObject.refund = {$ne:null}
  } else if (type != 0) {
    queryObject.type = type;
  }
  Order.find(queryObject).populate("claimedBy").sort({date: -1}).limit(limit).exec((err, orders) => {
    if (err) {
      return res.status(400).send({message: "something's wrong "});
    }
    Order.count(queryObject, (err, count) => {
      if (err) {
        return res.status(400).send({message: "something's wrong "});
      }
      res.status(200).send({orders, count});
    });
  });
});

router.post('/api/orders/:id/verify', allowAdmin, (req, res) => {
  Group.findById(req.body.group, (err, group) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    if (req.body.type == 4) {
      var queryObject = {
        type: req.body.type,
        courseCode: String(group.code).trim(),
        date: parseDate(req.body.date),
        price: group.price,
        void: false
      };
    } else if (req.body.type != 6) {
      var queryObject = {
        type: req.body.type,
        code: String(req.body.code).trim(),
        courseCode: String(group.code).trim(),
        date: parseDate(req.body.date),
        price: group.price,
        void: false
      };
    } else {
      var queryObject = {
        type: req.body.type,
        date: parseDate(req.body.date),
        price: req.body.price,
        void: false
      };
    }
    Order.findOne(queryObject).then((order) => {
      if (!order) {
        Order.findByIdAndUpdate(req.params.id, {void: true}, (err, oldOrder) => {
          if (err) {
            return res.status(400).send({message: "something's wrong"});
          }
          var newOrder = new Order(queryObject);
          newOrder.claimedBy = req.body.studentId;
          newOrder.claimedAt = oldOrder.claimedAt;
          newOrder.branch = oldOrder.branch;
          newOrder.books = oldOrder.books;
          newOrder.group = oldOrder.group;
          newOrder.course = oldOrder.course;
          newOrder.save((err, order) => {
            if (err) {
              return res.status(400).send({message: "something's wrong"});
            }
            Student.findById(req.body.studentId, (err, student) => {
              if (err) {
                return res.status(400).send({message: "something's wrong"});
              }
              student.orders.push(order._id);
              student.lastOrder = order._id;
              student.save((err) => {
                if (err) {
                  return res.status(400).send({message: "something's wrong"});
                }
                async.forEach(oldOrder.books, (book, callback) => {
                  Book.findByIdAndUpdate(book, { $push: { orders: order._id  }}, (err, book) => {
                    if (err) {
                      return res.status(400).send({message: "something's wrong"});
                    }
                    callback();
                  });
                }, (err) => {
                  if (err) {
                    return res.status(400).send({message: "something's wrong"});
                  }
                  res.status(200).send({message: "ทำการแก้ไขสลิปในระบบเรียบร้อย!", id: order._id});
                });
              });
            });
          });
        });
      } else {
        if (order.claimed) {
          return res.status(400).send({message: "มีสลิปที่เหมือนกันนี้ที่ถูกเคลมแล้ว", order});
        }
        if (!order.createdByServer) {
          return res.status(400).send({message: "มีสลิปที่เหมือนกันนี้ในระบบที่ถูกสร้างโดยพนักงาน", order});
        }
        Order.findByIdAndUpdate(req.body.oldId, {void: true, matchedWith: order._id}, (err, oldOrder) => {
          if (err) {
            return res.status(400).send({message: "something's wrong"});
          }
          Student.findById(req.body.studentId, (err, student) => {
            if (err) {
              return res.status(400).send({message: "something's wrong"});
            }
            student.orders.push(order._id);
            student.lastOrder = order._id;
            student.save((err) => {
              if (err) {
                return res.status(400).send({message: "something's wrong"});
              }
              order.claimed = true;
              order.claimedBy = req.body.studentId;
              order.claimedAt = new Date();
              order.branch = oldOrder.branch;
              order.books = oldOrder.books;
              order.group = oldOrder.group;
              order.course = oldOrder.course;
              async.forEach(oldOrder.books, (book, callback) => {
                Book.findByIdAndUpdate(book, { $push: { orders: order._id  }}, (err, book) => {
                  if (err) {
                    return res.status(400).send({message: "something's wrong"});
                  }
                  callback();
                });
              }, (err) => {
                if (err) {
                  return res.status(400).send({message: "something's wrong"});
                }
                order.save((err, order) => {
                  if (err) {
                    return res.status(400).send({message: "something's wrong"});
                  }
                  res.status(200).send({message: "ทำการแก้ไข และ match สลิปกับในระบบเรียบร้อย!", id: order._id});
                });
              });
            });
          });
        });
      }
    }).catch((err) => {
      console.log(err);
      res.status(400).send({message: "something's wrong"});
    });
  });
});

router.get("/api/orders/search", allowAdmin, (req, res) => {
  var limit = req.query.limit? Number(req.query.limit) : 100;
  var query;
  var date;
  if (req.query.date) {
    date = parseDate(req.query.date);
  }
  var code = String(req.query.code).replace(/[^\w\s]/gi, '').trim();
  if (req.query.code && req.query.date) {
    query = {
      $and:[{code:{$regex: code, $options: 'i'}}, {date}],
    }
  } else if(req.query.code && !req.query.date) {
    query = {code: {$regex: code, $options: 'i'}};
  } else if (!req.query.code && req.query.date) {
    query = {date};
  } else {
    return res.status(400).send({message: "no code or date received"})
  }
  Order.find(query).populate({path: "claimedBy", select: "firstname lastname _id"}).limit(limit).exec((err, orders) => {
    if (err) {
      return res.status(400).send({message: "something's wrong "})
    }
    if (orders.length === 0) {
      return res.status(400).send({message: "ไม่มีสลิปนี้ในระบบ"});
    }
    res.status(200).send(orders);
  });
});

router.post('/api/orders/parse', allowAdmin, (req, res) => {
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
  var sheets = [{name: 'KTB', type: 1}, {name: 'GSB', type :2}, {name: 'CS', type: 3}, {name: 'KTC', type: 4}];
  var countMatched = 0;
  var countAdded = 0;
  var corrupted = false;
  var readSheets = [];
  var claimedOrders = [];
  workbook.xlsx.readFile(path.join(__dirname, '../public/', req.body.filename)).then(function() {
    async.forEachSeries((sheets), (sheet, callback) => {
      var worksheet = workbook.getWorksheet(sheet.name);
      if (!worksheet) {
        corrupted = true;
        return callback();
      }
      var count = 1;
      worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
        if (worksheet.actualRowCount == 1) {
          return callback();
        }
        if (!row.values[1]) {
          count++;
          return;
        }
        if (rowNumber == 1 && (row.values[1] != "Confirm Code" || row.values[2] != "โทรศัพท์" || row.values[3] != "ค่าเรียน"
        || row.values[5] != "วันที่สมัคร" || row.values[6] != "รหัสคอร์ส")) {
          corrupted = true;
          return callback();
        }
        if (rowNumber > 1 && !corrupted) {
          if (rowNumber == 2) {
            readSheets.push(sheet.name);
          }
          var date = parseDate(row.values[5], sheet.type);
          if (sheet.type == 3) {
            var code = row.values[1];
          } else if (sheet.type != 4)  {
            var code = row.values[2];
          }
          code = (String(code).replace(/[^\w\s]/gi, '')).trim();
          var courseCode = String(row.values[6]).trim();
          var price = row.values[3];
          var queryObject = {
            date, type: sheet.type, price, courseCode
          };
          if (sheet.type != 4) {
            queryObject.code = code;
          }
          Order.find(queryObject, (err, orders) => {
            if (err) {
              console.log(err);
              return res.status(400).send({message: "something's wrong"});
            }
            orders = orders.filter((o) => {return !claimedOrders.includes(o._id.toString()) && !o.void });
            var order = orders[0];
            if (order && order.createdByServer === true) {
              count++;
              if (count === worksheet.actualRowCount) {
                return callback();
              }
              return;
            }
            if (order && order.claimed === true) {
              count++;
              if (count === worksheet.actualRowCount) {
                return callback();
              }
              return;
            }
            countAdded++;
            if (order && !claimedOrders.includes(order._id.toString())) {
              claimedOrders.push(order._id.toString());
              countMatched++;
              Student.findByIdAndUpdate(order.claimedBy, {lastOrder: order._id}, (err) => {
                if (err) {
                  console.log(err);
                  return res.status(400).send({message: "something's wrong"});
                }
                order.claimed = true;
                order.save((err, order) => {
                  if (err) {
                    console.log(err);
                    return res.status(400).send({message: "something's wrong"});
                  }
                  count++;
                  if (count === worksheet.actualRowCount) {
                    callback();
                  }
                });
              });
            } else {
              queryObject.createdByServer = true;
              var newOrder = new Order(queryObject);
              newOrder.save((err, order) => {
                if (err) {
                  console.log(err);
                  return res.status(400).send({message: "something's wrong"});
                }
                count++;
                if (count === worksheet.actualRowCount) {
                  callback();
                }
              });
            }
          });
        }
      });
    }, (err) => {
      if (err) {
        console.log(err);
        return res.status(400).send({message: "something's wrong"})
      }
      if (countAdded == 0 && !corrupted) {
        return res.status(200).send({message: `อัพเดทฐานข้อมูลสำเร็จ! // เพิ่ม slip ${countAdded} รายการ // match ${countMatched} รายการ`});
      }
      if (corrupted && readSheets.length == 0) {
        return res.status(400).send({message: "ไฟล์ผิด Format ไม่มีหน้าไหนถูกอ่าน", countMatched, countAdded});
      }
      if (corrupted && readSheets.length != 0) {
        return res.status(200).send({message: "อ่านข้อมูลบางส่วนเพราะ format ผิด //" +
        ` อ่าน ${readSheets.toString()} // เพิ่ม slip ${countAdded} รายการ // match ${countMatched} รายการ`});
      }
      if (countAdded != 0 && !corrupted){
        return res.status(200).send({message: `อัพเดทฐานข้อมูลสำเร็จ! // เพิ่ม slip ${countAdded} รายการ // match ${countMatched} รายการ`});
      }
    });
  }).catch((err) => {
    console.log(err);
    res.status(400).send({message: "something's wrong"});
  });
});

router.get("/api/orders/:id", allowAdmin, (req, res) => {
  Order.findById(req.params.id).populate({path: "claimedBy", select: "firstname lastname _id"})
  .populate({path: "course", select: "title"})
  .populate({path: "books", select: "title"})
  .exec((err, order) => {
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

router.put("/api/orders/:id/void", allowAdmin, (req, res) => {
  Order.findByIdAndUpdate(req.params.id, {void: req.body.void}, (err, order) => {
    if (err) {
      console.log(err);
      return res.status(400).send({err, message: "Something went wrong"});
    }
    return res.status(200).send({});
  });
});

router.put("/api/orders/:id/claim", allowAdmin, (req, res) => {
  Order.findById(req.params.id, (err, order) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    if (order.type != 4 || order.createdByServer) {
      return res.status(400).send({message: "ไม่สามารถเคลมได้"});
    }
    order.claimed = !order.claimed;
    order.save((err) => {
      if (err) {
        return res.status(400).send({message: "something's wrong"});
      }
      res.status(200).send({});
    });
  });
});

router.post("/api/orders/:id/refund", allowAdmin, (req, res) => {
  Order.findById(req.params.id, (err, order) => {
    if (err || !req.body.price) {
      console.log(err);
      return res.status(400).send({err, message: "Something went wrong"});
    }
    if (order.price < req.body.price) {
      return res.status(400).send({err, message: "ราคาลดหนี้ต้องน้อยกว่าราคาคอร์ส"});
    }
    order.refund = {price: req.body.price, date: new Date()};
    order.save((err) => {
      if (err) {
        console.log(err);
        return res.status(400).send({err, message: "Something went wrong"});
      }
      return res.status(200).send({message: "ทำการลดหนี้สำเร็จ"});
    });
  });
});

router.delete("/api/orders/:id/refund", allowAdmin, (req, res) => {
  Order.findByIdAndUpdate(req.params.id, {refund: undefined}, (err, order) => {
    if (err) {
      console.log(err);
      return res.status(400).send({err, message: "Something went wrong"});
    }
    return res.status(200).send({message: "ทำการยกเลิกการลดหนี้สำเร็จ!"});
  });
});

router.post('/api/slips/upload', allowAdmin, (req, res) => {
  processFormBody(req, res, function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({err, message: "Something went wrong"});
    }
    if (!req.file) {
      return res.status(400).send({message: "โปรดอัพโหลดไฟล์"});
    }
    if (extractFileType(req.file.originalname) != "xlsx") {
      return res.status(400).send({message: "โปรดอัพโหลดไฟล์ excel นามสกุล .xlsx เท่านั้น"});
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
  console.log(date);
  if (typeof date == "string") {
    var splittedDate = date.split("/");
    return new Date(Number(splittedDate[2]), Number(splittedDate[1])-1, Number(splittedDate[0]),
    0, 0, 0, 0);
  }
}

router.post("/api/excel", allowAdmin, (req, res) => {
  var from = parseDate(req.body.from);
  var to = parseDate(req.body.to);
  var type = req.body.type;
  var queryObject;
  if (type == 1) {
    queryObject = {
      claimedAt: {
        $gte: from,
        $lte: new Date(to.getTime() + 3600000*24)
      },
      claimed: true,
      price: {
        $gte: 1
      },
      void: false
    };
  } else if (type == 2) {
    queryObject = {
      date: {
          $gte: from,
          $lte: to + 3600000*24
      },
      claimed: false,
      createdByServer: false,
      void: false
    };
  } else if (type == 3) {
    queryObject = {
      date: {
          $gte: from,
          $lte: to + 3600000*24
      },
      claimed: false,
      createdByServer: true,
      void: false
    };
  } else {
    return res.status(400).send({message: "ไม่ได้ระบุรูปแบบ excel ที่ต้องการ"});
  }
  Order.find(queryObject).populate({path: "claimedBy", select: "firstname lastname"}).exec((err, orders) => {
      var workbook = new Excel.Workbook();
      var worksheet = workbook.addWorksheet("Sheet1");
      var rows = [["วันที่", "รหัสโอน", "รหัสคอร์ส", "ราคา", "รูปแบบ", "สาขา", "เคลมแล้ว?", "วันที่เคลม", "ชื่อนักเรียน", "หมายเหตุ"]];
      var types = ["KTB", "GSB", "CS", "KTC", "FREE"];
      const branchArray = [
        "Admin",
        "BG", "BW", "BB",
        "BC", "BS", "BP",
        "BNG", "BR", "BH",
        "BU", "BPK", "BN",
        "BA", "BQ"
      ];
      async.forEach(orders, (order, cb) => {
        if (order.void) return cb();
        var price = order.price;
        var refund = false;
        if (order.refund && !!order.refund.price) {
          price -= order.refund.price;
          refund = true;
        }
        var row = [order.date, order.code, order.courseCode, price, types[order.type-1]];
        if (order.branch+1) {
          row.push(branchArray[order.branch]);
        } else {
          row.push("");
        }
        if (order.claimed) {
          row.push("Yes");
          row.push(order.claimedAt);
          if (order.claimedBy) {
            row.push(`${order.claimedBy.firstname} ${order.claimedBy.lastname}`);
          } else {
            row.push("");
          }
        } else {
          row.push("");
          row.push("");
          row.push("");
        }
        if (refund) {
          row.push(`ทำการลดหนี้ ${order.refund.price} บาท จาก ${order.price} บาท`);
        }
        rows.push(row);
        cb();
      }, (err) => {
        if (err) {
          return res.status(400).send({message: "something's wrong "})
        }
        worksheet.addRows(rows);
        var timestamp = new Date().valueOf();
        var filename = 'output.xlsx';
        workbook.xlsx.writeFile(path.join(__dirname, '../public/', filename)).then(function() {
          console.log("xlsx file is written.");
          res.status(200).send({message: 'xlsx file is written.', filename: filename});
        });
      });
    });
});

router.put('/api/students/createdBy', (req, res) => {
  Student.find({}).populate({path: "orders", select: "branch", match: {void: false}}).exec((err, students) => {
    if (err) {
      console.log(err);
      return res.status(400).send({err, message: "Something went wrong"});
    }
    async.forEach(students, (student, cb) => {
      if (student.orders.length != 0) {
        // console.log(student);
        student.createdBy = student.orders[0].branch;
        student.save((err) => {
          if (err) {
            console.log(err);
            return res.status(400).send({err, message: "Something went wrong"});
          }
          console.log("saved");
          cb();
        });
      } else {
        cb();
      }
    });
  });
});

router.put('/api/students/:id', (req, res) => {
  Student.findByIdAndUpdate(req.params.id, {firstname: req.body.firstname, lastname: req.body.lastname}, {new: true}, (err, student) => {
    if (err) {
      console.log(err);
      return res.status(400).send({err, message: "Something went wrong"});
    }
    res.status(200).send(student);
  });
});

router.put('/api/orders/:id/books', (req, res) => {
  Order.findById(req.params.id, (err, order) => {
    if (err) {
      console.log(err);
      return res.status(400).send({err, message: "Something went wrong"});
    }
    order.books = req.body.books;
    order.course = req.body.course;
    order.save((err) => {
      if (err) {
        console.log(err);
        return res.status(400).send({err, message: "Something went wrong"});
      }
      return res.status(200).send();
    })
  });
});



// router.delete('/api/orders/:id', (req, res) => {
//   Order.findByIdAndDelete(req.params.id, (err) => {
//     res.status(200).send({});
//   });
// });

module.exports = router;
