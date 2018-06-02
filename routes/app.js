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

var workbook = new Excel.Workbook();
var processFormBody = multer({storage: multer.memoryStorage()}).single('file');

router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/login', (req, res) => {
  User.findOne({username: req.body.username}, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(400).send({message: "Something went wrong"});
    }
    if (!user) {
      return res.status(401).send({message: "username หรือ รหัสผ่านผิด"});
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(401).send({message: "username หรือ รหัสผ่านผิด"});
    }
    var token = jwt.sign({user}, 'secret', {expiresIn: 3600*6});
    res.status(200).send({message: 'ลงชื่อเข้าใจสำเร็จ', token, userId: user._id});
  });
})

module.exports = router;
