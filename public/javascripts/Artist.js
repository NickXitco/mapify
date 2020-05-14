class Artist {
    name;
    id;

    followers;
    popularity;

    x;
    y;
    size;

    color;

    genres;

    relatedIDs;
    relatedVertices;

    quad;

    loaded;

    constructor(name, id, followers, popularity, x, y, size, color, genres, relatedIDs) {
        this.name = name;
        this.id = id;
        this.followers = followers;
        this.popularity = popularity;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.genres = genres;
        this.relatedIDs = relatedIDs;

        this.relatedVertices = [];
        this.quad = null;
        this.loaded = false;
    }

}
