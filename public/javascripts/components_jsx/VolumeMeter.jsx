class VolumeMeter extends React.Component {
    constructor(props) {
        super(props);

        this.updateVolume = this.updateVolume.bind(this);
        this.scrollVolume = this.scrollVolume.bind(this);
    }

    updateVolume(e) {
        const newVolume = (60 - e.nativeEvent.offsetY) / 60;
        this.props.updater(newVolume);
    }

    scrollVolume(e) {
        const change = e.deltaY > 0 ? -0.05 : 0.05;
        this.props.updater(this.props.volume + change);
    }

    render() {
        const colorant = this.props.colorant;
        const volume = this.props.volume;

        const volumeSymbol = volume > 0.5 ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.45 10.04">
                <path fill={'white'}
                      d="M0,3.05V7a.25.25,0,0,0,.25.25H1.83L4.9,10a.26.26,0,0,0,.43-.19V.25A.25.25,0,0,0,4.92.06L1.83,2.81H.25A.25.25,0,0,0,0,3.05Z"/>
                <path fill={'white'}
                      d="M6.81,2.81l-.14-.09v.92a1.93,1.93,0,0,1,0,2.78v.92l.14-.09a2.67,2.67,0,0,0,0-4.44Z"/>
                <path fill={'white'}
                      d="M9.45,5A4.1,4.1,0,0,0,6.67,1.15v.77a3.38,3.38,0,0,1,0,6.2v.77A4.1,4.1,0,0,0,9.45,5Z"/>
            </svg>
        ) : volume > 0.01 ? (
            <svg viewBox="0 0 8 10.04" xmlns="http://www.w3.org/2000/svg">
                <path fill={'white'}
                      d="M0,3.05V7a.25.25,0,0,0,.25.25H1.83L4.9,10a.26.26,0,0,0,.43-.19V.25A.25.25,0,0,0,4.92.06L1.83,2.81H.25A.25.25,0,0,0,0,3.05Z"/>
                <path fill={'white'}
                      d="M6.81,2.81l-.14-.09v.92a1.93,1.93,0,0,1,0,2.78v.92l.14-.09a2.67,2.67,0,0,0,0-4.44Z"/>
            </svg>
        ) : (
            <svg viewBox="0 0 8 10.04" xmlns="http://www.w3.org/2000/svg">
                <path fill={'white'}
                      d="M0,3.05V7a.25.25,0,0,0,.25.25H1.83L4.9,10a.26.26,0,0,0,.43-.19V.25A.25.25,0,0,0,4.92.06L1.83,2.81H.25A.25.25,0,0,0,0,3.05Z"/>
            </svg>
        )

        return (
            <div className={'volume'}>
                <div className={'volumeBars'}>
                    <div className={'volumeBarBG'}
                         style={{
                             background: colorant.colorToStringAlpha(0.1)
                         }}
                         onClick={this.updateVolume}
                         onWheel={this.scrollVolume}
                    />
                    <div className={'volumeBarFG'}
                         style={{
                             height: `${100 * volume}%`,
                             background: colorant.colorToString(),
                             boxShadow: `0 0 4px 0px ${colorant.colorToString()}`
                         }}
                    />
                </div>
                <div className={'volumeIconContainer'}>
                    {volumeSymbol}
                </div>
            </div>
        );
    }
}