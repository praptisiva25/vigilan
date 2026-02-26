"use client"

import { useEffect, useRef } from "react"

interface Point {
  x: number
  y: number
}

export default function ZoneCanvas({
  zones,
  points,
  setPoints
}: {
  zones: any[]
  points: Point[]
  setPoints: (p: Point[]) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()

    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setPoints([...points, { x, y }])
  }

  const drawPolygon = (
    ctx: CanvasRenderingContext2D,
    polygon: Point[],
    canvas: HTMLCanvasElement,
    color: string
  ) => {
    if (!polygon.length) return

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
    ctx.stroke()
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width
    canvas.height = rect.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // draw existing zones
    zones.forEach((zone) => {
      try {
        const polygon = JSON.parse(zone.polygonCoordinates)

        const color =
          zone.severity === "HIGH"
            ? "rgba(255,0,0,0.4)"
            : zone.severity === "MEDIUM"
            ? "rgba(255,165,0,0.4)"
            : "rgba(0,255,0,0.4)"

        drawPolygon(ctx, polygon, canvas, color)
      } catch {}
    })

    // draw current drawing (blue)
    drawPolygon(ctx, points, canvas, "rgba(0,0,255,0.3)")
  }

  useEffect(() => {
    draw()
  }, [zones, points])

  return (
  <canvas
    ref={canvasRef}
    onClick={handleClick}
    className="absolute inset-0 w-full h-full cursor-crosshair"
  />
)
}