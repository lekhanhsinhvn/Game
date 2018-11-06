var express = require('express');
const { User } = require('../models/user');
const { Card } = require('../models/card');
const { Deck } = require('../models/deck');
const auth = require('../middleware/auth');
var router = express.Router();

router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.render('game', { title: 'Game', user: user });
});
router.get('/home', async (req, res) => {
  res.render('index', { title: 'Home' });
});
router.get('/deck', async (req, res) => {
  var pageOptions = {
    page: req.query.page || 0,
    limit: req.query.limit || 12
  }
  const cards = await Card.find().sort('name')
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
  const deck = await User.findById("5bdd20b0c78a2b07cf519389");
  res.render('deck', { title: 'Deck', cards: cards });
});
router.post('/deck/save', async (req, res) => {
  console.log(req.body.deck);
  res.redirect('back');
});
module.exports = router;
