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

var workbook = new Excel.Workbook();
var processFormBody = multer({storage: multer.memoryStorage()}).single('file');

function allowMaster (req, res, next) {
  if (!jwt.decode(req.query.token).user.isMaster) {
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

router.get('/api/courses', allowMaster, (req, res, next) => {
  Course.find({}).populate("books").exec((err, courses) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(courses);
  });
});

router.put('/api/courses/:id', allowMaster, (req, res, next) => {
  Course.findByIdAndUpdate(req.params.id, {price: req.body.price, numBook: req.body.numBook}, (err, course) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    console.log(course);
    res.status(200).send({});
  });
});

router.post('/api/courses/:courseId/books/:bookId', allowMaster, (req, res, next) => {
  Course.findByIdAndUpdate(req.params.courseId, { $push: { books: req.params.bookId  }}, {new: true})
  .populate("books").exec((err, course) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(course);
  })
});

router.delete('/api/courses/:courseId/books/:bookId', allowMaster, (req, res, next) => {
  Course.findByIdAndUpdate(req.params.courseId, { $pull: { books: req.params.bookId  }}, {new: true})
  .populate("books").exec((err, course) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(course);
  })
});


router.get('/api/courses/:id', allowMaster, (req, res, next) => {
  Course.findById(req.params.id).populate("books").exec((err, course) => {
    if (err || !course) {
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(course);
  });
});

module.exports = router;
