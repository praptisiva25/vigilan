"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const CameraLocationPicker = dynamic(
  () => import("../../components/CameraLocationPicker"),
  { ssr: false }
)

const API = process.env.NEXT_PUBLIC_API_URL!

export default function Dashboard() {
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [cameraId, setCameraId] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API}/api/videos`)
      const data = await res.json()
      setVideos(Array.isArray(data) ? data : [])
    } catch {
      setVideos([])
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

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

    try {
      await fetch(`${API}/api/videos/upload`, {
        method: "POST",
        body: formData,
      })

      setFile(null)
      setCameraId("")
      setLatitude(null)
      setLongitude(null)

      fetchVideos()
    } finally {
      setLoading(false)
    }
  }

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

        {videos.length === 0 && (
          <p className="text-gray-500">No videos uploaded yet.</p>
        )}

        {videos.map((video) => (
          <div
            key={video.id}
            className="border p-4 mb-3 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{video.name}</p>
              <p className="text-sm text-gray-500">
                Camera ID: {video.cameraId}
              </p>
              <p className="text-sm text-gray-500">
                Lat: {video.latitude} | Lng: {video.longitude}
              </p>
            </div>

            <button
              onClick={() =>
                router.push(`/dashboard/video/${video.id}`)
              }
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Configure
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}