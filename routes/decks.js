const {Deck, validate} = require('../models/deck')
const {Card} = require('../models/card')
const validateObjectId = require('../middleware/validateObjectId');
const validator = require('../middleware/validator')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const express = require('express');
const router = express.Router()

router.get('/:id', [auth, validateObjectId], async (req, res) => {
  const deck = await Deck
    .findById(req.params.id)
    .populate('cardList.card')
  if (!deck) return res.status(404).send('Deck not Found')

  res.send(deck)
})

router.get('/', [auth, admin], async (req, res) => {
  const deck = await Deck.find()

  res.send(deck)
})

router.post('/', [auth, validator(validate)], async (req, res) => {
  const deck = new Deck({
    cardList: req.body.cardList
  })

  await deck.save()
  res.send(deck)
})


module.exports = router;