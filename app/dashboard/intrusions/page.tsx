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
  const [generatingPDF, setGeneratingPDF] = useState(false)

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
  }, [search])

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

  // ---------- IMAGE LOADER ----------
  const loadImage = (url: string) => {

    return new Promise<string>((resolve) => {

      const img = new Image()

      img.crossOrigin = "anonymous"
      img.src = url

      img.onload = () => {

        const canvas = document.createElement("canvas")

        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext("2d")

        ctx?.drawImage(img, 0, 0)

        resolve(canvas.toDataURL("image/jpeg"))
      }
    })
  }

  // ---------- DOWNLOAD PDF ----------
   const downloadPDF = () => {

const pdf = new jsPDF()

let y = 30
let count = 1

// -------- HEADER BANNER --------
pdf.setFillColor(37, 99, 235)
pdf.rect(0, 0, 210, 22, "F")

pdf.setTextColor(255, 255, 255)
pdf.setFontSize(18)
pdf.text("VIGILAN SECURITY REPORT", 14, 14)

pdf.setFontSize(10)
pdf.text("AI Monitoring System", 150, 14)

pdf.setTextColor(0,0,0)

// -------- REPORT INFO --------
pdf.setFontSize(12)
pdf.text(`Camera: ${selectedVideo?.name ?? "Unknown Camera"}`, 14, y)
y += 7

pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, y)
y += 7

pdf.text(`Total Intrusions: ${intrusions.length}`, 14, y)

y += 12

// -------- DIVIDER --------
pdf.setDrawColor(200,200,200)
pdf.line(14, y, 196, y)

y += 10

// -------- INTRUSIONS --------
for (const intrusion of intrusions) {


if (y > 260) {
  pdf.addPage()
  y = 20
}

// Severity color
if (intrusion.severity === "HIGH") pdf.setTextColor(220,38,38)
else if (intrusion.severity === "MEDIUM") pdf.setTextColor(245,158,11)
else pdf.setTextColor(22,163,74)

pdf.setFontSize(13)
pdf.text(`Intrusion #${count} - ${intrusion.severity}`, 14, y)

pdf.setTextColor(0,0,0)

y += 7

pdf.setFontSize(11)

pdf.text(`Zone: ${intrusion.name ?? intrusion.zoneId}`, 14, y)
y += 6

pdf.text(`Detected Object: ${intrusion.blockedObjects}`, 14, y)
y += 6

pdf.text(`Entry Time: ${intrusion.entryTimeSeconds?.toFixed(2)} seconds`, 14, y)
y += 6

pdf.text(`Exit Time: ${intrusion.exitTimeSeconds?.toFixed(2)} seconds`, 14, y)
y += 6

pdf.text(`Duration: ${intrusion.durationSeconds?.toFixed(2)} seconds`, 14, y)

y += 10

// divider between intrusions
pdf.setDrawColor(220,220,220)
pdf.line(14, y, 196, y)

y += 10

count++


}

pdf.save("vigilan_intrusion_report.pdf")
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
      Started at {new Date(job.startedAt).toLocaleString()}
    </span>
  )}
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
              disabled={generatingPDF}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {generatingPDF ? "Generating PDF..." : "Download Intrusion PDF"}
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
                      Time: {intrusion.startedAt}
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
                        />

                        <button
                          onClick={() => window.open(intrusion.screenshotUrl, "_blank")}
                          className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded"
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