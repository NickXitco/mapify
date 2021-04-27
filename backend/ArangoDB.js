"use strict"
const arangojs = require('arangojs');
let db = null;

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getDBCredentials() {
    const [ca] = await client.accessSecretVersion({
        name: 'projects/785245481415/secrets/arangoCA/versions/2'
    })

    const [pass] = await client.accessSecretVersion({
        name: 'projects/785245481415/secrets/arangoPass/versions/2'
    })

    return {ca: ca.payload.data.toString(), pass: pass.payload.data.toString()};
}

getDBCredentials().then((res) => {
    const ca = res.ca;
    const pass = res.pass;

    db = arangojs({url: "https://75ef552e726a.arangodb.cloud:18529", agentOptions: {ca: Buffer.from(ca, "base64")}});
    db.useBasicAuth("root", pass);
})

function getDB() {
    return db;
}

module.exports={getDB}
