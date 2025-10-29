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
    // Keep the last Radar "user" object in component state so other handlers can access it
    const [user, setUser] = useState<any | null>(null);
    const handleTrackOnce = () => {
        Radar.trackOnce()
            .then((result: any) => {
                const { location: radarLocation, user, events } = result;
                setLocation(radarLocation);
                // store user in state so other functions (like handleDBWrite) can access it
                setUser(user);
                if (user && user.geofences && user.geofences[0] && user.geofences[0].geometry) {
                    setGeometry(user.geofences[0].geometry);
                } else {
                    setGeometry(null);
                }
                console.log('Location:', radarLocation);
                console.log('User:', user);
                console.log('Events:', events[0]);
            })
            .catch((err: any) => {
                console.error('Radar.trackOnce error:', err);
            });
    };
    
    const handleDBWrite = async () => {
        if (!location) {
            console.error('No location to write to DB');
            return;
        }
        // prefer user info captured from the last trackOnce call
        const userId = user?.id || user?._id || 'anonymous';
        const geofenceId = user?.geofences?.[0]?._id || null;

        try {
            const response = await fetch('http://localhost:3001/api/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    radarLocation: location,
                    userId,
                    geofenceId
                })
            });
            const data = await response.json();
            console.log('Server response:', data);
        } catch (error) {
            console.error('Error sending to server:', error);
        }
    }

    return React.createElement(
        'div',
        { className: 'track-user' },
        React.createElement('button', { type: 'button', onClick: handleTrackOnce }, 'Track Location'),
        React.createElement('div', { style: { marginTop: 8 } },
            React.createElement('pre', null, location ? JSON.stringify(location, null, 2) : 'No location yet')
        ),
        React.createElement('button', { type: 'button', onClick: handleDBWrite }, 'Write to DB')
    );
};

export default TrackUser;