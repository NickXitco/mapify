const SpotifyWebApi = require('spotify-web-api-node');
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();
let spotifyApi = null;

async function getAPICredentials() {
    if (!process.env.clientID) {
        const [secret] = await client.accessSecretVersion({
            name: 'projects/785245481415/secrets/clientSecret/versions/1'
        })

        const [id] = await client.accessSecretVersion({
            name: 'projects/785245481415/secrets/clientID/versions/1'
        })

        return {secret: secret.payload.data.toString(), id: id.payload.data.toString()};
    } else {
        return {secret: process.env.clientSecret, id: process.env.clientID};
    }
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

function getAPI() {
    return spotifyApi;
}

module.exports={getAPI}
