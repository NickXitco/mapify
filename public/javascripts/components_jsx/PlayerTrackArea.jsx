class PlayerTrackArea extends React.Component {
    constructor(props) {
        super(props);
        this.seek = this.seek.bind(this);
        this.progressRef = React.createRef();
    }

    seek(e) {
        const currentWidth = this.progressRef.current.clientWidth;
        const newPos = e.nativeEvent.offsetX / currentWidth;
        this.props.seek(newPos);
    }

    render() {
        const currentTrack = this.props.track;

        let artistString = '';
        let artistNames = [];
        for (const artist of currentTrack.artists) {
            artistNames.push(artist.name);
        }
        artistString = artistNames.join(', ');

        const shuffleFill = this.props.shuffleState ? this.props.colorant.colorToString() : 'rgba(255, 255, 255, 0.25)';
        const repeatFill = this.props.repeatMode !== 0 ? this.props.colorant.colorToString() : 'rgba(255, 255, 255, 0.25)';

        const repeatSymbol = this.props.repeatMode === 2 ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.93 7.05">
                <path fill={repeatFill}
                      d="M3.77 6H2V4.09h.87l-1.22-2a.23.23 0 00-.4 0L0 4.09h.89V6A1.09 1.09 0 002 7.05h3.3V6zM6.93 0a2 2 0 102 2 2 2 0 00-2-2zm.4 3.34h-.62V1.16h-.53v-.5h1.15z"/>
                <path fill={repeatFill}
                      d="M7.37 4.75v-1h-1.1v1H5.4l1.11 1.83a.37.37 0 00.63 0l1.12-1.83zM5.29 1.78H3v1.1h2.29z"/>
            </svg>
        ) : (
            <svg viewBox="0 0 8.26 5.27" xmlns="http://www.w3.org/2000/svg">
                <path fill={repeatFill} d="M3.77,4.17H2V2.31h.87L1.64.28a.23.23,0,0,0-.4,0L0,2.31H.89V4.17A1.1,1.1,0,0,0,2,5.27h3.3V4.17Z"/>
                <path fill={repeatFill} d="M4.49,1.1H6.27V3H5.4L6.51,4.8a.37.37,0,0,0,.63,0L8.26,3H7.37V1.1A1.1,1.1,0,0,0,6.27,0H3V1.1Z"/>
            </svg>
        )

        const durationMs = this.props.duration;
        const durationSeconds = Math.floor((durationMs / 1000) % 60);
        const durationMinutes = Math.floor((durationMs / (60 * 1000)) % 60);

        const positionMs = this.props.position;
        const positionSeconds = Math.floor((positionMs / 1000) % 60);
        const positionMinutes = Math.floor((positionMs / (60 * 1000)) % 60);

        return (
            <div className={'playerTrackArea'}>
                <div className={'spotifyLogoContainer'}>
                    <svg className={'spotifyLogo'}
                         xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 168 168"
                         onClick={() => {window.open(`https://open.spotify.com/track/${currentTrack.id}`);}}
                    >
                        <path fill={'white'} d="m83.996 0.277c-46.249 0-83.743 37.493-83.743 83.742 0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l0.001-0.004zm38.404 120.78c-1.5 2.46-4.72 3.24-7.18 1.73-19.662-12.01-44.414-14.73-73.564-8.07-2.809 0.64-5.609-1.12-6.249-3.93-0.643-2.81 1.11-5.61 3.926-6.25 31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-0.903-8.148-4.35-1.04-3.453 0.907-7.093 4.354-8.143 30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-0.001zm0.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219-1.254-4.14 1.08-8.513 5.221-9.771 29.581-8.98 78.756-7.245 109.83 11.202 3.73 2.209 4.95 7.016 2.74 10.733-2.2 3.722-7.02 4.949-10.73 2.739z"/>
                    </svg>
                </div>
                <div className={'playerInfo'}>
                    <p className={'playerSongName'}>{currentTrack.name}</p>
                    <p className={'playerArtistName'}>{artistString}</p>
                    <p className={'playerAlbumName'}>{currentTrack.album.name}</p>
                </div>
                <div className={'playerControlsContainer'}>
                    <div className={'playerControls'}>
                        <div className={'playerControl'} onClick={this.props.shuffle}>
                            <svg viewBox="0 0 8.29 5.73" xmlns="http://www.w3.org/2000/svg">
                                <path fill={shuffleFill} d="M6.34,1.7a.16.16,0,0,1,.24.16v0c0,.14.09.19.21.12l1.42-.85a.14.14,0,0,0,0-.26L6.79,0C6.67,0,6.58,0,6.58.15V.26A.41.41,0,0,1,6.34.6,11.91,11.91,0,0,0,3,2.52,8.3,8.3,0,0,1,.24,4.11.39.39,0,0,0,0,4.45v.6a.17.17,0,0,0,.23.17,12.35,12.35,0,0,0,3.57-2A8.13,8.13,0,0,1,6.34,1.7Z"/>
                                <path fill={shuffleFill} d="M3,2.08a.24.24,0,0,0,0-.35L.24.56A.19.19,0,0,0,0,.75v.61a.35.35,0,0,0,.24.31l2,.88a.26.26,0,0,0,.36,0Z"/>
                                <path fill={shuffleFill} d="M6.58,3.94a.18.18,0,0,1-.25.18l-1.85-.8a.26.26,0,0,0-.36,0l-.4.45a.23.23,0,0,0,0,.34L6.33,5.23a.35.35,0,0,1,.25.32v0c0,.14.09.19.21.12l1.42-.85a.14.14,0,0,0,0-.26L6.79,3.72c-.12-.07-.21,0-.21.12Z"/>
                            </svg>
                        </div>
                        <div className={'playerControl'} onClick={this.props.backward}>
                            <svg viewBox="0 0 5.74 5.83" xmlns="http://www.w3.org/2000/svg">
                                <path fill={'white'} d="M4.89,5.31c.47.29.85.07.85-.48V1c0-.55-.38-.77-.85-.48L1.8,2.38a.56.56,0,0,0,0,1Z"/>
                                <path fill={'white'} d="M0,1A.92.92,0,0,1,.79,0a.92.92,0,0,1,.79,1V4.83a.92.92,0,0,1-.79,1,.92.92,0,0,1-.79-1Z"/>
                            </svg>
                        </div>
                        <div className={'playerControl'} onClick={this.props.playPause}>
                            {this.props.playOrPause}
                        </div>
                        <div className={'playerControl'} onClick={this.props.forward}>
                            <svg viewBox="0 0 5.74 5.83" xmlns="http://www.w3.org/2000/svg">
                                <path fill={'white'}
                                      d="M.85.52C.38.23,0,.45,0,1V4.83c0,.55.39.77.86.49L3.94,3.45a.55.55,0,0,0,0-1Z"/>
                                <path fill={'white'}
                                      d="M5.74,4.83a.91.91,0,0,1-.78,1,.91.91,0,0,1-.79-1V1A.91.91,0,0,1,5,0a.91.91,0,0,1,.78,1Z"/>
                            </svg>
                        </div>
                        <div className={'playerControl'} onClick={this.props.repeat}>
                            {repeatSymbol}
                        </div>
                    </div>
                </div>
                <div className={'playerTrack'}>
                    <div className={'progressBars'}>
                        <div className={'progressBarBG'}
                             style={{
                                 background: this.props.colorant.colorToStringAlpha(0.1)
                             }}
                             onClick={this.seek}
                             ref={this.progressRef}
                        />
                        <div className={'progressBarFG'}
                             style={{
                                 width: `${100 * positionMs/durationMs}%`,
                                 background: this.props.colorant.colorToString(),
                                 boxShadow: `0 0 4px 0px ${this.props.colorant.colorToString()}`
                             }}
                        />
                    </div>
                    <div className={'trackProgressNumbers'}>
                        <p className={'trackProgressNumber'} id={'trackPosition'}>
                            {positionMinutes}:{
                            positionSeconds.toLocaleString('en-US', {
                                minimumIntegerDigits: 2,
                                useGrouping: false
                            })
                        }
                        </p>
                        <p className={'trackProgressNumber'} id={'trackDuration'}>
                            {durationMinutes}:{
                            durationSeconds.toLocaleString('en-US', {
                                minimumIntegerDigits: 2,
                                useGrouping: false
                            })
                        }
                        </p>
                    </div>
                </div>
            </div>
        );
    }

}