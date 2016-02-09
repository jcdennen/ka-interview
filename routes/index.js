var express = require('express');
var router = express.Router();
// var esprima = require('esprima');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Esprima' });
});

module.exports = router;
