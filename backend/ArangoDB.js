const Database = require('arangojs').Database;
const db = new Database();
db.useDatabase('_system');
db.useBasicAuth("root", "root");

function getDB() {
    return db;
}

module.exports={getDB}
