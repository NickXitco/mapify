const mongoose = require('mongoose');


function cleanDB() {
    const QuadModel = mongoose.model('Quad');
    const ArtistModel = mongoose.model('Artist');

    QuadModel.deleteMany({}, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Deleted Quads");
        }
    })

    ArtistModel.deleteMany({}, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Deleted Artists");
        }
    })
}

module.exports = {cleanDB};
