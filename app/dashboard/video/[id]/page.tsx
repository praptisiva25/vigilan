"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL!

interface Point {
  x: number
  y: number
}

export default function VideoConfigPage() {
  const { id } = useParams()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [video, setVideo] = useState<any>(null)
  const [zones, setZones] = useState<any[]>([])
  const [points, setPoints] = useState<Point[]>([])

  const [zoneName, setZoneName] = useState("")
  const [severity, setSeverity] = useState("LOW")
  const [allowedObjects, setAllowedObjects] = useState("")
  const [blockedObjects, setBlockedObjects] = useState("")

  // Monitoring state
  const [jobId, setJobId] = useState<number | null>(null)
  const [jobStatus, setJobStatus] = useState<string | null>(null)
  const [jobProgress, setJobProgress] = useState<number>(0)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    loadVideo()
    loadZones()
  }, [id])

  const loadVideo = async () => {
    try {
      const res = await fetch(`${API}/api/videos`)
      const data = await res.json()
      const found = Array.isArray(data)
        ? data.find((v: any) => v.id === Number(id))
        : null
      setVideo(found)
    } catch {
      setVideo(null)
    }
  }

  const loadZones = async () => {
    try {
      const res = await fetch(`${API}/api/zones/video/${id}`)
      const data = await res.json()
      setZones(Array.isArray(data) ? data : [])
    } catch {
      setZones([])
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setPoints((prev) => [...prev, { x, y }])
  }

  const finishZone = async () => {
    if (points.length < 3) {
      alert("Minimum 3 points required")
      return
    }

    if (!zoneName.trim()) {
      alert("Please enter a zone name")
      return
    }

    await fetch(`${API}/api/zones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId: Number(id),
        name: zoneName,
        severity,
        polygonCoordinates: JSON.stringify(points),
        allowedObjects,
        blockedObjects,
      }),
    })

    setPoints([])
    setZoneName("")
    setAllowedObjects("")
    setBlockedObjects("")
    setSeverity("LOW")

    loadZones()
  }

  const deleteZone = async (zoneId: number) => {
    await fetch(`${API}/api/zones/${zoneId}`, {
      method: "DELETE",
    })
    loadZones()
  }

  // Monitoring
  const startMonitoring = async (mode: "LIVE" | "FAST") => {
    const res = await fetch(
      `${API}/api/monitoring/start/${id}?mode=${mode}`,
      { method: "POST" }
    )

    const data = await res.json()

    setJobId(data.id)
    setJobStatus(data.status)
    setJobProgress(data.progress)
    setPolling(true)
  }

  useEffect(() => {
    if (!polling || !jobId) return

    const interval = setInterval(async () => {
      const res = await fetch(`${API}/api/monitoring/status/${jobId}`)
      const data = await res.json()

      setJobStatus(data.status)
      setJobProgress(data.progress)

      if (data.status === "COMPLETED") {
        setPolling(false)
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [polling, jobId])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width
    canvas.height = rect.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const drawPolygon = (polygon: Point[], color: string) => {
      if (!Array.isArray(polygon) || polygon.length === 0) return

      ctx.beginPath()

      polygon.forEach((p, i) => {
        const px = p.x * canvas.width
        const py = p.y * canvas.height
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })

      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = "black"
      ctx.stroke()
    }

    zones.forEach((zone) => {
      let polygon: any

      try {
        polygon = JSON.parse(zone.polygonCoordinates)
      } catch {
        return
      }

      if (!Array.isArray(polygon)) return

      const color =
        zone.severity === "HIGH"
          ? "rgba(255,0,0,0.4)"
          : zone.severity === "MEDIUM"
          ? "rgba(255,165,0,0.4)"
          : "rgba(0,255,0,0.4)"

      drawPolygon(polygon, color)
    })

    if (points.length > 0) {
      drawPolygon(points, "rgba(0,0,255,0.3)")
    }
  }

  useEffect(() => {
    draw()
  }, [points, zones])

  if (!video) return <p className="p-8">Loading...</p>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Configure Zones — {video.name}
      </h1>

      <div className="relative w-full max-w-4xl aspect-video">
        <video
          ref={videoRef}
          src={video.filePath}
          controls
          className="w-full h-full object-contain"
        />

        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair"
          onClick={handleClick}
        />
      </div>

      {/* Monitoring Section */}
      <div className="mt-6 bg-white p-4 rounded shadow max-w-4xl">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => startMonitoring("LIVE")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Start LIVE Monitoring
          </button>

          <button
            onClick={() => startMonitoring("FAST")}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Start FAST Monitoring
          </button>
        </div>

        {jobStatus && (
          <div>
            <p className="mb-2">
              Status: <span className="font-semibold">{jobStatus}</span>
            </p>

            <div className="w-full bg-gray-200 rounded h-4">
              <div
                className="bg-green-600 h-4 rounded transition-all"
                style={{ width: `${jobProgress}%` }}
              />
            </div>

            <p className="mt-1 text-sm">{jobProgress}%</p>
          </div>
        )}
      </div>

      {/* Zone Creation */}
      <div className="mt-6 bg-white p-4 rounded shadow max-w-4xl">
        <div className="flex gap-4 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Zone name"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            className="border p-2 flex-1"
          />

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="border p-2"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          <input
            type="text"
            placeholder="Allowed objects"
            value={allowedObjects}
            onChange={(e) => setAllowedObjects(e.target.value)}
            className="border p-2 flex-1"
          />

          <input
            type="text"
            placeholder="Blocked objects"
            value={blockedObjects}
            onChange={(e) => setBlockedObjects(e.target.value)}
            className="border p-2 flex-1"
          />
        </div>

        <button
          onClick={finishZone}
          className="bg-green-600 text-white px-4 py-2 rounded mr-3"
        >
          Finish Zone
        </button>

        <button
          onClick={() => setPoints([])}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Clear Points
        </button>
      </div>

      {/* Existing Zones */}
      <div className="mt-6 max-w-4xl">
        <h2 className="font-semibold mb-3">Existing Zones</h2>

        {zones.length === 0 && (
          <p className="text-gray-500">No zones created yet.</p>
        )}

        {zones.map((zone) => (
          <div
            key={zone.id}
            className="border p-3 mb-2 rounded flex justify-between"
          >
            <div>
              <p className="font-semibold">
                {zone.name} — {zone.severity}
              </p>
              <p className="text-sm text-gray-500">
                Allowed: {zone.allowedObjects}
              </p>
              <p className="text-sm text-gray-500">
                Blocked: {zone.blockedObjects}
              </p>
            </div>

            <button
              onClick={() => deleteZone(zone.id)}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}