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

router.use('/api/', (req, res, next) => {
  jwt.verify(req.query.token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).send({message: "Unauthorized"});
    }
    next();
  });
});

router.post('/api/students/:id/courses', (req, res) => {
  var parseDate = (date) => {
    if (typeof date == "string") {
      var splittedDate = date.split("/");
      return new Date(Number(splittedDate[2]), Number(splittedDate[1])-1, Number(splittedDate[0]),
      0, 0, 0, 0);
    } else if (typeof date.getMonth === "function") {
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      0, 0, 0, 0);
    }
  }
  Student.findById(req.params.id).then((student) => {
    if (!student) {
      return res.status(400).send({message: "ไม่มีนักเรียนที่ต้องการใน database"});
    }
    Group.findByIdAndUpdate(req.body.group, {$inc : {'numUse' : 1}}, (err, group) => {
      if (err) {
        console.log(err);
        return res.status(400).send({message: "something's wrong"});
      }
      if (req.body.type != 4) {
        var queryObject = {
          type: req.body.type,
          code: String(req.body.code).trim(),
          courseCode: group.code,
          price: group.price,
          date: parseDate(req.body.date)
        };
      } else {
        var queryObject = {
          type: req.body.type,
          price: group.price,
          date: parseDate(req.body.date),
          courseCode: group.code
        };
      }
      Order.find(queryObject, (err, orders) => {
        if (err) {
          console.log(err);
          return res.status(400).send({message: "something's wrong"});
        }
        orders = orders.filter((o) => { return !o.claimed });
        var order = orders[0];
        // if (!order) {
        //   return res.status(405).send({message: "มีสลิปที่เคยสร้างไว้แบบเดียวกัน"});
        // }
        if (order && order.createdByServer) {
          order.claimed = true;
          order.claimedAt = new Date();
          order.claimedBy = student._id;
          order.branch = req.body.branch;
          order.books = req.body.books;
          order.group = req.body.group;
          order.course = req.body.course;
          if (req.body.type == 4) {
            order.courseCode = group.code;
            order.code = req.body.code;
          }
          order.save((err, order) => {
            if (err) {
              console.log(err);
              return res.status(400).send({message: "something's wrong"});
            }
            student.orders.push(order._id);
            student.lastOrder = order._id;
            student.save((err, student) => {
              if (err) {
                console.log(err);
                return res.status(400).send({message: "something's wrong"});
              }
              async.forEach(req.body.books, (book, cb) => {
                Book.findByIdAndUpdate(book, { $push: { orders: order._id }}, (err, book) =>{
                  if (err) {
                    console.log(err);
                    return res.status(400).send({message: "something's wrong"});
                  }
                  cb();
                });
              }, (err) => {
                if (err) {
                  console.log(err);
                  return res.status(400).send({message: "something's wrong"});
                }
                res.status(200).send({message: "course added to student", id: student._id});
              });
            });
          });
        } else {
          var newOrder = new Order(queryObject);
          newOrder.claimedBy = student._id;
          newOrder.branch = req.body.branch;
          newOrder.group = req.body.group;
          newOrder.course = req.body.course;
          newOrder.books = req.body.books;
          if (req.body.type == 5) {
            newOrder.claimed = true;
            newOrder.claimedAt = new Date();
            newOrder.code = null;
          } else {
            newOrder.claimedAt = new Date();
            newOrder.code = req.body.code;
          }
          newOrder.save((err, order) => {
            if (err) {
              console.log(err);
              return res.status(400).send({message: "something's wrong"});
            }
            student.orders.push(order._id);
            student.lastOrder = order._id;
            student.save((err, student) => {
              if (err) {
                console.log(err);
                return res.status(400).send({message: "something's wrong"});
              }
              async.forEach(req.body.books, (book, cb) => {
                Book.findByIdAndUpdate(book, { $push: { orders: order._id  } }, (err, book) =>{
                  if (err) {
                    console.log(err);
                    return res.status(400).send({message: "something's wrong"});
                  }
                  cb();
                });
              }, (err) => {
                if (err) {
                  console.log(err);
                  return res.status(400).send({message: "something's wrong"});
                }
                res.status(200).send({message: "course added to student", id: student._id, orderId: order._id});
              });
            });
          });
        }
      });
    });
  }).catch((err) => {
    console.log(err);
    res.status(400).send({message: "something's wrong"});
  });
});

router.get("/api/students/search", (req, res) => {
  var limit = req.query.limit? Number(req.query.limit) : 5;
  var query = req.query.name?
  {
    $or:[{firstname:{$regex: String(req.query.name).trim(), $options: 'i'}},{lastname:{$regex: String(req.query.name).trim(), $options: 'i'}}],
  }
  : {};
  Student.find(query).select("firstname lastname _id").limit(limit).exec((err, students) => {
    if (err) {
      return res.status(400).send({message: "something's wrong "});
    }
    if (students.length === 0) {
      return res.status(400).send({message: "ไม่มีชื่อนี้ในระบบ สามารถสร้างเด็กได้"});
    }
    res.status(200).send(students);
  });
});

router.get("/api/students", (req, res) => {
  var limit = req.query.limit? Number(req.query.limit) : 100;
  Student.find({}).populate({path: 'lastOrder', match: {void: false}}).sort({updatedAt: -1})
  .limit(limit).exec((err, students) => {
    if (err) {
      return res.status(400).send({message: "something's wrong "});
    }
    Student.count({}, (err, count) => {
      if (err) {
        return res.status(400).send({message: "something's wrong "});
      }
      res.status(200).send({students, count});
    })
  });
});

router.get('/api/students/:id', (req, res) => {
  Student.findById(req.params.id).populate({path: "orders", options: {sort: {date: -1}}, match: {void: false}}).then((student) => {
    if (!student) {
      return res.status(400).send({message: "no student found"});
    }
    res.status(200).send(student);
  }).catch((err) => {
    console.log(err);
    res.status(400).send({message: "something's wrong"});
  });
});

router.post('/api/students', (req, res) => {
  var queryObject = {
    firstname: String(req.body.firstname).trim(),
    lastname: String(req.body.lastname).trim(),
  }
  Student.findOne(queryObject, (err, oldStudent) => {
    if (err) {
      console.log(err);
      return res.status(400).send({message: "something's wrong"});
    }
    if (oldStudent) {
      return res.status(400).send({message: "มีเด็กอยู่ในระบบอยู่แล้ว โปรดเข้าหน้าเพจของเด็กเพื่อเพิ่มรายการ"});
    }
    var student = new Student (queryObject);
    student.save((err, student) => {
      if (err) {
        console.log(err);
        return res.status(400).send({message: "something's wrong"});
      }
      res.status(200).send({message: "student added", id: student._id});
    });
  })
});

module.exports = router;
