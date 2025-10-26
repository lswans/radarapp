import Radar from 'radar-sdk-js';
import 'radar-sdk-js/dist/radar.css';

const apiKey = import.meta.env.VITE_API_KEY;
Radar.initialize(apiKey);
import React, { useState } from 'react';


interface TrackUserProps {
    location: any;
    setLocation: (loc: any) => void;
    setGeometry: (geometry: any) => void;
}


const TrackUser: React.FC<TrackUserProps> = ({ location, setLocation, setGeometry }) => {
    const handleTrackOnce = () => {
        Radar.trackOnce()
            .then((result: any) => {
                const { location: radarLocation, user, events } = result;
                setLocation(radarLocation);
                if (user && user.geofences && user.geofences[0] && user.geofences[0].geometry) {
                    setGeometry(user.geofences[0].geometry);
                } else {
                    setGeometry(null);
                }
                console.log('Location:', radarLocation);
                console.log('User:', user.geofences?.[0]?.geometry);
                console.log('Events:', events);
            })
            .catch((err: any) => {
                console.error('Radar.trackOnce error:', err);
            });
    };

    return React.createElement(
        'div',
        { className: 'track-user' },
        React.createElement('button', { type: 'button', onClick: handleTrackOnce }, 'Track me'),
        React.createElement('div', { style: { marginTop: 8 } },
            React.createElement('pre', null, location ? JSON.stringify(location, null, 2) : 'No location yet')
        )
    );
};

// Mount helper: creates a container in #app and renders the component there.
// No more mount helper needed; TrackUser is now a pure component.
export default TrackUser;