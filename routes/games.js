var express = require('express');
const { User } = require('../models/user');
const { Card } = require('../models/card');
const { Deck } = require('../models/deck');
const auth = require('../middleware/auth');
const _ = require('lodash');
var router = express.Router();

router.get('/', auth, async (req, res) => {
  res.render('game', { title: 'Game' });
});
router.get('/deck', auth, async (req, res) => {
  var pageOptions = {
    page: req.query.page || 0,
    limit: req.query.limit || 12
  }
  const cards = await Card.find().sort('name')
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit);
  const deck_id = (await User.findById(req.user._id).select('-password')).deckSample;
  res.render('deck', { title: 'Deck', cards: cards, deck_id: deck_id });
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

  const cards = _.map((user.deckSample).cardList, 'card');
  console.log(cards)
  res.send(cards);
});
module.exports = router;
