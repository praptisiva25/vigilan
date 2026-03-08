"use client"

import { useEffect, useRef } from "react"

interface Point {
x: number
y: number
}

export default function ZoneCanvas({
zones,
points,
setPoints,
editable = false,
hoveredZoneId = null,
}: {
zones: any[]
points: Point[]
setPoints: (p: Point[]) => void
editable?: boolean
hoveredZoneId?: number | null
}) {

const canvasRef = useRef<HTMLCanvasElement>(null)

const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {

if (!editable) return

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

zones.forEach((zone) => {

  try {

    const polygon = JSON.parse(zone.polygonCoordinates)

    const isHovered = zone.id === hoveredZoneId

    let color =
      zone.severity === "HIGH"
        ? "rgba(255,0,0,0.4)"
        : zone.severity === "MEDIUM"
        ? "rgba(255,165,0,0.4)"
        : "rgba(0,255,0,0.4)"

    if (isHovered) {

      color =
        zone.severity === "HIGH"
          ? "rgba(255,0,0,0.7)"
          : zone.severity === "MEDIUM"
          ? "rgba(255,165,0,0.7)"
          : "rgba(0,255,0,0.7)"

      ctx.lineWidth = 3

    } else {

      ctx.lineWidth = 1

    }

    drawPolygon(ctx, polygon, canvas, color)

    // -------- DRAW ZONE NAME (NO BACKGROUND) --------

    if (isHovered) {

      let cx = 0
      let cy = 0

      polygon.forEach((p: Point) => {
        cx += p.x * canvas.width
        cy += p.y * canvas.height
      })

      cx = cx / polygon.length
      cy = cy / polygon.length

      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"
      ctx.fillStyle = "white"

      ctx.fillText(zone.name, cx, cy)

    }

  } catch {}

})

if (editable) {
  drawPolygon(ctx, points, canvas, "rgba(0,0,255,0.1)")
}


}

useEffect(() => {
draw()
}, [zones, points, hoveredZoneId])

return (


<canvas
  ref={canvasRef}
  onClick={editable ? handleClick : undefined}
  className={`absolute inset-0 w-full h-full ${
    editable
      ? "cursor-crosshair pointer-events-auto"
      : "pointer-events-none"
  }`}
/>


)

}
