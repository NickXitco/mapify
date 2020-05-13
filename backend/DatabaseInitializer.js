function initDB() {
    console.log("Initializing Database...");
    require('../models/ArtistModel');
    require('../models/QuadModel');
    require('../models/GenreModel');
    console.log("Database Initialized!");
}

module.exports = {initDB};