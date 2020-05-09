const mongoose = require('mongoose');
const readLine = require('readline');
const fs = require('fs');
const ImageEncoder = require('../backend/ImageEncoder');

async function populateQuads() {
    const Quad = mongoose.model('Quad');

    async function readQuadsFromFile() {
        const readInterface = readLine.createInterface({
            input: fs.createReadStream('./resources/quads/quadInfo.tsv'),
            output: process.stdout,
            console: false
        });

        for await (const line of readInterface) {
            const split = line.split('\t');
            const name = split[0];
            const x = parseFloat(split[1]);
            const y = parseFloat(split[2]);
            const r = parseFloat(split[3]);
            const leaf = split[4] === "true";
            const image = ImageEncoder.encodeImage(name).toString('base64');
            Quad.create({
                name: name,
                x: x,
                y: y,
                r: r,
                image: image,
                leaf: leaf
            }, (err, _) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }

    async function fixBadImages() {
        const badImages = await Quad.find({image: /PNG/});

        for (const q of badImages) {
            q.image = ImageEncoder.encodeImage(q.name).toString('base64');
            q.save(err => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }

    //await readQuadsFromFile();
    //await fixBadImages();

    return true;
}

module.exports = {populateQuads};

//add all genres, artists, quads, quad images, colors to the database