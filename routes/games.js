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
  var pageOptions = {
    page: req.query.page || 0,
    limit: req.query.limit || 12
  }
  const cards = await Card.find().sort('name')
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit);
  res.render('deck', { title: 'Deck', cards: cards });
});
router.get('/myCards', auth, async (req, res) => {
  const user = await User
    .findById(req.user._id)
    .select('-password')
    .populate({
      path: 'deckSample',
      populate: {
        path: 'cardList.card',
        model: 'Card'
      }
    })
  const cards=(user.deckSample).cardList;
  res.send(cards);
});
router.post('/deck/save', auth, async (req, res) => {
  let id = (await User.findById(req.user._id).select('-password')).deckSample;
  console.log(req.body.deck);
  res.end();
});
module.exports = router;
