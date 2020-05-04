const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const QuadImageSchema = new Schema({
    name: String,
    type: String,
    enc: Buffer,
    Quad: {type: Schema.Types.ObjectID, ref: 'Quad'}
})

const QuadImage = mongoose.model('QuadImage', QuadImageSchema);

module.exports = QuadImage;