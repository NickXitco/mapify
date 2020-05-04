const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GenreSchema = new Schema({
    name: String,
    color: {type: Schema.Types.ObjectID, ref: 'Color'},
    artists: [{type: Schema.Types.ObjectID, ref: 'Artist'}]
})

const Genre = mongoose.model('Genre', GenreSchema);

module.exports = Genre;