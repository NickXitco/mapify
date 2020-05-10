function initDB() {
    console.log("Initializing Database...");
    require('../models/QuadModel');
    require('../models/ArtistModel');
    require('../models/GenreModel');
    console.log("Database Initialized!");
}

module.exports = {initDB};