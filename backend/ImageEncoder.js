const fs = require('fs');
const path = require('path');

function encodeImage(imgName) {
    const p = path.resolve(__dirname, '../resources/quadImages/', imgName + '.png');
    try {
        return fs.readFileSync(p);
    } catch {
        return "";
    }

}

function decodeImage(blob) {
    //TODO implement
}


module.exports = {encodeImage, decodeImage};