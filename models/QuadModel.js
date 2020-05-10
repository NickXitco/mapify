const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const QuadSchema = new Schema({
    name: String,
    x: Number,
    y: Number,
    r: Number,
    image: String,
    leaf: Boolean,
    leafNodes: [String]
})

const Quad = mongoose.model('Quad', QuadSchema);

module.exports = Quad;