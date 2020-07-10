const VersionHelper = {
    showingChangelog: false,
    versionNumber: "0.5.2",
    changes: [
        "Genre name text now is situated at centroid of fence",
    ],

    checkVersion: function() {
        const clientVersion = localStorage.getItem('mapify-version');
        if (clientVersion !== this.versionNumber) {
            localStorage.setItem('mapify-version', this.versionNumber);
            return false;
        } else {
            return true;
        }
    },

    drawChangelog: function () {
        const changelogDiv = document.createElement("div");
        changelogDiv.setAttribute('class', 'changelog');

        const innerChangelogDiv = document.createElement("div");
        innerChangelogDiv.setAttribute('class', 'changelog-inner');
        changelogDiv.appendChild(innerChangelogDiv);

        const versionHeader = document.createElement("h2");
        const versionText = document.createTextNode(`Version ${this.versionNumber}`);

        const changeList = document.createElement("ul");
        changeList.setAttribute('class', 'changelog-list');
        changeList.style.margin = "5%";

        for (const change of this.changes) {
            const changeLi = document.createElement("li");
            changeLi.setAttribute('class', 'changelog-list-item');
            const changeP = document.createElement("p");
            const changeText = document.createTextNode(change);
            changeP.appendChild(changeText);
            changeLi.appendChild(changeP);
            changeList.appendChild(changeLi);
        }

        versionHeader.appendChild(versionText);
        innerChangelogDiv.appendChild(versionHeader);
        innerChangelogDiv.appendChild(changeList);

        document.body.appendChild(changelogDiv);
        this.showingChangelog = true;
    },

    removeChangelog: function () {
        document.body.removeChild(document.getElementsByClassName('changelog')[0]);
        this.showingChangelog = false;
    }
}

