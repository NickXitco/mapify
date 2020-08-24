const Database = require('arangojs').Database;
const db = new Database();
db.useDatabase('mapify');
db.useBasicAuth("root", "arango");

function getDB() {
    return db;
}

module.exports={getDB}
