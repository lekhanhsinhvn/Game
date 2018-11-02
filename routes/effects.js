const _ = require('lodash')
const {Effect, validate} = require('../models/effect')
const validator = require('../middleware/validator')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const express = require('express');
const router = express.Router()

router.get('/', auth, async (req, res) => {
  const effects = await Effect.find().sort('name')
  
  res.send(effects)
})

router.get('/:id', auth, async (req, res) => {
  const effect = await Effect.findById(req.params.id);
  if (!effect) return res.status(404).send('Effect not Found')
  
  res.send(effect)
})

router.post('/', [auth, admin, validator(validate)], async (req, res) => {
  const effect = new Effect(_.pick(req.body, ['name', 'description', 'keyword']))
  await effect.save();

  res.send(effect);
});

router.put('/:id', [auth, admin, validator(validate)], async(req, res) => {
  const effect = await Effect.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, ['name', 'description', 'keyword']),
    { new: true }
  );
  
  if(!effect) return res.status(404).send('The effect with the given ID was not found')

  res.send(effect);
})

router.delete('/:id', [auth, admin], async(req, res) => {
  const effect = await Effect.findByIdAndRemove(req.params.id);

  if (!effect) return res.status(404).send('The effect with the given ID was not found.');

  res.send(effect);
})

module.exports = router;