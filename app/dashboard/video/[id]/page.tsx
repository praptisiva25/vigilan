"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import VideoPlayer from "./components/VideoPlayer"
import ZoneCanvas from "./components/ZoneCanvas"
import ZoneForm from "./components/ZoneForm"
import ZoneList from "./components/ZoneList"
import MonitoringPanel from "./components/MonitoringPanel"
import IntrusionList from "./components/IntrusionList"

const API = process.env.NEXT_PUBLIC_API_URL!

export default function VideoPage() {
  const { id } = useParams()

  const [video, setVideo] = useState<any>(null)
  const [zones, setZones] = useState<any[]>([])
  const [intrusions, setIntrusions] = useState<any[]>([])

  const [jobId, setJobId] = useState<number | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [points, setPoints] = useState<{ x: number; y: number }[]>([])

  const loadVideo = async () => {
    const res = await fetch(`${API}/api/videos`)
    const data = await res.json()
    const found = data.find((v: any) => v.id === Number(id))
    setVideo(found)
  }

  const loadZones = async () => {
    const res = await fetch(`${API}/api/zones/video/${id}`)
    const data = await res.json()
    setZones(data)
  }

  const loadIntrusions = async (jobId: number) => {
    const res = await fetch(`${API}/api/intrusions/job/${jobId}`)
    const data = await res.json()
    setIntrusions(data)
  }

  useEffect(() => {
    loadVideo()
    loadZones()
  }, [id])

  useEffect(() => {
    if (!jobId) return

    const interval = setInterval(async () => {
      const res = await fetch(`${API}/api/monitoring/status/${jobId}`)
      const data = await res.json()

      setStatus(data.status)
      setProgress(data.progress)

      if (data.status === "COMPLETED") {
        clearInterval(interval)
        loadIntrusions(jobId)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId])

  const startMonitoring = async (mode: "LIVE" | "FAST") => {
    const res = await fetch(
      `${API}/api/monitoring/start/${id}?mode=${mode}`,
      { method: "POST" }
    )

    const data = await res.json()

    setJobId(data.jobId)
    setStatus(data.status)
    setProgress(data.progress)
  }

  if (!video) return <p className="p-8">Loading...</p>

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">
        Configure Zones — {video.name}
      </h1>

      <div className="relative w-full max-w-4xl aspect-video">
        <VideoPlayer src={video.filePath} />
        <ZoneCanvas zones={zones} points={points} setPoints={setPoints} />
      </div>

      <ZoneForm videoId={Number(id)} points={points} clearPoints={() => setPoints([])} onCreated={loadZones} />

      <ZoneList zones={zones} onDelete={loadZones} />

      <MonitoringPanel
        onStart={startMonitoring}
        status={status}
        progress={progress}
      />

      <IntrusionList intrusions={intrusions} />
    </div>
  )
}