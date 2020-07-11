const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GenreSchema = new Schema({
    name: String,
    r: Number,
    g: Number,
    b: Number
})

const Genre = mongoose.model('Genre', GenreSchema);

module.exports = Genre;