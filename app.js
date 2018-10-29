var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var gamesRouter = require('./routes/games');
var app = express();
var server = app.listen(4000, function(){
  console.log('now listening for requests on port 4000');
});
exports.server = server;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/assets', [
  express.static(__dirname + '/node_modules/bootstrap/dist'),
  express.static(__dirname + '/node_modules/jquery/dist'),
  express.static(__dirname + '/node_modules/popper.js/dist/umd/'),
  express.static(__dirname + '/node_modules/socket.io-client/dist')
]);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/games', gamesRouter);

require("./public/javascripts/socket")(server);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
