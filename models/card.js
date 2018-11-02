const Joi = require('joi');
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 256,
    required: true
  },
  description: {
    type: String,
    minlength: 1,
    maxlength: 512,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['spell', 'monster']
  },
  grade: {
    type: String,
    required: true,
    enum: ['R', 'SR', 'UR', 'GR']
  },
  avatar: {
    type: String,
    minlength: 5,
    maxlength: 2048,
    required: true
  },
  cost: {
    type: Number,
    min: 0,
    max: 99,
    required: function() { return ((this.type === 'monster')? true:false);},
  },
  attack: {
    type: Number,
    min: 0,
    max: 9999,
    required: function() { return ((this.type === 'monster')? true:false);}
  },
  health: {
    type: Number,
    min: 0,
    max: 9999,
    required: function() { return ((this.type === 'monster')? true:false);}
  },
  effect: {
    type: Object,
    required: true
  }
})

const Card = mongoose.model('Card', cardSchema)

function validateCard(card) {
  const schema = {
    name: Joi.string().min(1).max(256).required(),
    description: Joi.string().min(1).max(512).required(),
    type: Joi.string().min(5).max(7).required(),
    grade: Joi.string().min(1).max(2).required(),
    avatar: Joi.string().min(5).max(2048).required(),
    cost: Joi.number().min(0).max(99),
    attack: Joi.number().min(0).max(9999),
    health: Joi.number().min(0).max(9999),
    effectId: Joi.objectId().required()
  }

  return Joi.validate(card, schema);
}
exports.cardSchema = cardSchema;
exports.Card = Card;
exports.validate = validateCard;