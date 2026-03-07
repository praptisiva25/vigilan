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

  const [search, setSearch] = useState("")

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)

  // ---------------- AUTH ----------------
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

  // ---------------- LOAD INTRUSIONS ----------------
  const loadIntrusions = async (jobId: number) => {

    const data = await authFetch(`/api/intrusions/job/${jobId}`)

    if (data) setIntrusions(data)
  }

  useEffect(() => {
    loadVideos()
  }, [search])

  // ---------------- SELECT VIDEO ----------------
  const selectVideo = (video: any) => {

    setSelectedVideo(video)

    loadJobs(video.id)

    setIntrusions([])
  }

  // ---------------- SELECT JOB ----------------
  const selectJob = (job: any) => {

    loadIntrusions(job.jobId)
  }

  // ---------------- PLAY INTRUSION ----------------
  const playAtTime = (seconds: number) => {

    if (!videoRef.current) return

    videoContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    })

    videoRef.current.currentTime = seconds
    videoRef.current.play()
  }

  // ---------------- DOWNLOAD PDF ----------------
  const downloadPDF = async () => {

    const pdf = new jsPDF()

    let y = 20

    pdf.setFontSize(18)
    pdf.text("Vigilan Intrusion Report", 14, 15)

    for (const intrusion of intrusions) {

      if (y > 250) {
        pdf.addPage()
        y = 20
      }

      pdf.setFontSize(12)

      pdf.text(`Severity: ${intrusion.severity}`, 14, y)
      y += 6

      pdf.text(`Zone: ${intrusion.name ?? intrusion.zoneId}`, 14, y)
      y += 6

      pdf.text(`Detected: ${intrusion.blockedObjects}`, 14, y)
      y += 6

      pdf.text(`Entry Time: ${intrusion.entryTimeSeconds?.toFixed(2)}s`, 14, y)
      y += 6

      pdf.text(`Duration: ${intrusion.durationSeconds?.toFixed(2)}s`, 14, y)
      y += 8

      y += 10
    }

    pdf.save("intrusion-report.pdf")
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
            onClick={() => selectJob(job)}
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

      {/* MAIN CONTENT */}
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
                      Zone: {intrusion.name ?? intrusion.zoneId}
                    </p>

                    <p className="text-sm">
                      Detected: {intrusion.blockedObjects}
                    </p>

                    <p className="text-sm">
                      Entry Time: {intrusion.entryTimeSeconds?.toFixed(2)}s
                    </p>

                    <p className="text-sm">
                      Duration: {intrusion.durationSeconds?.toFixed(2)}s
                    </p>

                    {intrusion.screenshotUrl && (
  <div className="mt-2 relative">

    <img
      src={intrusion.screenshotUrl}
      className="w-full rounded"
      alt="Intrusion Screenshot"
    />

    <button
      onClick={() => window.open(intrusion.screenshotUrl, "_blank")}
      className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded hover:bg-black"
      title="View Image"
    >
      👁
    </button>

  </div>
)}

                    <button
                      onClick={() => playAtTime(intrusion.entryTimeSeconds)}
                      className="mt-3 bg-blue-600 text-white px-3 py-1 rounded w-full"
                    >
                      ▶ Play Intrusion
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