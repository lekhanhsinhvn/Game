const {Card, validate} = require('../models/card')
const {Effect} = require('../models/effect')
const validateObjectId = require('../middleware/validateObjectId');
const validator = require('../middleware/validator')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const express = require('express');
const router = express.Router()

router.get('/', auth, async (req, res) => {
  const cards = await Card.find().sort('name'); 
  
  res.send(cards);
})

router.get('/:id', [auth, validateObjectId], async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) return res.status(404).send('Card not Found')

  res.send(card)
})

router.post('/', [auth, admin, validator(validate)], async (req, res) => {
  const effect = await Effect.findById(req.body.effectId);
  if (!effect) return res.status(400).send('Invalid effect')
  
  const card = new Card({
    name: req.body.name,
    description: req.body.description,
    type: req.body.type,
    grade: req.body.grade,
    avatar: req.body.avatar,
    cost: req.body.cost,
    attack: req.body.attack,
    health: req.body.health,
    effect: {
      _id: effect._id,
      name: effect.name,
      description: effect.description,
      keyword: effect.keyword
    }
  })
  await card.save();

  res.send(card);
});

router.put('/:id', [auth, admin, validator(validate)], async(req, res) => {
  const effect = await Effect.findById(req.body.effectId);
  if (!effect) return res.status(400).send('Invalid effect')

  const card = await Card.findByIdAndUpdate(req.params.id,
    { 
      name: req.body.name,
      type: req.body.type,
      grade: req.body.grade,
      avatar: req.body.avatar,
      cost: req.body.cost,
      attack: req.body.attack,
      health: req.body.health,
      effect: {
        _id: effect._id,
        name: effect.name,
        description: effect.description,
        keyword: effect.keyword
      }
    }, { new: true });
  
  if(!card) return res.status(404).send('The card with the given ID was not found')

  res.send(card);
})

router.delete('/:id', [auth, admin], async(req, res) => {
  const card = await Card.findByIdAndRemove(req.params.id);

  if (!card) return res.status(404).send('The card with the given ID was not found.');

  res.send(card);
})

module.exports = router;