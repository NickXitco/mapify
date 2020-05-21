let sidebar = document.getElementById("sidebar");
let sidebarStroke = document.getElementById("sidebarStroke");
let sidebarArtistName = document.getElementById("sidebarArtistName");
let sidebarFollowersCount = document.getElementById("followerCount");
let sidebarFollowersWord = document.getElementById("followers");
let sidebarFollowersRanking = document.getElementById("followerRanking");
let genresList = document.getElementById("genresList");
let relatedArtistsList = document.getElementById("relatedArtistsList");
let sidebarPicture = document.getElementById("sidebarPicture");
let sidebarOpenAmount = 0;
let sidebarArtist = null;
let sidebarHover = false;

const SIDEBAR_GENRE_LIMIT = 10;

function setSidebar(artist) {
    sidebarArtist = clickedArtist;
    sidebar.style.display = "block";
    let fontSize = 60;
    sidebarArtistName.style.fontSize = fontSize + "px";
    sidebarArtistName.innerText = artist.name;
    while (sidebarArtistName.clientHeight > 150 || sidebarArtistName.clientWidth > 400) {
        fontSize -= 2;
        sidebarArtistName.style.fontSize = fontSize + "px"
    }

    if (artist.followers >= 1000000) {
        sidebarFollowersCount.innerText = (artist.followers * 1.0 / 1000000).toFixed(1).toString() + " Million";
    } else if (artist.followers >= 1000) {
        sidebarFollowersCount.innerText = (artist.followers * 1.0 / 1000).toFixed(1).toString() + " Thousand";
    } else {
        sidebarFollowersCount.innerText = artist.followers;
    }

    if (artist.followers === 1) {
        sidebarFollowersWord.innerText = "Follower";
    } else {
        sidebarFollowersWord.innerText = "Followers";
    }

    if (artist.rank) {
        sidebarFollowersRanking.innerText = "(#" + artist.rank + ")";
    } else {
        sidebarFollowersRanking.innerText = "";
    }

    if (artist.genres) {
        let genreCount = 0;
        for (const genre of artist.genres) {
            const newGenre = document.createElement("li");
            newGenre.className = "sidebarListItem";
            newGenre.innerText = genre;
            genresList.appendChild(newGenre);
            genreCount++;
            if (genreCount === SIDEBAR_GENRE_LIMIT) {
                break;
            }
        }
    } else {
        //TODO don't show genre text at all;
    }

    if (artist.relatedVertices) {
        for (const r of artist.relatedVertices) {
            const newRelated = document.createElement("li");
            const id = r.id.valueOf();
            newRelated.className = "sidebarListItem";
            newRelated.innerText = r.name;
            newRelated.onclick = () => {
                getClickedRelated(id).then();
            };
            relatedArtistsList.appendChild(newRelated);
        }
    } else {
        //TODO don't show related text at all;
    }

    sidebarPicture.style.boxShadow = "0 0 13px 1px " + artist.color.toString();
    sidebarStroke.style.boxShadow = "0 0 13px 1px " + artist.color.toString();
    sidebarStroke.style.background = artist.color.toString();
    searchInput.style.borderColor = artist.color.toString();
    searchInput.style.boxShadow = "0 0 6px 0.5px " + artist.color.toString();
}

function resetSidebar(removeFromFlow) {
    sidebarArtist = null;
    sidebarArtistName.innerText = "";
    sidebarFollowersRanking.innerText = "";
    sidebarFollowersWord.innerText = "";
    sidebarFollowersCount.innerText = "";
    while (genresList.firstChild) {
        genresList.removeChild(genresList.lastChild);
    }

    while (relatedArtistsList.firstChild) {
        relatedArtistsList.removeChild(relatedArtistsList.lastChild);
    }

    searchInput.style.borderColor = "white";
    searchInput.style.boxShadow = "0 0 6px 0.5px white";

    if (removeFromFlow) {
        sidebar.style.display = "none";
        sidebarOpenAmount = 0;
        sidebar.style.left =  width / 4 + "px";
    }
}

function openSidebar() {
    const twentyFive = width / 4;
    sidebar.style.left = Utils.map(Eases.easeOutQuart(sidebarOpenAmount), 0, 1, twentyFive, 0) + "px";
    sidebarOpenAmount = Math.min(1, sidebarOpenAmount + 0.05);
}