const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');


const client = new SecretManagerServiceClient();

async function accessSecretVersion() {
    const [version] = await client.accessSecretVersion({
        name: 'projects/785245481415/secrets/mongopass/versions/latest'
    })

    return version.payload.data.toString();
}

accessSecretVersion().then(pass => {
    const mongoDB = "mongodb+srv://NickXitco:" + pass + "@urania.yaug6.gcp.mongodb.net/mapify?retryWrites=true&w=majority";
    mongoose.connect(mongoDB, {useNewUrlParser: true});
    mongoose.set('useUnifiedTopology', true);

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error: '));
});


/* GET home page. */
router.get('/', function (req, res) {
    res.sendFile("index.html");
    res.status(200).json({ message: 'Connected!' });
});

module.exports = router;