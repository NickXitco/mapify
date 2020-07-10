const VersionHelper = {
    showingChangelog: false,

    checkVersion: function(versionNumber) {
        const clientVersion = localStorage.getItem('mapify-version');
        if (clientVersion !== versionNumber) {
            localStorage.setItem('mapify-version', versionNumber);
            return false;
        } else {
            return true;
        }
    },

    drawChangelog: function () {
        const newDiv = document.createElement("div");
        newDiv.setAttribute('class', 'changelog');
        const newContent = document.createTextNode("Hi there and greetings!");
        newDiv.appendChild(newContent);

        document.body.appendChild(newDiv);
        this.showingChangelog = true;
    },

    removeChangelog: function () {
        document.body.removeChild(document.getElementsByClassName('changelog')[0]);
        this.showingChangelog = false;
    }
}

