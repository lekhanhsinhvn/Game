const Joi = require('joi');
const mongoose = require('mongoose');

const effectSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 256,
    minlength: 1,
    required: true
  },
  description: {
    type: String,
    maxlength: 1024,
    minlength: 1,
    required: true
  },
  keyword: {
    type: String,
    minlength: 1,
    maxlength: 20,
    required: true
  }
})

const Effect = mongoose.model('Effect', effectSchema)

function validateEffect(effect) {
  const schema = {
    name: Joi.string().max(256),
    description: Joi.string().max(1024),
    keyword: Joi.string().max(20)
  }
  return Joi.validate(effect, schema)
}

exports.effectSchema = effectSchema;
exports.Effect = Effect;
exports.validate = validateEffect;