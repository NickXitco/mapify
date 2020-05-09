const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


const dbInitializer = require('./backend/DatabaseInitializer');
dbInitializer.initDB();

const indexRouter = require('./routes/index');
const quadRouter = require('./routes/quadRouter');
const quadsRouter = require('./routes/quadsRouter');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/quad', quadRouter);
app.use('/quads', quadsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

app.listen(3000, () => {
  console.log('App listening on port 3000!');
})

module.exports = app;
