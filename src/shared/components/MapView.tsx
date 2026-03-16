"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useLeafletCSS } from "./LeafletCSS";
import { tiendaIcon } from "@/shared/lib/leaflet-fix";

interface MapViewProps {
  latitude: number;
  longitude: number;
  popupText?: string;
  height?: string;
}

export default function MapView({
  latitude,
  longitude,
  popupText,
  height = "300px",
}: MapViewProps) {
  useLeafletCSS();

  return (
    <div
      className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      style={{ height }}
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={tiendaIcon}>
          {popupText && <Popup>{popupText}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
}
