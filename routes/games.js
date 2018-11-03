var express = require('express');
const {User} = require('../models/user');
const auth = require('../middleware/auth');
var router = express.Router();

router.get('/', auth, async(req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.render('game', { title: 'Game', user: user });
});


module.exports = router;
