const Joi = require('joi');
const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
  cardList: {
    type: [{
      card: {type: mongoose.Schema.Types.ObjectId, ref: 'Card'}
    }],
    validate: {
      validator: function(v) {
        let count = [];
        v.forEach(function(i) {
          count[i.card] = (count[i.card]||0) + 1;
          if(count[i.card] > 3) return console.log('Something failed')
        });
        return v && v.length <= 25 ;
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