const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ArtistSchema = new Schema({
    name: String,
    id: String,
    followers: Number,
    popularity: Number,
    size: Number,
    x: Number,
    y: Number,
    r: Number,
    g: Number,
    b: Number,
    genres: [String],
    related: [String],
})

const Artist = mongoose.model('Artist', ArtistSchema);

module.exports = Artist;