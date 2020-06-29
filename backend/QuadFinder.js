const mongoose = require('mongoose');

async function findQuad(name) {
    const Quad = mongoose.model('Quad');
    return await Quad.findOne({name: name}).populate('nodes').exec();
}

module.exports = {findQuad};