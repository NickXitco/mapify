const mongoose = require('mongoose');
const SpotifyWebApi = require('spotify-web-api-node');
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();
let spotifyApi = null;

async function getAPICredentials() {
    const [secret] = await client.accessSecretVersion({
        name: 'projects/785245481415/secrets/clientSecret/versions/1'
    })

    const [id] = await client.accessSecretVersion({
        name: 'projects/785245481415/secrets/clientID/versions/1'
    })

    return {secret: secret.payload.data.toString(), id: id.payload.data.toString()};
}

getAPICredentials().then((res) => {
    const clientID = res.id;
    const clientSecret = res.secret;

    spotifyApi = new SpotifyWebApi({
        clientId: clientID,
        clientSecret: clientSecret,
    });

    setAccessToken();
})

setInterval(setAccessToken, 1000 * 60 * 60);

function setAccessToken() {
    // Retrieve an access token
    spotifyApi.clientCredentialsGrant().then(
        function (data) {
            console.log('The access token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);

            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
        },
        function (err) {
            console.log(
                'Something went wrong when retrieving an access token',
                err.message
            );
        }
    );
}

async function findArtist(query, isQueryID) {
    const Artist = mongoose.model('Artist');
    let artist;
    if (isQueryID) {
        artist = await Artist.findOne({id: query}).exec();
    } else {
        artist = await runSearch(query, Artist, 1);
        if (artist.length === 1) {
            artist = artist[0];
        } else {
            artist = null;
        }
    }

    if (!artist) {
        return {};
    }

    const images = await spotifyApi.getArtist(artist.id).then(data => {
        return data.body.images;
    })

    return {
        name: artist.name,
        id: artist.id,
        followers: artist.followers,
        popularity: artist.popularity,
        size: artist.size,
        x: artist.x,
        y: artist.y,
        r: artist.r,
        g: artist.g,
        b: artist.b,
        genres: artist.genres,
        related: await Artist.find().where('id').in(artist.related).exec(),
        images: images
    };
}

function runSearch(searchTerm, Artist, limit) {
    return spotifyApi.searchArtists(searchTerm, {limit: limit, offset: 0})
        .then(function (data) {
            let promises = []
            for (const item of data.body.artists.items) {
                promises.push(Artist.findOne({id: item.id}).exec());
            }
            return Promise.all(promises).then((values) => {
                let realValues = []
                for (const value of values) {
                    if (value) {
                        realValues.push(value);
                    }
                }
                return realValues;
            })
        }, function (err) {
            console.error(err);
            return [];
        });
}

async function findArtistSearch(searchTerm) {
    const Artist = mongoose.model('Artist');
    const NUM_RESULTS = 5;
    return runSearch(searchTerm, Artist, NUM_RESULTS);
}

module.exports = {findArtist, findArtistSearch};