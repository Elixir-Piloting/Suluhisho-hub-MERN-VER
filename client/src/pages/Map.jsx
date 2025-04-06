import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

const ClickMarker = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });

  return null;
};

export const Map = () => {
  const [markerPosition, setMarkerPosition] = useState(null);

  return (
    <div id="map" className="h-screen">
      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ClickMarker onClick={setMarkerPosition} />

        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>
              You clicked here: <br />
              Lat: {markerPosition.lat.toFixed(4)}, Lng: {markerPosition.lng.toFixed(4)}
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <h2>{}</h2>
    </div>
  );
};
