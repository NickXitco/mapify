const {Database, aql} = require('arangojs');
let db = process.env.arangoPass ? new Database() : null;

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

if (!process.env.arangoPass) {
    getDBCredentials().then((res) => {
        const ca = res.ca;
        const pass = res.pass;

        db = new Database({url: "https://75ef552e726a.arangodb.cloud:18529", agentOptions: {ca: Buffer.from(ca, "base64")}});
        db.useBasicAuth("root", pass);
    })
} else {
    db = new Database({url: "https://75ef552e726a.arangodb.cloud:18529", agentOptions: {ca: Buffer.from(process.env.arangoCA, "base64")}});
    db.useBasicAuth("root", process.env.arangoPass);

    // db.useDatabase('_system');
    // db.useBasicAuth("root", "root");
}


function getDB() {
    return db;
}

module.exports={getDB}
