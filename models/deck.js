const Joi = require('joi');
const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
  cardList: {
    type: [{
      card: {type: mongoose.Schema.Types.ObjectId, ref: 'Card'}
    }],
    validate: {
      validator: function(v) {
        return v && v.length <= 25;
      },
      message: 'a Deck should have equal or less than 25 cards'
    }
  }
})

const Deck = mongoose.model('Deck', deckSchema)

function validateDeck(deck) {
  const schema = {
    _id: Joi.string(),
    cardList: Joi.array()
  }
  return Joi.validate(deck, schema)
}

exports.Deck = Deck;
exports.validate = validateDeck;