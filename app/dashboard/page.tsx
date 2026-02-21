"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const CameraLocationPicker = dynamic(
  () => import("../../components/CameraLocationPicker"),
  { ssr: false }
)

const API = process.env.NEXT_PUBLIC_API_URL!

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [cameraId, setCameraId] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  /* ----------------------------- */
  /* Fetch Videos                  */
  /* ----------------------------- */

  const fetchVideos = async () => {
    const res = await fetch(`${API}/api/videos`)
    const data = await res.json()
    setVideos(data)
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  /* ----------------------------- */
  /* Upload Handler                */
  /* ----------------------------- */

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a video file")
      return
    }

    if (latitude === null || longitude === null) {
      alert("Please select camera location on map")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("cameraId", cameraId)
    formData.append("latitude", latitude.toString())
    formData.append("longitude", longitude.toString())

    setLoading(true)

    await fetch(`${API}/api/videos/upload`, {
      method: "POST",
      body: formData,
    })

    setLoading(false)

    // Reset form
    setFile(null)
    setCameraId("")
    setLatitude(null)
    setLongitude(null)

    fetchVideos()
  }

  /* ----------------------------- */
  /* UI                            */
  /* ----------------------------- */

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">
        VIGILAN Dashboard
      </h1>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">
          Upload Video & Set Camera Location
        </h2>

        <input
          type="file"
          className="mb-3"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <input
          type="text"
          placeholder="Camera ID"
          value={cameraId}
          onChange={(e) => setCameraId(e.target.value)}
          className="block w-full mb-3 p-2 border rounded"
        />

        <div className="mb-4">
          <CameraLocationPicker
            latitude={latitude}
            longitude={longitude}
            setLatitude={setLatitude}
            setLongitude={setLongitude}
          />
        </div>

        {latitude !== null && longitude !== null && (
          <p className="text-sm text-gray-600 mb-3">
            Selected Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Video List */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          Uploaded Videos
        </h2>

        {videos.map((video) => (
          <div
            key={video.id}
            className="border p-3 mb-2 rounded"
          >
            <p className="font-semibold">{video.name}</p>
            <p className="text-sm text-gray-500">
              Camera ID: {video.cameraId}
            </p>
            <p className="text-sm text-gray-500">
              Lat: {video.latitude} | Lng: {video.longitude}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
