"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"

const API = process.env.NEXT_PUBLIC_API_URL!

export default function IntrusionsPage() {

  const router = useRouter()

  const [videos, setVideos] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null)
  const [search, setSearch] = useState("")

  // ---------------- AUTH ----------------
  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  const authFetch = async (url: string) => {
    const token = await getToken()
    if (!token) return null

    const res = await fetch(`${API}${url}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) return null
    return res.json()
  }

  // ---------------- LOAD VIDEOS ----------------
  const loadVideos = async () => {
    const data = await authFetch(
      search
        ? `/api/videos?search=${search}`
        : `/api/videos`
    )

    if (data) setVideos(data)
  }

  // ---------------- LOAD JOBS ----------------
  const loadJobs = async (videoId: number) => {
    const data = await authFetch(`/api/monitoring/video/${videoId}`)
    if (data) setJobs(data)
  }

  useEffect(() => {
    loadVideos()
  }, [search])

  const selectVideo = (video: any) => {
    setSelectedVideo(video)
    loadJobs(video.id)
  }

  return (
    <div className="flex h-screen">

      {/* SIDEBAR */}
      <div className="w-80 border-r p-4 bg-white overflow-y-auto">

        <h2 className="text-xl font-bold mb-4">
          Cameras
        </h2>

        <input
          placeholder="Search camera..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        {videos.map(video => (
          <div
            key={video.id}
            onClick={() => selectVideo(video)}
            className={`p-2 rounded cursor-pointer mb-2 ${
              selectedVideo?.id === video.id
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
          >
            {video.name}
          </div>
        ))}

        <hr className="my-4" />

        <h3 className="font-semibold mb-2">
          Monitoring Jobs
        </h3>

        {jobs.length === 0 && (
          <p className="text-sm text-gray-500">
            No jobs for this camera
          </p>
        )}

        {jobs.map(job => (
          <div
            key={job.jobId}
            onClick={() =>
              router.push(`/dashboard/intrusions/${job.jobId}`)
            }
            className="border p-2 rounded mb-2 cursor-pointer hover:bg-gray-100"
          >
            <p className="font-semibold">
              Job #{job.jobId}   
            </p>
            <p className="text-sm text-gray-600">
              Status: {job.status}
            </p>
          </div>
        ))}

      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">
          Select a job to view intrusions
        </p>
      </div>

    </div>
  )
}