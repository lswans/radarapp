
import React, { useEffect, useRef } from 'react';
import Radar from 'radar-sdk-js';
import 'radar-sdk-js/dist/radar.css';

interface RadarMapProps {
  location: any;
  geometry: any;
}

const RadarMap: React.FC<RadarMapProps> = ({ location, geometry }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_API_KEY;
    Radar.initialize(apiKey);
    const map = Radar.ui.map({
      container: mapRef.current!,
      style: 'radar-default-v1',
      center: location && location.longitude && location.latitude ? [location.longitude, location.latitude] : [-73.9911, 40.7342],
      zoom: 14,
    });
    // Convert location to [lng, lat] array
    let lngLat: [number, number] | null = null;
    if (location && typeof location === 'object') {
      if (Array.isArray(location) && location.length === 2) {
        lngLat = location as [number, number];
      } else if ('longitude' in location && 'latitude' in location) {
        lngLat = [location.longitude, location.latitude];
      }
    }
    if (lngLat) {
      Radar.ui.marker({ text: 'Current Location' })
        .setLngLat(lngLat)
        .addTo(map);
    }
    if (geometry) {
      console.log('Geometry in RadarMap:', geometry);
    }
    return () => { map.remove && map.remove(); };
  }, [location, geometry]);

  return (
    <div id="map-container">
      <div id="map" ref={mapRef} />
    </div>
  );
};

export default RadarMap;