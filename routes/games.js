var express = require('express');
var router = express.Router();

router.get('/game', function (req, res, next) {
  res.render('game', { title: 'Game' });
});


module.exports = router;
