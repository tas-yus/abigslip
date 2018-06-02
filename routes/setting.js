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

function allowSetting (req, res, next) {
  if (!jwt.decode(req.query.token).user.isSetting) {
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

router.get('/api/settings/groups', allowSetting, (req, res, next) => {
  Group.find({}).populate({path: "courses", options: {select: "title numBook", sort: {title: 1}}}).exec((err, groups) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(groups);
  });
});

router.put('/api/settings/groups/:id', allowSetting, (req, res, next) => {
  Group.findOne({title: req.body.title}, (err, group) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    if (group) {
      return res.status(400).send({message: "มีรายการโอนชื่อนี้อยู่แล้ว"});
    }
    Group.findByIdAndUpdate(req.params.id, {title: req.body.title}, (err, group) => {
      if (err) {
        return res.status(400).send({message: "something's wrong"});
      }
      res.status(200).send(group);
    });
  })
});

router.get('/api/settings/groups/:id', allowSetting, (req, res, next) => {
  Group.findById(req.params.id).populate({path: "courses", options: {sort: {title: 1}}}).exec((err, group) => {
    if (err) {
      console.log(err);
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(group);
  });
});

router.post('/api/settings/groups', allowSetting, (req, res, next) => {
  Group.findOne({code: req.body.code}, (err, group) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    if (group) {
      return res.status(400).send({message: "มีรายการโอนชื่อนี้อยู่แล้ว"});
    }
    Group.create({code: req.body.code, price: req.body.price, title: req.body.title}, (err, group) => {
      if (err) {
        return res.status(400).send({message: "something's wrong"});
      }
      res.status(200).send(group);
    });
  })
});

router.post('/api/settings/groups/:groupId/courses/:courseId', allowSetting, (req, res, next) => {
  Group.findByIdAndUpdate(req.params.groupId, { $push: { courses: req.params.courseId  }}, { new: true })
  .populate({path: "courses"}).exec((err, group) => {
    if (err) {
      console.log(err);
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(group);
  });
});

router.delete('/api/settings/groups/:groupId/courses/:courseId', allowSetting, (req, res, next) => {
  Group.findByIdAndUpdate(req.params.groupId, { $pull: { courses: req.params.courseId  }}, { new: true })
  .populate({path: "courses"}).exec((err, group) => {
    if (err) {
      console.log(err);
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(group);
  });
});

router.get('/api/settings/books', allowSetting, (req, res, next) => {
  Book.find({}).sort({title: 1}).exec((err, books) => {
    if (err) {
      console.log(err);
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(books);
  });
});

router.post('/api/settings/books', allowSetting, (req, res, next) => {
  Book.findOne({title: req.body.title}, (err, book) => {
    if (err) {
      console.log(err);
      return res.status(400).send({message: "something's wrong"});
    }
    if (book) {
      return res.status(400).send({message: "มีหนังสือชื่อนี้อยู่แล้ว"});
    }
    Book.create({title: req.body.title}, (err, book) => {
      if (err) {
        console.log(err);
        return res.status(400).send({message: "something's wrong"});
      }
      res.status(200).send({});
    });
  })
});

router.get('/api/settings/courses', allowSetting, (req, res, next) => {
  Course.find({}).sort({title: 1}).populate({path: "books", options: {select: "title", sort: {title: 1}}}).exec((err, courses) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(courses);
  })
});

router.post('/api/settings/courses', allowSetting, (req, res, next) => {
  Course.findOne({title: req.body.title}, (err, course) => {
    if (err) {
      console.log(err);
      return res.status(400).send({message: "something's wrong"});
    }
    if (course) {
      return res.status(400).send({message: "มีคอร์สชื่อนี้อยู่แล้ว"});
    }
    Course.create({title: req.body.title, numBook: req.body.numBook}, (err, course) => {
      if (err) {
        console.log(err);
        return res.status(400).send({message: "something's wrong"});
      }
      res.status(200).send(course);
    });
  })
});

router.get('/api/courses/list', allowSetting, (req, res, next) => {
  Course.find({}).select("title").sort({title: 1}).exec((err, courses) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send({courses});
  });
});

router.put('/api/courses/:id', allowSetting, (req, res, next) => {
  Course.findOne({title: req.body.title}, (err, course) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    if (course && course.numBook == req.body.numBook && course.strict == req.body.strict) {
      return res.status(400).send({message: "ชื่อซ้ำ"});
    }
    Course.findByIdAndUpdate(req.params.id, {title: req.body.title, numBook: req.body.numBook, strict: req.body.strict}, {new: true},(err, course) => {
      if (err) {
        return res.status(400).send({message: "something's wrong"});
      }
      res.status(200).send({message: "อัพเดทสำเร็จ"});
    });
  })
});

router.post('/api/courses/:courseId/books/:bookId', allowSetting, (req, res, next) => {
  Course.findByIdAndUpdate(req.params.courseId, { $push: { books: req.params.bookId  }}, {new: true})
  .populate("books").exec((err, course) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(course);
  })
});

router.delete('/api/courses/:courseId/books/:bookId', allowSetting, (req, res, next) => {
  Course.findByIdAndUpdate(req.params.courseId, { $pull: { books: req.params.bookId  }}, {new: true})
  .populate("books").exec((err, course) => {
    if (err) {
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(course);
  })
});


router.get('/api/courses/:id', allowSetting, (req, res, next) => {
  Course.findById(req.params.id).populate({path: "books", options: {select: "title", sort:{title: 1}}}).exec((err, course) => {
    if (err || !course) {
      return res.status(400).send({message: "something's wrong"});
    }
    res.status(200).send(course);
  });
});

module.exports = router;
