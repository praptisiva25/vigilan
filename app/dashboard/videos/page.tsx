"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"

const API = process.env.NEXT_PUBLIC_API_URL!

interface Video {
  id: number
  name: string
  cameraId: string
  latitude: number
  longitude: number
  filePath: string
  uploadedAt: string
}

export default function VideosPage() {
  const router = useRouter()

  const [videos, setVideos] = useState<Video[]>([])
  const [search, setSearch] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push("/")
      return null
    }
    return session.access_token
  }

  const authFetch = async (url: string, options: any = {}) => {
    const token = await getToken()
    if (!token) return null

    const res = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      console.error("Request failed:", res.status)
      return null
    }

    if (res.status === 204) return null

    return res.json()
  }

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    setLoading(true)

    const data = await authFetch("/api/videos")

    if (data) {
      setVideos(data)
    }

    setLoading(false)
  }

  const handleDelete = async (videoId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video and all related data?"
    )
    if (!confirmDelete) return

    const token = await getToken()
    if (!token) return

    const res = await fetch(`${API}/api/videos/${videoId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (res.ok) {
      setVideos((prev) => prev.filter((v) => v.id !== videoId))
    }
  }

  const filteredVideos = videos.filter((video) =>
    video.cameraId.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="p-8">Loading videos...</p>

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Videos</h1>

      <input
        type="text"
        placeholder="Search by Camera ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full max-w-md"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVideos.map((video) => (
          <div key={video.id} className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">{video.name}</h2>
            <p className="text-sm text-gray-500">
              Camera: {video.cameraId}
            </p>
            <p className="text-sm text-gray-400">
              Uploaded: {new Date(video.uploadedAt).toLocaleString()}
            </p>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setSelectedVideo(video)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                ▶ Play
              </button>

              <button
                onClick={() => handleDelete(video.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-[80%] max-w-4xl relative">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-2 right-2 text-red-600 font-bold"
            >
              ✕
            </button>

            <video
              src={selectedVideo.filePath}
              controls
              className="w-full rounded"
            />
          </div>
        </div>
      )}
    </div>
  )
}