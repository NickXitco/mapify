const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ArtistSchema = mongoose.model('Artist').schema;

const QuadSchema = new Schema({
    name: String,
    x: Number,
    y: Number,
    r: Number,
    image: String,
    leaf: Boolean,
    nodes: [{type: Schema.Types.ObjectId, ref: 'Artist'}]
})

const Quad = mongoose.model('Quad', QuadSchema);

module.exports = Quad;