var express = require('express');
var router = express.Router();
var Order = require('../order');
var Course = require('../course');
var Student = require('../student');
var Excel = require('exceljs');
var path = require("path");
var fs = require("fs");
var async = require("async");
var jwt = require("jsonwebtoken");
var Book = require("../book");
var User = require("../user");

var workbook = new Excel.Workbook();

router.use('/api/', (req, res, next) => {
  jwt.verify(req.query.token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).send({message: "Unauthorized"});
    }
    next();
  });
});

router.get('/api/books', (req, res) => {
  var from = new Date(req.query.year, req.query.month, 1);
  var to = new Date(req.query.year, req.query.month, 31);
  var matchObject = {
    updatedAt: {
        $gte: from,
        $lt: to
    },
    void: false
  };
  if (req.query.branch) {
    matchObject.branch = req.query.branch;
  }
  Book.find({}).select("title _id numBook orders updatedAt")
  .populate({path: "orders", match: matchObject})
  .exec((err, books) => {
    if (err) {
      return res.status(400).send({message: "something's wrong "});
    }
    res.status(200).send({books});
  });
});

router.get('/api/books/list', (req, res) => {
  Book.find({}).select("title _id")
  .exec((err, books) => {
    if (err) {
      return res.status(400).send({message: "something's wrong "});
    }
    res.status(200).send({books});
  });
});

router.get('/api/books/courses', (req, res) => {
  var queryObject = {};
  if (req.query.price) {
    queryObject.price = req.query.price;
  }
  Course.find(queryObject).select("title _id numBook").exec((err, courses) => {
    if (err) {
      return res.status(400).send({message: "something's wrong "});
    }
    res.status(200).send(courses);
  });
});

router.get('/api/books/courses/:id', (req, res) => {
  Course.findById(req.params.id).populate({path: "books", select: "title _id"}).exec((err, course) => {
    if (err) {
      return res.status(400).send({message: "something's wrong "});
    }
    res.status(200).send(course.books);
  });
});

router.get('/api/books/:id', (req, res) => {
  var from = new Date(req.query.year, req.query.month, 1);
  var to = new Date(req.query.year, req.query.month, 31);
  var matchObject = {
    updatedAt: {
        $gte: from,
        $lt: to
    },
    void: false
  };
  if (req.query.branch) {
    matchObject.branch = req.query.branch;
  }
  Book.findById(req.params.id).select("title _id numBook orders updatedAt")
  .populate({path: "orders", match: matchObject})
  .exec((err, book) => {
    if (err) {
      return res.status(400).send({message: "something's wrong "});
    }
    Student.populate(book, {path: "orders.claimedBy", select: "firstname lastname _id", model: "Student"}, (err, book) => {
      if (err) {
        return res.status(400).send({message: "something's wrong "});
      }
      res.status(200).send(book);
    });
  });
});

module.exports = router;
