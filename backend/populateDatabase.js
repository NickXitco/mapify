const mongoose = require('mongoose');
const readLine = require('readline');
const fs = require('fs');
const ImageEncoder = require('../backend/ImageEncoder');
const DatabaseInitializer = require('../backend/DatabaseInitializer');
const mongoDB = 'mongodb://127.0.0.1/mapifyDB';

mongoose.connect(mongoDB, {useNewUrlParser: true});
mongoose.set('useUnifiedTopology', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

const myArgs = process.argv.slice(2);
DatabaseInitializer.initDB();

switch (myArgs[0]) {
    case 'all':
        console.log('Populating Database...')
        populateDatabase().then(r => {if (r) console.log('Database Population Complete!')});
        break;
    case 'quads':
        console.log('Populating Quads...')
        populateQuads().then(r => {if (r) console.log('Quad Population Complete!')});
        break;
    case 'quadNodes':
        console.log('Populating Quad Nodes...')
        setQuadNodeLists().then(r => {if (r) console.log('Quad Nodes Population Complete!')});
        break;
    case 'artists':
        console.log('Populating Artists...')
        populateArtists().then(r => {if (r) console.log('Artist Population Complete!')});
        break;
    default:
        console.log('Argument Error');
        console.error(myArgs);
}

async function populateQuads() {
    const Artist = mongoose.model('Artist');
    const Quad = mongoose.model('Quad');

    const readInterface = readLine.createInterface({
        input: fs.createReadStream('../resources/quads/quadInfoNodeList.tsv'),
        output: process.stdout,
        console: false
    });

    let count = 0;
    let longestLine = 0;

    for await (const line of readInterface) {
        const split = line.split('\t');
        const name = split[0];
        const x = parseFloat(split[1]);
        const y = parseFloat(split[2]);
        const r = parseFloat(split[3]);
        const leaf = split[4] === "true";
        const image = ImageEncoder.encodeImage(name).toString('base64');
        const nodes = [];
        for (let i = 5; i < split.length; i++) {
            nodes.push(await Artist.findOne({id: split[i]}).exec());
        }
        longestLine = Math.max(longestLine, split.length);

        Quad.create({
            name: name,
            x: x,
            y: y,
            r: r,
            image: image,
            leaf: leaf,
            nodes: nodes
        }, (err, _) => {
            if (err) {
                console.log(err);
            }
            count++;
            if (count % 10000 === 0) {
                console.log(count + " quads populated.");
                console.log(`Current longest line: ${longestLine}`);
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