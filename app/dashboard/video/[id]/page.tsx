"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

import VideoPlayer from "./components/VideoPlayer"
import ZoneCanvas from "./components/ZoneCanvas"
import ZoneForm from "./components/ZoneForm"
import ZoneList from "./components/ZoneList"
import MonitoringPanel from "./components/MonitoringPanel"
import IntrusionList from "./components/IntrusionList"

const API = process.env.NEXT_PUBLIC_API_URL!

export default function VideoPage() {
  const { id } = useParams()
  const router = useRouter()

  const [video, setVideo] = useState<any>(null)
  const [zones, setZones] = useState<any[]>([])
  const [selectedZones, setSelectedZones] = useState<number[]>([])
  const [intrusions, setIntrusions] = useState<any[]>([])

  const [jobId, setJobId] = useState<number | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [points, setPoints] = useState<{ x: number; y: number }[]>([])

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

  const loadVideo = async () => {
    const data = await authFetch("/api/videos")
    if (!data) return

    const found = data.find((v: any) => v.id === Number(id))
    setVideo(found)
  }

  const loadZones = async () => {
    const data = await authFetch(`/api/zones/video/${id}`)
    if (data) setZones(data)
  }

  const loadIntrusions = async (jobId: number) => {
    const data = await authFetch(`/api/intrusions/job/${jobId}`)
    if (data) setIntrusions(data)
  }

  useEffect(() => {
    loadVideo()
    loadZones()
  }, [id])

  useEffect(() => {
    if (!jobId) return

    const interval = setInterval(async () => {
      const data = await authFetch(`/api/monitoring/status/${jobId}`)
      if (!data) return

      setStatus(data.status)
      setProgress(data.progress)

      if (data.status === "COMPLETED") {
        clearInterval(interval)
        loadIntrusions(jobId)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId])

  const startMonitoring = async () => {
  if (selectedZones.length === 0) {
    alert("Select at least one zone")
    return
  }

  const data = await authFetch(`/api/monitoring/start/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(selectedZones),
  })

  if (!data) return

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

      <ZoneForm
        videoId={Number(id)}
        points={points}
        clearPoints={() => setPoints([])}
        onCreated={loadZones}
      />

      <ZoneList
  zones={zones}
  selectedZones={selectedZones}
  setSelectedZones={setSelectedZones}
  onDelete={loadZones}
/>

      <MonitoringPanel
        onStart={startMonitoring}
        status={status}
        progress={progress}
      />

      <IntrusionList intrusions={intrusions} />
    </div>
  )
}