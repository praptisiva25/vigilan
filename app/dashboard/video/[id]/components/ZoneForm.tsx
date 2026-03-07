"use client"

import { useState } from "react"
import { yoloCategories } from "../../../../../lib/yoloCategories"

const API = process.env.NEXT_PUBLIC_API_URL!

export default function ZoneForm({
  videoId,
  points,
  clearPoints,
  onCreated
}: {
  videoId: number
  points: { x: number; y: number }[]
  clearPoints: () => void
  onCreated: () => void
}) {

  const [name, setName] = useState("")
  const [severity, setSeverity] = useState("LOW")

  const [category, setCategory] = useState("")
  const [blocked, setBlocked] = useState("")

  const createZone = async () => {
    if (points.length < 3) {
      alert("Minimum 3 points required")
      return
    }

    await fetch(`${API}/api/zones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId,
        name,
        severity,
        polygonCoordinates: JSON.stringify(points),
        blockedObjects: blocked
      })
    })

    setName("")
    setSeverity("LOW")
    setCategory("")
    setBlocked("")
    clearPoints()
    onCreated()
  }

  return (
    <div className="bg-white p-4 rounded shadow max-w-4xl space-y-2">

      {/* Zone name */}
      <input
        placeholder="Zone Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
      />

      {/* Severity */}
      <select
        value={severity}
        onChange={(e) => setSeverity(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
      </select>

      {/* Category dropdown */}
      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value)
          setBlocked("")
        }}
        className="border p-2 w-full"
      >
        <option value="">Select Category</option>

        {Object.keys(yoloCategories).map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Object dropdown */}
      {category && (
        <select
          value={blocked}
          onChange={(e) => setBlocked(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Select Object</option>

          {yoloCategories[category].map((obj) => (
            <option key={obj} value={obj}>
              {obj}
            </option>
          ))}
        </select>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={createZone}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Finish Zone
        </button>

        <button
          onClick={clearPoints}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Clear Points
        </button>
      </div>

    </div>
  )
}