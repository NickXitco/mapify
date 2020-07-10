const Sidebar = {

    dom: document.getElementById("sidebar"),
    stroke: document.getElementById("sidebarStroke"),
    artistName: document.getElementById("sidebarArtistName"),
    followersCount: document.getElementById("followerCount"),
    followersWord: document.getElementById("followers"),
    followersRanking: document.getElementById("followerRanking"),
    genresSection: document.getElementById("genresSection"),
    genresList: document.getElementById("genresList"),
    relatedArtistSection: document.getElementById("relatedArtistsSection"),
    relatedArtistsList: document.getElementById("relatedArtistsList"),
    picture: document.getElementById("sidebarPicture"),
    scrollbar_style: document.getElementById("scrollbar_style"),
    openAmount: 0,
    artist: null,
    hoverFlag: false,

    SIDEBAR_GENRE_LIMIT: 10,

    openSidebar: function () {
        const twentyFive = width / 4;
        Sidebar.dom.style.left = Utils.map(Eases.easeOutQuart(Sidebar.openAmount), 0, 1, twentyFive, 0) + "px";
        Sidebar.openAmount = Math.min(1, Sidebar.openAmount + 0.05);
    },

    resetSidebar: function (removeFromFlow) {
        Sidebar.artist = null;
        Sidebar.artistName.innerText = "";
        Sidebar.followersRanking.innerText = "";
        Sidebar.followersWord.innerText = "";
        Sidebar.followersCount.innerText = "";
        while (Sidebar.genresList.firstChild) {
            Sidebar.genresList.removeChild(Sidebar.genresList.lastChild);
        }

        while (Sidebar.relatedArtistsList.firstChild) {
            Sidebar.relatedArtistsList.removeChild(Sidebar.relatedArtistsList.lastChild);
        }

        SearchBox.input.style.borderColor = "white";
        SearchBox.input.style.boxShadow = "0 0 6px 0.5px white";

        if (removeFromFlow) {
            Sidebar.dom.style.display = "none";
            Sidebar.openAmount = 0;
            Sidebar.dom.style.left = width / 4 + "px";
        }
    },

    setArtistSidebar: function (artist) {
        Sidebar.artist = clickedArtist;
        Sidebar.dom.style.display = "flex";
        let fontSize = 60;
        Sidebar.artistName.style.fontSize = fontSize + "px";
        Sidebar.artistName.innerText = artist.name;

        while (Sidebar.artistName.clientHeight > 150 || Sidebar.artistName.clientWidth > 375) {
            fontSize -= 2; //TODO compute this exactly rather than iteratively?
            Sidebar.artistName.style.fontSize = fontSize + "px"
        }

        if (artist.followers >= 1000000) {
            Sidebar.followersCount.innerText = (artist.followers * 1.0 / 1000000).toFixed(1).toString() + " Million";
        } else if (artist.followers >= 1000) {
            Sidebar.followersCount.innerText = (artist.followers * 1.0 / 1000).toFixed(1).toString() + " Thousand";
        } else {
            Sidebar.followersCount.innerText = artist.followers.toString();
        }

        Sidebar.followersWord.innerText = artist.followers === 1 ? "Follower" : "Followers";
        Sidebar.followersRanking.innerText = artist.rank ? "(#" + artist.rank + ")" : "";

        if (artist.genres.length > 0) {
            Sidebar.genresSection.style.display = "block";
            let genreCount = 0;
            for (const genre of artist.genres) {
                const newGenre = document.createElement("li");
                const genreName = genre.valueOf().toString();
                newGenre.className = "sidebarListItem";
                newGenre.innerText = genreName;
                newGenre.onclick = () => {
                    edgeDrawing = false;
                    GenreHelpers.getGenre(genreName).then();
                };
                Sidebar.genresList.appendChild(newGenre);
                genreCount++;
                if (genreCount === Sidebar.SIDEBAR_GENRE_LIMIT) {
                    break;
                }
            }
        } else {
            Sidebar.genresSection.style.display = "none";
        }

        if (artist.relatedVertices.size > 0) {
            Sidebar.relatedArtistSection.style.display = "flex";
            for (const r of artist.relatedVertices) {
                const newRelated = document.createElement("li");
                const id = r.id.valueOf();
                newRelated.className = "sidebarListItem";
                newRelated.innerText = r.name;
                newRelated.onclick = () => {
                    getClickedRelated(id).then();
                };
                Sidebar.relatedArtistsList.appendChild(newRelated);
            }
        } else {
            Sidebar.relatedArtistSection.style.display = "none";
        }

        Sidebar.picture.style.boxShadow = "0 0 13px 1px " + artist.color.toString();
        Sidebar.stroke.style.boxShadow = "0 0 13px 1px " + artist.color.toString();
        Sidebar.stroke.style.background = artist.color.toString();
        Sidebar.scrollbar_style.innerHTML = `::-webkit-scrollbar-track {box-shadow: 0 0 5px ${artist.color.toString()};}  \n` +
            `::-webkit-scrollbar-thumb {background: ${artist.color.toString()};}`


        SearchBox.input.style.borderColor = artist.color.toString();
        SearchBox.input.style.boxShadow = "0 0 6px 0.5px " + artist.color.toString();
    },

    //TODO I KNOW THIS IS AN ABOMINATION GIMME A SEC
    setGenreSidebar: function () {
        Sidebar.dom.style.display = "flex";
        let fontSize = 60;
        Sidebar.artistName.style.fontSize = fontSize + "px";
        Sidebar.artistName.innerText = "Genre";

        while (Sidebar.artistName.clientHeight > 150 || Sidebar.artistName.clientWidth > 375) {
            fontSize -= 2;
            Sidebar.artistName.style.fontSize = fontSize + "px"
        }

        if (GenreHelpers.genreNodes.size >= 1000000) {
            Sidebar.followersCount.innerText = (GenreHelpers.genreNodes.size / 1000000).toFixed(1).toString() + " Million";
        } else if (GenreHelpers.genreNodes.size >= 1000) {
            Sidebar.followersCount.innerText = (GenreHelpers.genreNodes.size / 1000).toFixed(1).toString() + " Thousand";
        } else {
            Sidebar.followersCount.innerText = GenreHelpers.genreNodes.size.toString();
        }

        Sidebar.followersWord.innerText = GenreHelpers.genreNodes.size === 1 ? "Genre Member" : "Genre Members";

        Sidebar.genresSection.style.display = "none";

        if (GenreHelpers.genreNodes.size > 0) {
            Sidebar.relatedArtistSection.style.display = "flex";
            for (const r of GenreHelpers.genreNodes) {
                const newRelated = document.createElement("li");
                const id = r.id.valueOf();
                newRelated.className = "sidebarListItem";
                newRelated.innerText = r.name;
                newRelated.onclick = () => {
                    getClickedRelated(id).then();
                };
                Sidebar.relatedArtistsList.appendChild(newRelated);
            }
        } else {
            Sidebar.relatedArtistSection.style.display = "none";
        }

        Sidebar.picture.style.boxShadow = "0 0 13px 1px white";
        Sidebar.stroke.style.boxShadow = "0 0 13px 1px white";
        Sidebar.stroke.style.background = "white";
        Sidebar.scrollbar_style.innerHTML = `::-webkit-scrollbar-track {box-shadow: 0 0 5px white;}  \n` +
            `::-webkit-scrollbar-thumb {background: white;}`


        SearchBox.input.style.borderColor = "white";
        SearchBox.input.style.boxShadow = "0 0 6px 0.5px white";
    },

    setVersionSidebar: function () {

    }

}