import './style.css'
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import TrackUser from './trackUser.tsx';
import RadarMap from './RadarMap.tsx';

const appEl = document.querySelector<HTMLDivElement>('#app')!;


const App = () => {
  const [location, setLocation] = useState<any | null>(null);
  const [geometry, setGeometry] = useState<any | null>(null);
  return (
    <>
      <RadarMap location={location} geometry={geometry} />
      <TrackUser location={location} setLocation={setLocation} setGeometry={setGeometry} />
    </>
  );
};

createRoot(appEl).render(<App />);
