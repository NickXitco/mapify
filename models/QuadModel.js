const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const QuadSchema = new Schema({
    name: String,
    A: {type: Schema.Types.ObjectID, ref: 'Quad'},
    B: {type: Schema.Types.ObjectID, ref: 'Quad'},
    C: {type: Schema.Types.ObjectID, ref: 'Quad'},
    D: {type: Schema.Types.ObjectID, ref: 'Quad'},
    parent: {type: Schema.Types.ObjectID, ref: 'Quad'},
    x: Number,
    y: Number,
    r: Number,
    //artists: [{type: Schema.Types.ObjectID, ref: 'Artist'}],
    image: String,
    leaf: Boolean
})

const Quad = mongoose.model('Quad', QuadSchema);

module.exports = Quad;