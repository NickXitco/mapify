const mongoose = require('mongoose');


function cleanDB() {
    const ColorModel = mongoose.model('Color');
    const QuadModel = mongoose.model('Quad');

    ColorModel.deleteMany({}, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Deleted Colors");
        }
    })

    QuadModel.deleteMany({}, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Deleted Quads");
        }
    })
}

module.exports = {cleanDB};
