const Database = require('arangojs').Database;
const db = new Database();
db.useDatabase('_system');
db.useBasicAuth("root", "root");

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getDBCredentials() {
    const [ca] = await client.accessSecretVersion({
        name: 'projects/785245481415/secrets/arangoCA/versions/1'
    })

    const [pass] = await client.accessSecretVersion({
        name: 'projects/785245481415/secrets/arangoPass/versions/1'
    })

    return {ca: ca.payload.data.toString(), pass: pass.payload.data.toString()};
}

getDBCredentials().then((res) => {
    const ca = res.ca;
    const pass = res.pass;

    db = arangojs({url: "https://dfac35b175a7.arangodb.cloud:18529", agentOptions: {ca: Buffer.from(ca, "base64")}});
    db.useBasicAuth("root", pass);
})

function getDB() {
    return db;
}

module.exports={getDB}
