"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"
import { Bar, Line, Pie } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels)

const API = process.env.NEXT_PUBLIC_API_URL!

export default function StatsPage() {

  const [videos, setVideos] = useState<any[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null)

  const [dailyStats, setDailyStats] = useState<any[]>([])
  const [cameraStats, setCameraStats] = useState<any>({})
  const [severityStats, setSeverityStats] = useState<any>({})
  const [videoSeverity, setVideoSeverity] = useState<any>({})

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

  const loadCameraStats = async () => {
    const data = await authFetch(`/api/intrusions/stats/cameras`)
    if (data) setCameraStats(data)
  }

  const loadCameraData = async (cameraId: string) => {
    const data = await authFetch(`/api/intrusions/stats/camera/${cameraId}`)
    if (data) {
      setDailyStats(data.videoStats)
      setSeverityStats(data.severityStats)
      setSelectedVideo(null)
      setVideoSeverity({})
    }
  }

  const loadVideoSeverity = async (videoId: number) => {
    const data = await authFetch(`/api/intrusions/stats/video/${videoId}/severity`)
    if (data) setVideoSeverity(data)
  }

  useEffect(() => {
    loadVideos()
    loadCameraStats()
  }, [])

  useEffect(() => {
    if (selectedCamera) loadCameraData(selectedCamera)
  }, [selectedCamera])

  useEffect(() => {
    if (selectedVideo) loadVideoSeverity(selectedVideo)
  }, [selectedVideo])

  const cameras = Array.from(new Set(videos.map(v => v.cameraId)))
  const filteredVideos = videos.filter(v => v.cameraId === selectedCamera)

  const selectedVideoName = videos.find(v => v.id === selectedVideo)?.name

  const dateLabels = dailyStats.map((s: any) =>
    `${s.videoName} (${new Date(s.date).toLocaleDateString()})`
  )

  const dateCounts = dailyStats.map((s: any) => s.count)

  const intrusionsPerDayChart = {
    labels: dateLabels,
    datasets: [
      {
        label: "Intrusions",
        data: dateCounts,
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        pointBackgroundColor: "#000",
        pointRadius: 6,
        tension: 0.4,
        fill: false
      }
    ]
  }

  const intrusionsPerCameraChart = {
    labels: Object.keys(cameraStats),
    datasets: [
      {
        label: "Intrusions per Camera",
        data: Object.values(cameraStats),
        backgroundColor: "#2563eb",
        borderColor: "#1e3a8a",
        borderWidth: 1
      }
    ]
  }

  const severityData = {
    labels: Object.keys(severityStats),
    datasets: [
      {
        data: Object.values(severityStats),
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"]
      }
    ]
  }

  const videoSeverityData = {
    labels: Object.keys(videoSeverity),
    datasets: [
      {
        data: Object.values(videoSeverity),
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"]
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#000" } }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: "#000" },
        grid: { color: "rgba(0,0,0,0.1)" }
      },
      x: {
        ticks: { color: "#000" },
        grid: { display: false }
      }
    }
  }

  const pieOptions = {
    plugins: {
      datalabels: {
        color: "#fff",
        font: { weight: "bold" as const, size: 14 },
        formatter: (value: any) => value
      }
    }
  }

  return (
    <div className="p-8 space-y-10 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold text-gray-900">
        Intrusion Statistics
      </h1>

      <div className="flex items-center gap-4 flex-wrap">

        <label className="font-semibold text-gray-800">Select Camera</label>

        <select
          className="border border-gray-300 p-2 rounded shadow-sm"
          onChange={(e) => setSelectedCamera(e.target.value)}
        >
          <option>Select Camera</option>
          {cameras.map((cam) => (
            <option key={cam} value={cam}>{cam}</option>
          ))}
        </select>

        {selectedCamera && (
          <>
            <label className="font-semibold text-gray-800">Select Video</label>

            <select
              className="border border-gray-300 p-2 rounded shadow-sm"
              onChange={(e) => setSelectedVideo(Number(e.target.value))}
            >
              <option>Select Video</option>
              {filteredVideos.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </>
        )}

      </div>

      <div className="grid grid-cols-2 gap-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Intrusions (Camera → Videos)
          </h2>
          <Line data={intrusionsPerDayChart} options={chartOptions} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Intrusions Per Camera
          </h2>
          <Bar data={intrusionsPerCameraChart} options={chartOptions} />
        </div>

        <div className="col-span-2 flex justify-center gap-10">

          <div className="bg-white p-6 rounded-xl shadow w-1/3">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Camera Severity ({selectedCamera})
            </h2>
            <Pie data={severityData} options={pieOptions} />
          </div>

          {selectedVideo && (
            <div className="bg-white p-6 rounded-xl shadow w-1/3">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Video Severity ({selectedVideoName})
              </h2>
              <Pie data={videoSeverityData} options={pieOptions} />
            </div>
          )}

        </div>

      </div>

    </div>
  )
}