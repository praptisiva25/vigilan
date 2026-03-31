"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { jsPDF } from "jspdf"

const API = process.env.NEXT_PUBLIC_API_URL!

export default function IntrusionsPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [intrusions, setIntrusions] = useState<any[]>([])

  const [selectedVideo, setSelectedVideo] = useState<any | null>(null)
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)

  const [search, setSearch] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoSectionRef = useRef<HTMLDivElement | null>(null)

  // ---------- AUTH ---------- //
  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
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

  useEffect(() => {
    loadVideos()
  }, [])

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
    setSelectedJobId(jobId)
  }

  const grouped = videos.reduce((acc: any, v: any) => {
    if (!acc[v.cameraId]) acc[v.cameraId] = []
    acc[v.cameraId].push(v)
    return acc
  }, {})

  const filteredCameras = Object.keys(grouped).filter((cam) =>
    cam.toLowerCase().includes(search.toLowerCase())
  )

  const playAtTime = (seconds: number) => {
    if (!videoRef.current) return

    // scroll up to video first
    videoSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })

    setTimeout(() => {
      if (!videoRef.current) return
      videoRef.current.currentTime = seconds || 0
      videoRef.current.play()
    }, 300)
  }

  // ================= PDF ================= //

  const downloadPDF = () => {
    const pdf = new jsPDF()

    // HEADER
    pdf.setFillColor(30, 64, 175)
    pdf.rect(0, 0, 210, 30, "F")

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.text("VIGILAN REPORT", 20, 18)
    pdf.setFontSize(10)
    pdf.text("Intrusion Monitoring System", 20, 25)

    pdf.setTextColor(0, 0, 0)

    let y = 40

    pdf.setFontSize(11)
    pdf.text(`Camera: ${selectedCamera || "N/A"}`, 20, y)
    y += 6
    pdf.text(`Video: ${selectedVideo?.name || "N/A"}`, 20, y)
    y += 6
    pdf.text(`Job ID: ${selectedJobId || "N/A"}`, 20, y)
    y += 6
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, y)

    y += 10

    intrusions.forEach((i, index) => {
      if (y > 270) {
        pdf.addPage()
        y = 20
      }

      pdf.setFont("helvetica", "bold")
      pdf.text(`Alert ${index + 1} (${i.severity})`, 20, y)
      y += 6

      pdf.setFont("helvetica", "normal")

      pdf.text(`ID: ${i.id}`, 20, y)
      y += 5
      pdf.text(`Zone ID: ${i.zoneId}`, 20, y)
      y += 5
      pdf.text(`Object ID: ${i.objectId}`, 20, y)
      y += 5

      pdf.text(`Zone Name: ${i.name}`, 20, y)
      y += 5
      pdf.text(`Blocked Objects: ${i.blockedObjects}`, 20, y)
      y += 5

      pdf.text(`Entry: ${i.entryTimeSeconds?.toFixed(2)}s`, 20, y)
      y += 5
      pdf.text(`Exit: ${i.exitTimeSeconds?.toFixed(2)}s`, 20, y)
      y += 5
      pdf.text(`Duration: ${i.durationSeconds?.toFixed(2)}s`, 20, y)
      y += 8
    })

    pdf.save("vigilan_report.pdf")
  }

  // ================= UI ================= //

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
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
              className="p-2 font-semibold cursor-pointer bg-gray-100 rounded"
            >
              {cam}
            </div>

            {selectedCamera === cam && (
              <div className="ml-3 mt-2 space-y-2">
                {grouped[cam].map((video: any) => (
                  <div
                    key={video.id}
                    onClick={() => {
                      setSelectedVideo(video)
                      loadJobs(video.id)
                      setIntrusions([])
                      setSelectedJobId(null)
                    }}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                  >
                    {video.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <hr className="my-4" />

        {jobs.map((job) => (
          <div
            key={job.jobId}
            onClick={() => loadIntrusions(job.jobId)}
            className="border p-2 mb-2 cursor-pointer"
          >
            Job #{job.jobId}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedVideo && (
          <div className="space-y-6">
            {/* TOP INFO ABOVE BUTTON + VIDEO */}
            <div className="flex flex-wrap items-center gap-6 text-sm bg-slate-100 text-slate-700 px-4 py-3 rounded-md border border-slate-200">
              <p><span className="font-semibold text-slate-900">Camera:</span> {selectedCamera || "N/A"}</p>
              <p><span className="font-semibold text-slate-900">Video:</span> {selectedVideo?.name || "N/A"}</p>
              <p><span className="font-semibold text-slate-900">Job Id:</span> {selectedJobId || "N/A"}</p>
              <p><span className="font-semibold text-slate-900">ID:</span> {intrusions.length > 0 ? intrusions[0].id : "N/A"}</p>
            </div>

            <button
              onClick={downloadPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              📄 Download Report
            </button>

            <div ref={videoSectionRef}>
              <video
                ref={videoRef}
                src={selectedVideo.filePath}
                controls
                className="w-full max-w-4xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {intrusions.map((i) => (
                <div key={i.id} className="border p-4 rounded shadow">
                  <p className="font-bold text-lg">{i.severity} ALERT</p>

                  <p><b>Zone Id:</b> {i.zoneId}</p>
                  <p><b>Object Id:</b> {i.objectId}</p>

                  <p><b>Zone Name:</b> {i.name}</p>
                  <p><b>Blocked Object:</b> {i.blockedObjects}</p>

                  <p><b>Entry:</b> {i.entryTimeSeconds?.toFixed(2)}s</p>
                  <p><b>Exit:</b> {i.exitTimeSeconds?.toFixed(2)}s</p>
                  <p><b>Duration:</b> {i.durationSeconds?.toFixed(2)}s</p>

                  {i.screenshotUrl && (
                    <img
                      src={i.screenshotUrl}
                      className="mt-2 h-32 w-full object-cover cursor-pointer"
                      onClick={() => setSelectedImage(i.screenshotUrl)}
                    />
                  )}

                  <button
                    onClick={() => playAtTime(i.entryTimeSeconds)}
                    className="mt-2 bg-green-600 text-white px-2 py-1 w-full"
                  >
                    ▶ Play
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} className="max-h-[90%] max-w-[90%]" />
        </div>
      )}
    </div>
  )
}