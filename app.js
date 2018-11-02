const winston = require('winston');
const express = require('express');
var path = require('path');

var app = express();

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
  express.static(__dirname + '/node_modules/socket.io-client/dist')
]);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => winston.info(`Listening on port ${port}`));

const io = require('socket.io').listen(server);
require('./sockets/socket')(io);

module.exports = server;