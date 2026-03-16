"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useLeafletCSS } from "./LeafletCSS";
import { tiendaIcon } from "@/shared/lib/leaflet-fix";

const DEFAULT_CENTER: [number, number] = [4.711, -74.0721];
const DEFAULT_ZOOM = 6;
const SELECTED_ZOOM = 15;

interface MapPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

function LocationSelector({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({
  latitude,
  longitude,
  onLocationChange,
}: MapPickerProps) {
  useLeafletCSS();

  const hasPosition = latitude != null && longitude != null;
  const center: [number, number] = hasPosition
    ? [latitude, longitude]
    : DEFAULT_CENTER;
  const zoom = hasPosition ? SELECTED_ZOOM : DEFAULT_ZOOM;

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationSelector onLocationChange={onLocationChange} />
        {hasPosition && <Marker position={[latitude, longitude]} icon={tiendaIcon} />}
      </MapContainer>
    </div>
  );
}
