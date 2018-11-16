const Joi = require('joi');
const mongoose = require('mongoose');

const effectSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    enum: ['on_summon', 'on_death', 'on_startTurn', 'on_endTurn']
  },
  code: {
    type: String,
    minlength: 1,
    maxlength: 2048,
    required: true
  },
  description: {
    type: String,
    maxlength: 1024,
    minlength: 1,
    required: true
  },
})

const Effect = mongoose.model('Effect', effectSchema)

function validateEffect(effect) {
  const schema = {
    event: Joi.string().max(30),
    code: Joi.string().max(2048),
    description: Joi.string().max(1024)
  }
  return Joi.validate(effect, schema)
}

exports.effectSchema = effectSchema;
exports.Effect = Effect;
exports.validate = validateEffect;