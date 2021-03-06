const mongoose = require('mongoose')
const validator = require('../middleware/validator');
const { User, validate } = require('../models/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin')
const bcrypt = require('bcrypt')
const _ = require('lodash');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
})
router.get('/', [auth, admin], async (req, res) => {
  const users = await User.find().sort('name');
  res.send(user);
})

router.get('/myCards', auth, async (req, res) => {
  const cards = await User
    .find()
    .sort('name')
    .populate({
      path: 'deckSample',
      populate: {
        path: 'cardList.card',
        model: 'Card'
      }
    })
  res.send(cards);
})

router.post('/', validator(validate), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered');

  user = new User(_.pick(req.body, ['name', 'email', 'password']));
  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt);
  const deck = await user.generateDeck();
  user.deckSample = mongoose.Types.ObjectId(deck._id)

  await user.save();
  /*
  const token = user.generateAuthToken();
  res.send({
    _id: user._id,
    user: user.name,
    email: user.email,
    token: token,
  });
  */
 res.send({redirect:'/login'});
 res.end();
});

module.exports = router;