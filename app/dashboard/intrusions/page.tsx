"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"
import { jsPDF } from "jspdf"

const API = process.env.NEXT_PUBLIC_API_URL!

export default function IntrusionsPage() {

  const router = useRouter()

  const [videos, setVideos] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [intrusions, setIntrusions] = useState<any[]>([])

  const [selectedVideo, setSelectedVideo] = useState<any | null>(null)
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [generatingPDF, setGeneratingPDF] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  const authFetch = async (url: string) => {
    const token = await getToken()
    if (!token) return null

    const res = await fetch(`${API}${url}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) return null
    return res.json()
  }

  const loadVideos = async () => {
    const data = await authFetch("/api/videos")
    if (data) setVideos(data)
  }

  const loadJobs = async (videoId: number) => {
    const data = await authFetch(`/api/monitoring/video/${videoId}`)
    if (data) setJobs(data)
  }

  const loadIntrusions = async (jobId: number) => {
    const data = await authFetch(`/api/intrusions/job/${jobId}`)
    if (data) setIntrusions(data)
  }

  useEffect(() => {
    loadVideos()
  }, [])

  const selectVideo = (video: any) => {
    setSelectedVideo(video)
    loadJobs(video.id)
    setIntrusions([])
  }

  const selectJob = (job: any) => {
    loadIntrusions(job.jobId)
  }

  const playAtTime = (seconds: number) => {
    if (!videoRef.current) return

    videoContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    })

    videoRef.current.currentTime = seconds
    videoRef.current.play()
  }

  const grouped = videos.reduce((acc: any, v: any) => {
    if (!acc[v.cameraId]) acc[v.cameraId] = []
    acc[v.cameraId].push(v)
    return acc
  }, {})

  const filteredCameras = Object.keys(grouped).filter(cam =>
    cam.toLowerCase().includes(search.toLowerCase())
  )

  const downloadPDF = () => {
    const pdf = new jsPDF()
    pdf.text("Intrusion Report", 20, 20)
    pdf.save("report.pdf")
  }

  return (
    <div className="flex h-screen">

      <div className="w-80 border-r p-4 bg-white overflow-y-auto">

        <h2 className="text-xl font-bold mb-4">Cameras</h2>

        <input
          placeholder="Search camera..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        {filteredCameras.map((cam) => (

          <div key={cam} className="mb-3">

            <div
              onClick={() =>
                setSelectedCamera(selectedCamera === cam ? null : cam)
              }
              className="p-2 font-semibold cursor-pointer bg-gray-100 rounded hover:bg-gray-200"
            >
              {selectedCamera === cam ? "▼" : "▶"} {cam}
            </div>

            {selectedCamera === cam && (

              <div className="ml-3 mt-2 space-y-2">

                {grouped[cam].map((video: any) => (

                  <div
                    key={video.id}
                    onClick={() => selectVideo(video)}
                    className={`p-2 rounded cursor-pointer ${
                      selectedVideo?.id === video.id
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {video.name}
                  </div>

                ))}

              </div>

            )}

          </div>

        ))}

        <hr className="my-4" />

        <h3 className="font-semibold mb-2">Monitoring Jobs</h3>

        {jobs.map(job => (
          <div
            key={job.jobId}
            onClick={() => selectJob(job)}
            className="border p-2 rounded mb-2 cursor-pointer hover:bg-gray-100"
          >
            <p className="font-semibold">
              Job #{job.jobId}
              {job.startedAt && (
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(job.startedAt).toLocaleString()}
                </span>
              )}
            </p>

            <p className="text-sm text-gray-600">
              Status: {job.status}
            </p>
          </div>
        ))}

      </div>

      <div className="flex-1 p-6 overflow-y-auto">

        {!selectedVideo && (
          <p className="text-gray-500">
            Select a camera to view intrusions
          </p>
        )}

        {selectedVideo && (
          <div className="space-y-6">

            <button
              onClick={downloadPDF}
              disabled={generatingPDF}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Download Intrusion PDF
            </button>

            <div ref={videoContainerRef} className="max-w-4xl">

              <video
                ref={videoRef}
                src={selectedVideo.filePath}
                controls
                className="w-full rounded shadow"
              />

            </div>

            <div className="grid grid-cols-3 gap-4">

              {intrusions.map((intrusion) => {

                const severityColor =
                  intrusion.severity === "HIGH"
                    ? "border-red-500 bg-red-50"
                    : intrusion.severity === "MEDIUM"
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-green-500 bg-green-50"

                return (
                  <div
                    key={intrusion.id}
                    className={`border-l-4 p-4 rounded shadow ${severityColor}`}
                  >
                    <p className="font-bold mb-1">
                      {intrusion.severity} ALERT
                    </p>

                    <p className="text-sm">
                      Entry: {intrusion.entryTimeSeconds?.toFixed(2)}s
                    </p>

                    <p className="text-sm">
                      Duration: {intrusion.durationSeconds?.toFixed(2)}s
                    </p>

                    <button
                      onClick={() => playAtTime(intrusion.entryTimeSeconds)}
                      className="mt-3 bg-blue-600 text-white px-3 py-1 rounded w-full"
                    >
                      ▶ Play
                    </button>
                  </div>
                )
              })}

            </div>

          </div>
        )}

      </div>

    </div>
  )
}