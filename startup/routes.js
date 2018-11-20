const express = require('express');
const users = require('../routes/users');
const auth = require('../routes/auth');
const cards = require('../routes/cards');
const effects = require('../routes/effects')
const decks = require('../routes/decks');
const games = require('../routes/games');
const login = require('../routes/login');
const register = require('../routes/register')
const error = require('../middleware/error');

module.exports = function(app) {
  app.use(express.json());
  app.use('/users', users);
  app.use('/auth', auth);
  app.use('/cards', cards);
  app.use('/effects', effects)
  app.use('/decks', decks);
  app.use('/games', games);
  app.use('/login', login);
  app.use('/register', register);
  app.use(error);
}