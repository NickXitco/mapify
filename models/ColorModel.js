const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ColorSchema = new Schema({
    r: Number,
    g: Number,
    b: Number,
    a: Number
})

const Color = mongoose.model('Color', ColorSchema);

module.exports = Color;
