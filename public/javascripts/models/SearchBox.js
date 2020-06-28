const SearchBox = {
    point: null,
    input: document.getElementById("searchInput"),
    suggestionTexts: [document.getElementById("suggestionText1"), document.getElementById("suggestionText2"), document.getElementById("suggestionText3"), document.getElementById("suggestionText4"), document.getElementById("suggestionText5")],
    suggestionBoxes: [document.getElementById("suggestion1"), document.getElementById("suggestion2"), document.getElementById("suggestion3"), document.getElementById("suggestion4"), document.getElementById("suggestion5")],
    div: document.getElementById("searchBox"),
    recentSuggestedArtists: [],
    hoverFlag: false,

    //TODO refactor SearchBox to be an unordered list of suggestions instead of this nonsense

    processInput: async function (e) {
        if (e.key === 'Enter' && SearchBox.input.value.length > 0) {
            loadArtistFromSearch(SearchBox.input.value, false).then(_ => {
                Sidebar.resetSidebar(false);
            });
        }

        let suggestionsHeight = 34;

        if (SearchBox.input.value.length > 2) {
            const url = "artistSearch/" + SearchBox.input.value;
            const response = await fetch(url);
            const data = await response.json();

            if (data.length === 0) {
                SearchBox.suggestionTexts[0].innerText = "No Results Found.";
                SearchBox.suggestionTexts[0].fontWeight = "600";
                SearchBox.suggestionBoxes[i].style.display = "block";
                suggestionsHeight += 20;

                for (let i = 1; i < SearchBox.suggestionTexts.length; i++) {
                    SearchBox.suggestionBoxes[i].style.display = "none";
                    SearchBox.suggestionTexts[i].style.height = "0";
                }
            } else {
                SearchBox.suggestionTexts[0].fontWeight = "300";
            }

            SearchBox.recentSuggestedArtists = data;

            for (let i = 0; i < SearchBox.suggestionTexts.length; i++) {
                if (data.length >= i + 1) {
                    SearchBox.suggestionTexts[i].innerText = data[i].name;
                    SearchBox.suggestionBoxes[i].style.display = "block";
                    suggestionsHeight += 20;
                } else {
                    SearchBox.suggestionTexts[i].innerText = "";
                    SearchBox.suggestionBoxes[i].style.display = "none";
                }
            }
        } else {
            for (let i = 0; i < SearchBox.suggestionTexts.length; i++) {
                SearchBox.suggestionTexts[i].innerText = "";
                SearchBox.suggestionBoxes[i].style.display = "none";
            }
        }

        SearchBox.div.style.height = suggestionsHeight + "px";
    }
}

SearchBox.input.onkeyup = SearchBox.processInput;