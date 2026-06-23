"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface Centre {
  id: string;
  name: string;
  address: string;
  distance_km: number;
  lat: number;
  lng: number;
}

interface CentresMapProps {
  userLat: number;
  userLng: number;
  centres: Centre[];
}

export default function CentresMap({ userLat, userLng, centres }: CentresMapProps) {

  useEffect(() => {
    // Fix: Leaflet's default marker icons break in Next.js/webpack.
    // We override them with CDN URLs to avoid the broken image issue.
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);

  // Blue dot for the user's own location
  const userIcon = new L.DivIcon({
    className: "",
    html: `<div style="
      width:16px; height:16px;
      background:#3b82f6;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.4)
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  // Red dot for each coaching centre
  const centreIcon = new L.DivIcon({
    className: "",
    html: `<div style="
      width:14px; height:14px;
      background:#ef4444;
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 2px 4px rgba(0,0,0,0.3)
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -12],
  });

  return (
    <MapContainer
      center={[userLat, userLng]}
      zoom={13}
      // Note: inline styles used here because Tailwind classes don't apply
      // to MapContainer directly — it renders outside the normal React tree.
      style={{ height: "600px", width: "100%", borderRadius: "1rem", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User's location marker */}
      <Marker position={[userLat, userLng]} icon={userIcon}>
        <Popup>
          <strong style={{ fontSize: "13px" }}>📍 Your Location</strong>
        </Popup>
      </Marker>

      {/* One marker per coaching centre */}
      {centres.map((centre) => (
        <Marker
          key={centre.id}
          position={[centre.lat, centre.lng]}
          icon={centreIcon}
        >
          <Popup>
            {/* Note: Tailwind classes don't work inside Leaflet popups,
                so we use inline styles throughout this block. */}
            <div style={{ minWidth: "170px" }}>
              <p style={{ fontWeight: 700, fontSize: "14px", margin: "0 0 4px 0", color: "#111827" }}>
                {centre.name}
              </p>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0" }}>
                {centre.address}
              </p>
              <p style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, margin: "0 0 10px 0" }}>
                {centre.distance_km.toFixed(1)} km away
              </p>
              <a
                href={`/centre/${centre.id}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  background: "#2563eb",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "6px 0",
                  borderRadius: "8px",
                  textDecoration: "none",
                }}
              >
                View Details →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}