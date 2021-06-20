let player;
let deviceID;

window.onSpotifyPlayerAPIReady = () => {
    setTimeout(() => {initPlayer()}, 100);
}

function initPlayer() {
    let token = window.localStorage.getItem('spotifyToken');
    if (!token || token === "") {
        return;
    }

    token = JSON.parse(token);

    //Token is _probably_ expired if this test passes
    if (Date.now() - token.timeReceived > 3600 * 1000) {
        player = null;
        return;
    }

    let prevVolume = window.localStorage.getItem('volume');
    let parsedVolume = 0.5;
    try {
        if (prevVolume) {
            const v = Number(JSON.parse(prevVolume));
            parsedVolume = isNaN(v) ? 0.5 : v;
        }
    } catch (e) {
        window.localStorage.setItem('volume', JSON.stringify(0.5));
    }

    let vol = parsedVolume;

    const tempPlayer = new Spotify.Player({
        name: 'The Artist Observatory',
        getOAuthToken: cb => { cb(token.accessToken); },
        volume: vol
    });

    // Error handling
    tempPlayer.addListener('initialization_error', ({ message }) => { console.error(message); });
    tempPlayer.addListener('authentication_error', ({ message }) => { console.error(message); });
    tempPlayer.addListener('account_error', ({ message }) => { console.error(message); });
    tempPlayer.addListener('playback_error', ({ message }) => { console.error(message); });

    // Ready
    tempPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        player = tempPlayer;
        deviceID = device_id;
    });

    // Not Ready
    tempPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    tempPlayer.connect();
}