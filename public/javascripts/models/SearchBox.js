let suggestionCounter = 0;

const SearchBox = {
    point: null,
    input: document.getElementById("searchInput"),
    suggestionsList: document.getElementById("suggestions"),
    div: document.getElementById("searchBox"),
    recentSuggestedArtists: [],
    hoverFlag: false,
    requests: new Cache(20),

    processInput: async function (e) {
        const currentInput = this.input.value.valueOf();
        this.deleteSuggestions();

        if (e.key === 'Enter' && currentInput.length > 0) {
            loadArtistFromSearch(currentInput, false).then(_ => {
                Sidebar.resetSidebar(false);
            });
            return;
        }

        console.log(e.key);

        const url = "artistSearch/" + encodeURIComponent(currentInput);

        const currentCount = suggestionCounter.valueOf();
        const currentTime = performance.now();
        console.log(`Sending suggestion request ${currentCount}: \"${url}\"`);
        suggestionCounter++;
        const response = await fetch(url);
        const data = await response.json();
        console.log(`Received suggestion response ${currentCount} in ${performance.now() - currentTime}ms`);

        for (const suggestion of data) {
            this.addSuggestion(suggestion);
        }
    },

    deleteSuggestions: function () {
        let child = this.suggestionsList.lastChild;
        while(child) {
            this.suggestionsList.removeChild(child);
            child = this.suggestionsList.lastChild;
        }
    },

    addSuggestion: function (suggestion) {
        let suggestionDiv = document.createElement('li');
        suggestionDiv.className = "suggestion";
        let artistDiv = document.createElement('div');
        artistDiv.className = "suggestedArtist";
        let p = document.createElement('p');
        let suggestionText = document.createTextNode(suggestion['name']);
        p.appendChild(suggestionText);
        artistDiv.appendChild(p);
        suggestionDiv.appendChild(artistDiv);
        this.suggestionsList.appendChild(suggestionDiv);
    }
}

SearchBox.input.oninput = SearchBox.processInput.bind(SearchBox);