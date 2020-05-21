let searchPoint = null;
let searchInput = document.getElementById("searchInput");
let suggestionTexts = [document.getElementById("suggestionText1"), document.getElementById("suggestionText2"), document.getElementById("suggestionText3"), document.getElementById("suggestionText4"), document.getElementById("suggestionText5")];
let suggestionBoxes = [document.getElementById("suggestion1"), document.getElementById("suggestion2"), document.getElementById("suggestion3"), document.getElementById("suggestion4"), document.getElementById("suggestion5")];
let searchDiv = document.getElementById("searchBox");
let recentSuggestedArtists = [];
let searchHover = false;

searchInput.onkeyup = async function (e) {
    if (e.key === 'Enter' && searchInput.value.length > 0) {
        loadArtistFromSearch(searchInput.value, false).then(_ => {
            resetSidebar(false);
        });
    }

    let suggestionsHeight = 34;

    if (searchInput.value.length > 2) {
        const url = "artistSearch/" + searchInput.value;
        const response = await fetch(url);
        const data = await response.json();

        if (data.length === 0) {
            suggestionTexts[0].innerText = "No Results Found.";
            suggestionTexts[0].fontWeight = "600";
            suggestionBoxes[i].style.display = "block";
            suggestionsHeight += 20;

            for (let i = 1; i < suggestionTexts.length; i++) {
                suggestionBoxes[i].style.display = "none";
                suggestionTexts[i].style.height = "0";
            }
        } else {
            suggestionTexts[0].fontWeight = "300";
        }

        recentSuggestedArtists = data;

        for (let i = 0; i < suggestionTexts.length; i++) {
            if (data.length >= i + 1) {
                suggestionTexts[i].innerText = data[i].name;
                suggestionBoxes[i].style.display = "block";
                suggestionsHeight += 20;
            } else {
                suggestionTexts[i].innerText = "";
                suggestionBoxes[i].style.display = "none";
            }
        }
    } else {
        for (let i = 0; i < suggestionTexts.length; i++) {
            suggestionTexts[i].innerText = "";
            suggestionBoxes[i].style.display = "none";
        }
    }

    searchDiv.style.height = suggestionsHeight + "px";
}