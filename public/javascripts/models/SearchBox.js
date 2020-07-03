const SearchBox = {
    point: null,
    input: document.getElementById("searchInput"),
    suggestionsList: document.getElementById("suggestions"),
    div: document.getElementById("searchBox"),
    recentSuggestedArtists: [],
    hoverFlag: false,
    requestCounter: 0,
    highestReceivedResponse: 0,

    processInput: async function (e) {
        const currentInput = this.input.value.valueOf();

        const url = "artistSearch/" + encodeURIComponent(currentInput);

        const currentCount = this.requestCounter.valueOf();

        this.requestCounter++;

        const response = await fetch(url);
        const data = await response.json();

        //Only accept a response if it's the latest request we've gotten back
        if (currentCount > this.highestReceivedResponse) {
            this.highestReceivedResponse = currentCount;
            this.processSuggestions(data);
        }
    },

    processSubmit: async function (e) {
        if (e.key !== "Enter") {
            return;
        }

        const currentInput = this.input.value.valueOf();

        if (currentInput.length > 0) {
            loadArtistFromSearch(currentInput, false).then(_ => {
                Sidebar.resetSidebar(false);
            });
            this.deleteSuggestions();
            this.input.value = "";
        }
    },

    processClick: async function(suggestion) {
        loadArtistFromSearch(suggestion['name'], false).then(_ => {
            Sidebar.resetSidebar(false);
        });
        this.deleteSuggestions();
        this.input.value = "";
    },

    processSuggestions: function(data) {
        this.deleteSuggestions();

        if (data.length === 0) {
            this.noResults();
        } else {
            for (const suggestion of data) {
                this.addSuggestion(suggestion);
            }
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
        p.onclick = () => this.processClick(suggestion.valueOf());
        artistDiv.appendChild(p);
        suggestionDiv.appendChild(artistDiv);
        this.suggestionsList.appendChild(suggestionDiv);
    },

    noResults: function () {
        let suggestionDiv = document.createElement('li');
        suggestionDiv.className = "suggestion";
        let artistDiv = document.createElement('div');
        artistDiv.className = "suggestedArtist";
        let p = document.createElement('p');
        let suggestionText = document.createTextNode("No Results Found.");
        p.appendChild(suggestionText);
        artistDiv.appendChild(p);
        suggestionDiv.appendChild(artistDiv);
        this.suggestionsList.appendChild(suggestionDiv);
    },

    focus: function () {
        this.hoverFlag = true;
    },

    unfocus: function () {
        this.hoverFlag = false;
    }
}

SearchBox.input.oninput = SearchBox.processInput.bind(SearchBox);
SearchBox.input.onkeydown = SearchBox.processSubmit.bind(SearchBox);