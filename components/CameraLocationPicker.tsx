"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import { LeafletMouseEvent } from "leaflet"
import L from "leaflet"

import "leaflet/dist/leaflet.css"
import "leaflet-control-geocoder/dist/Control.Geocoder.css"
import "leaflet-control-geocoder"

interface Props {
  latitude: number | null
  longitude: number | null
  setLatitude: (lat: number) => void
  setLongitude: (lng: number) => void
}

function SearchControl({
  setLatitude,
  setLongitude,
}: {
  setLatitude: (lat: number) => void
  setLongitude: (lng: number) => void
}) {
  const map = useMap()

  useEffect(() => {
    const geocoder = (L.Control as any)
      .geocoder({
        defaultMarkGeocode: false,
      })
      .on("markgeocode", function (e: any) {
        const latlng = e.geocode.center
        map.setView(latlng, 16)

        setLatitude(latlng.lat)
        setLongitude(latlng.lng)
      })
      .addTo(map)

    return () => {
      map.removeControl(geocoder)
    }
  }, [map, setLatitude, setLongitude])

  return null
}


function MapClickHandler({
  setLatitude,
  setLongitude,
}: {
  setLatitude: (lat: number) => void
  setLongitude: (lng: number) => void
}) {
  const map = useMap()

  useEffect(() => {
    const handleClick = (e: LeafletMouseEvent) => {
      setLatitude(e.latlng.lat)
      setLongitude(e.latlng.lng)
    }

    map.on("click", handleClick)

    return () => {
      map.off("click", handleClick)
    }
  }, [map, setLatitude, setLongitude])

  return null
}


export default function CameraLocationPicker({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
}: Props) {

  const [initialCenter, setInitialCenter] =
    useState<[number, number] | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setInitialCenter([20.5937, 78.9629]) // fallback
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setInitialCenter([latitude, longitude])
      },
      () => {
        
        setInitialCenter([20.5937, 78.9629])
      }
    )
  }, [])

  if (!initialCenter) {
    return <p>Loading map...</p>
  }

  return (
    <MapContainer
      center={initialCenter}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <SearchControl
        setLatitude={setLatitude}
        setLongitude={setLongitude}
      />

      <MapClickHandler
        setLatitude={setLatitude}
        setLongitude={setLongitude}
      />

      {latitude !== null && longitude !== null && (
        <Marker position={[latitude, longitude]} />
      )}
    </MapContainer>
  )
}
