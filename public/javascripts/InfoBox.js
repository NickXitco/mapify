let infoBox = document.getElementById("infoBox");
let infoBoxArtistName = document.getElementById("infoBoxArtistName");
let infoBoxArtistGenre = document.getElementById("infoBoxArtistGenre");

function drawInfoBox(hoveredArtist) {
    if (!hoveredArtist) {
        infoBox.style.visibility = "hidden";
        return;
    }

    push();
    const point = camera.virtual2screen({x: hoveredArtist.x, y: hoveredArtist.y});
    infoBox.style.visibility = "visible";
    infoBox.style.borderColor = hoveredArtist.color.toString();
    infoBox.style.boxShadow = "0 0 3px 1px " + hoveredArtist.color.toString();

    infoBoxArtistName.innerText = hoveredArtist.name;
    if (hoveredArtist.genres.length > 0) {
        infoBoxArtistGenre.innerText = hoveredArtist.genres[0];
    } else {
        infoBoxArtistGenre.innerText = "";
    }

    if (point.x >= width / 2) {
        infoBox.style.borderRadius =  "50px 0 100px 0";
        infoBox.style.textAlign = "left";
        infoBoxArtistName.style.float = "left";
        infoBoxArtistGenre.style.float = "left";
        infoBoxArtistName.style.padding = "10px 50px 0 20px";
        infoBoxArtistGenre.style.padding = "0 75px 10px 20px";
    } else {
        infoBox.style.borderRadius =  "0 50px 0 100px";
        infoBox.style.textAlign = "right";
        infoBoxArtistName.style.float = "right";
        infoBoxArtistGenre.style.float = "right";
        infoBoxArtistName.style.padding = "10px 20px 0 50px";
        infoBoxArtistGenre.style.padding = "0 20px 10px 75px";
    }

    const w = Math.max(infoBoxArtistName.clientWidth, infoBoxArtistGenre.clientWidth);
    const h = infoBoxArtistName.clientHeight + infoBoxArtistGenre.clientHeight;

    infoBox.style.width = w + "px";
    infoBox.style.height = h + "px";

    infoBox.style.top = (point.y) + "px";

    if (point.x >= width / 2) {
        infoBox.style.left = (point.x - w - 6) + "px";
    } else {
        infoBox.style.left = (point.x) + "px";
    }

    pop();
}