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
router.get('/deck', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  var pageOptions = {
    page: req.query.page || 0,
    limit: req.query.limit || 12
  }
  const cards = await Card.find().sort('name')
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
  
  var deck=user.deckSample.
  res.render('deck', { title: 'Deck', cards: cards , deck:user.deckSample});
});
router.post('/deck/save', auth, async (req, res) => {
  console.log(req.body.deck);
  res.redirect('back');
});
module.exports = router;
