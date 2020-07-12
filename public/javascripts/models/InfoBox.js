const InfoBox  ={
    div: document.getElementById("infoBox"),
    artistName: document.getElementById("infoBoxArtistName"),
    artistGenre: document.getElementById("infoBoxArtistGenre"),
    
    drawInfoBox: function (hoveredArtist) {
        if (!hoveredArtist) {
            this.div.style.visibility = "hidden";
            return;
        }

        p.push();
        const point = camera.virtual2screen({x: hoveredArtist.x, y: hoveredArtist.y});
        this.div.style.visibility = "visible";
        this.div.style.borderColor = hoveredArtist.color.toString();
        this.div.style.boxShadow = "0 0 3px 1px " + hoveredArtist.color.toString();

        this.artistName.innerText = hoveredArtist.name;
        if (hoveredArtist.genres.length > 0) {
            this.artistGenre.innerText = hoveredArtist.genres[0];
        } else {
            this.artistGenre.innerText = "";
        }

        if (point.x >= p.width / 2) {
            this.div.style.borderRadius =  "50px 0 100px 0";
            this.div.style.textAlign = "left";
            this.artistName.style.float = "left";
            this.artistGenre.style.float = "left";
            this.artistName.style.padding = "10px 50px 0 20px";
            this.artistGenre.style.padding = "0 75px 10px 20px";
        } else {
            this.div.style.borderRadius =  "0 50px 0 100px";
            this.div.style.textAlign = "right";
            this.artistName.style.float = "right";
            this.artistGenre.style.float = "right";
            this.artistName.style.padding = "10px 20px 0 50px";
            this.artistGenre.style.padding = "0 20px 10px 75px";
        }

        const w = Math.max(this.artistName.clientWidth, this.artistGenre.clientWidth);
        const h = this.artistName.clientHeight + this.artistGenre.clientHeight;

        this.div.style.width = w + "px";
        this.div.style.height = h + "px";

        this.div.style.top = (point.y) + "px";

        if (point.x >= p.width / 2) {
            this.div.style.left = (point.x - w - 6) + "px";
        } else {
            this.div.style.left = (point.x) + "px";
        }

        p.pop();
    }
}