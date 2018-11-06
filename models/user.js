const {Deck} = require('../models/deck')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: true
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: true
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 1024,
  },
<<<<<<< HEAD
  deckList: {
    deck1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'deck'
    },
    deck2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'deck'
    },
    deck3: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'deck'
    },
=======
  deckSample: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'deck',
>>>>>>> 5123547602ddd1042a787575b7a973cb78ab1244
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: true
  },
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({_id: this._id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
  return token;
}

userSchema.methods.generateDeck = async function() {
  let deck = new Deck({
    cardList: []
  })
  
  const deckID = await deck.save(function(err, newDeck) {
    return newDeck.id;
  });
  
  return mongoose.Types.ObjectId(deckID);
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(50).required().email(),
    password: Joi.string().min(5).max(255).required()
  }
  return Joi.validate(user, schema);
};

exports.User = User; 
exports.validate = validateUser;