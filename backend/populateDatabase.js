const mongoose = require('mongoose');
const readLine = require('readline');
const fs = require('fs');
const ImageEncoder = require('../backend/ImageEncoder');

async function populateQuads() {
    const Quad = mongoose.model('Quad');

    const readInterface = readLine.createInterface({
        input: fs.createReadStream('./resources/quads/quadInfo.tsv'),
        output: process.stdout,
        console: false
    });

    let count = 0;

    for await (const line of readInterface) {
        const split = line.split('\t');
        const name = split[0];
        const x = parseFloat(split[1]);
        const y = parseFloat(split[2]);
        const r = parseFloat(split[3]);
        const leaf = split[4] === "true";
        const image = ImageEncoder.encodeImage(name).toString('base64');
        const leafNodes = [];
        for (let i = 5; i < split.length; i++) {
            leafNodes.push(split[i]);
        }
        Quad.create({
            name: name,
            x: x,
            y: y,
            r: r,
            image: image,
            leaf: leaf,
            leafNodes: leafNodes
        }, (err, _) => {
            if (err) {
                console.log(err);
            }
            count++;
            if (count % 10000 === 0) {
                console.log(count + " quads populated.");
            }
        });
    }
    return true;
}

async function populateArtists() {
    const Artist = mongoose.model('Artist');

    const readInterface = readLine.createInterface({
        input: fs.createReadStream('./resources/artists/nodes.tsv'),
        output: process.stdout,
        console: false
    });

    let count = 0;

    for await (const line of readInterface) {
        const split = line.split('\t');
        const name = split[0];
        const id = split[1];
        const followers = parseInt(split[2]);
        const popularity = parseInt(split[3]);
        const size = parseFloat(split[4]);
        const x = parseFloat(split[5]);
        const y = parseFloat(split[6]);
        const r = parseInt(split[7]);
        const g = parseInt(split[8]);
        const b = parseInt(split[9]);
        const genres = [];
        let i = 10;
        for (i; split[i] !== ""; i++) {
            genres.push(split[i]);
        }
        i++;
        const related = [];
        for (i; split[i] !== ""; i++) {
            related.push(split[i]);
        }
        Artist.create({
            name: name,
            id: id,
            followers: followers,
            popularity: popularity,
            size: size,
            x: x,
            y: y,
            r: r,
            g: g,
            b: b,
            genres: genres,
            related: related
        }, (err, _) => {
            if (err) {
                console.log(err);
            }
            count++;
            if (count % 10000 === 0) {
                console.log(count + " artists populated.");
            }
        });
    }
    return true;
}

async function populateDatabase() {
    await populateQuads();
    await populateArtists();
    return true;
}

module.exports = {populateQuads, populateArtists, populateDatabase};

//add all genres, artists, quads, quad images, colors to the database