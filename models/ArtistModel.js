const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ArtistSchema = new Schema({
    name: String,
    id: String,
    genres: [{type: Schema.Types.ObjectID, ref: 'Genre'}],
    related: [{type: Schema.Types.ObjectID, ref: 'Artist'}],
    relatedToThis: [{type: Schema.Types.ObjectID, ref: 'Artist'}],
    followers: Number,
    popularity: Number,
    color: [{type: Schema.Types.ObjectID, ref: 'Color'}],
    size: Number,
    quad: {type: Schema.Types.ObjectID, ref: 'Quad'},
    x: Number,
    y: Number
})

const Artist = mongoose.model('Artist', ArtistSchema);

module.exports = Artist;