"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet"
import { EditControl } from "react-leaflet-draw"


import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"

interface ZoneMapProps {
  videoId: number
}

const API = "http://localhost:8080"

export default function ZoneMap({ videoId }: ZoneMapProps) {

  const handleCreated = async (e: any) => {
    const layer = e.layer
    const coordinates = layer.getLatLngs()[0].map((latlng: any) => ({
      lat: latlng.lat,
      lng: latlng.lng,
    }))

    await fetch(`${API}/api/zones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoId: videoId,
        name: "Zone 1",
        severity: "HIGH",
        polygonCoordinates: JSON.stringify(coordinates),
        allowedObjects: "[]",
        blockedObjects: "[]",
      }),
    })

    alert("Zone Saved!")
  }

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={handleCreated}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            polyline: false,
            marker: false,
          }}
        />
      </FeatureGroup>
    </MapContainer>
  )
}
