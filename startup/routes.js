const express = require('express')
const users = require('../routes/users');
const auth = require('../routes/auth');
const cards = require('../routes/cards');
const effects = require('../routes/effects')
const decks = require('../routes/decks');
const games = require('../routes/games');

const error = require('../middleware/error');

module.exports = function(app) {
  app.use(express.json());
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/cards', cards);
  app.use('/api/effects', effects)
  app.use('/api/decks', decks);
  app.use('/api/games',games);
  app.use(error);
}