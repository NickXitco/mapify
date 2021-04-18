const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const quadRouter = require('./routes/quadRouter');
const artistRouter = require('./routes/artistRouter');
const artistSearchRouter = require('./routes/artistSearchRouter');
const genreRouter = require('./routes/genresRouter');
const shortestPathRouter = require('./routes/shortestPathRouter');
const randomRouter = require('./routes/randomRouter');
const fenceRouter = require('./routes/fenceRouter');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));


app.use('/quad', quadRouter);
app.use('/artist', artistRouter);
app.use('/artistSearch', artistSearchRouter);
app.use('/genre', genreRouter);
app.use('/path', shortestPathRouter);
app.use('/random', randomRouter);
app.use('/fence', fenceRouter);
app.use('/', indexRouter);
app.get('/*',function(req,res) {
  const p = path.join(__dirname, 'public')
  res.sendFile(p + "\\index.html");
  res.status(200);
});

app.listen(8080, () => {
  console.log('App listening on port 8080!');
})

module.exports = app;
