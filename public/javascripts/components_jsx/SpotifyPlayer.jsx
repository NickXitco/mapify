class SpotifyPlayer extends React.Component {
    timerID
    constructor(props) {
        super(props);

        this.state = {
            playerState: null,
            volume: 0,
            live: this.props.live
        }

        this.playPause = this.playPause.bind(this);
        this.forward = this.forward.bind(this);
        this.backward = this.backward.bind(this);
        this.shuffle = this.shuffle.bind(this);
        this.adjustVolume = this.adjustVolume.bind(this);
        this.seek = this.seek.bind(this);
        this.repeat = this.repeat.bind(this);
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            250
        );

        // Playback status updates
        if (player) {
            player.addListener('player_state_changed', () => { this.tick() });
        }
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    playPause() {
        let token = window.localStorage.getItem('spotifyToken');
        if (!token || token === "") {
            return;
        }

        token = JSON.parse(token);
        const command = !this.state.live || !this.state.playerState || this.state.playerState.paused ? 'play' : 'pause'
        let body = '';

        if (!this.state.live && command === 'play') {
            //We need to start the specific track
            const uris = [];
            for (const track of this.props.trackQueue) {
                uris.push(`spotify:track:${track.id}`)
            }

            body = JSON.stringify({uris: uris});
        }

        if (this.state.live && !this.state.playerState) {
            //Must be playing from a saved state
            let previousState = window.localStorage.getItem('playerState');
            if (!previousState) {
                //This is a bad operation and will fail
                return;
            }

            let state = JSON.parse(previousState);

            const uris = [];
            uris.push(`spotify:track:${state.track_window.current_track.id}`)
            for (const track of state.track_window.next_tracks) {
                uris.push(`spotify:track:${track.id}`)
            }

            body = JSON.stringify({uris: uris, position_ms: state.position});
        }

        fetch(`https://api.spotify.com/v1/me/player/${command}?device_id=${deviceID}`, {
            body: body,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token.accessToken}`,
                "Content-Type": "application/json"
            },
            method: "PUT"
        }).then(r => {console.log(r); this.setState({live: true})});
    }

    adjustVolume(vol) {
        //Don't ask why it's not 0, setting it to 0 broke the API.
        const clamped = Math.max(Math.min(vol, 1), 0.000000000001);

        player.setVolume(clamped).then(() => {
            this.setState({volume: clamped});
        });
    }

    seek(pos) {
        player.seek(pos * this.state.playerState.duration).then();
    }

    forward() {
        player.nextTrack().then();
    }

    backward() {
        player.previousTrack().then();
    }

    shuffle() {
        let token = window.localStorage.getItem('spotifyToken');
        if (!token || token === "") {
            return;
        }

        token = JSON.parse(token);

        fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${!this.state.playerState.shuffle}&device_id=${deviceID}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token.accessToken}`,
                "Content-Type": "application/json"
            },
            method: "PUT"
        }).then();
    }

    repeat() {
        let token = window.localStorage.getItem('spotifyToken');
        if (!token || token === "") {
            return;
        }

        token = JSON.parse(token);
        const repeatMode = this.state.playerState.repeat_mode;
        const repeatModes = ['off', 'context', 'track'];
        const newMode = repeatModes[((repeatMode + 1) % 3)];

        fetch(`https://api.spotify.com/v1/me/player/repeat?state=${newMode}&device_id=${deviceID}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token.accessToken}`,
                "Content-Type": "application/json"
            },
            method: "PUT"
        }).then(r => console.log(r));
    }

    tick() {
        if (player) {
            player.getCurrentState().then(state => {
                if (!state) {
                    this.setState({playerState: null});
                    return;
                }
                window.localStorage.setItem('playerState', JSON.stringify(state));
                this.setState({playerState: state});
            })
            player.getVolume().then(volume => {
                this.setState({volume: volume});
                window.localStorage.setItem('volume', JSON.stringify(volume));
            })
        } else {
            this.setState({playerState: null});
            this.setState({volume: 0});
        }
    }

    render() {
        if (!player) return null;
        let state = this.state.playerState;
        let previousState = window.localStorage.getItem('playerState');
        if (!state && previousState) {
            state = JSON.parse(previousState);
        }

        if (!state && this.props.live) {
            return null;
        }

        let currentTrack, paused, shuffleState, repeatMode, duration, position;

        if (this.state.live && state) {
            currentTrack = state.track_window.current_track;
            paused = this.state.playerState ? state.paused : true;
            shuffleState = state.shuffle;
            repeatMode= state.repeat_mode;
            duration= state.duration
            position= state.position
        } else {
            currentTrack = this.props.trackQueue[0];
            paused = true;
            shuffleState = false;
            repeatMode= 0;
            duration = currentTrack.duration_ms;
            position = 0;
        }

        const playOrPause = paused ? (
                <svg className={'playSvg'} viewBox="0 0 7.5 8.94" xmlns="http://www.w3.org/2000/svg">
                    <path fill={'white'} d="M.85.13C.38-.16,0,.06,0,.61V8.33c0,.55.39.76.86.48L7.14,5a.56.56,0,0,0,0-1Z"/>
                </svg>
            ) :
            (
                <svg className={'pauseSvg'} viewBox="0 0 5.97 9" xmlns="http://www.w3.org/2000/svg">
                    <rect fill={'white'} width="2.25" height="9" rx="1"/>
                    <rect fill={'white'} x="3.72" width="2.25" height="9" rx="1"/>
                </svg>
            )

        const colorant = new Colorant(this.props.colorant.r, this.props.colorant.g, this.props.colorant.b, true);
        const darkerColor = new Colorant(colorant.r / 6, colorant.g / 6, colorant.b / 6, true);

        let artControls = null;
        if (this.props.artControls) {
            artControls = (
                <div className={'playButtonOuter'}>
                    <div className={'playButtonInner'} onClick={this.playPause}>
                        {playOrPause}
                    </div>
                </div>
            )
        }

        return (
            <div className={'playerFrame'}
                 style={{
                     border: `${colorant.colorToString()} solid 2px`,
                     boxShadow: `0 0 4px 0px ${colorant.colorToString()}`,
                     background: `linear-gradient(180deg, ${darkerColor.colorToString()}, transparent)`,
                     width: this.props.width
                 }}
                 onMouseEnter={() => {this.props.updateHoverFlag(true);}}
                 onMouseLeave={() => {this.props.updateHoverFlag(false);}}
            >
                <img className={'playerArt'} src={currentTrack.album.images[0].url} alt={''}/>
                {artControls}
                <PlayerTrackArea
                    track={currentTrack}
                    shuffleState={shuffleState}
                    repeatMode={repeatMode}
                    colorant={colorant}
                    duration={duration}
                    position={position}
                    playOrPause={playOrPause}

                    seek={this.seek}
                    playPause={this.playPause}
                    shuffle={this.shuffle}
                    forward={this.forward}
                    backward={this.backward}
                    repeat={this.repeat}
                />

                {
                    this.props.volume ? (
                        <VolumeMeter
                            colorant={colorant}
                            volume={this.state.volume}
                            updater={this.adjustVolume}
                        />
                    ) :  null
                }
            </div>
        )
    }

}