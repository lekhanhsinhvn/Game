const winston = require('winston');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(cookieSession({
  name: 'session',
  keys: ["lekhanhsinh"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(cors())
require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/assets', [
  express.static(__dirname + '/node_modules/bootstrap/dist'),
  express.static(__dirname + '/node_modules/jquery/dist'),
  express.static(__dirname + '/node_modules/jquery-ui-dist'),
  express.static(__dirname + '/node_modules/popper.js/dist/umd/'),
  express.static(__dirname + '/node_modules/socket.io-client/dist'),
  express.static(__dirname + '/node_modules/lodash')
]);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => winston.info(`Listening on port ${port}`));

const io = require('socket.io').listen(server);
require('./sockets/socket')(io);

module.exports ={
  server:server,
  app:app
};
