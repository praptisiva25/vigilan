"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"

const API = process.env.NEXT_PUBLIC_API_URL!

export default function IntrusionDetailsPage() {

  const { jobId } = useParams()
  const router = useRouter()

  const [intrusions, setIntrusions] = useState<any[]>([])

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  const loadIntrusions = async () => {
    const token = await getToken()
    if (!token) return

    const res = await fetch(
      `${API}/api/intrusions/job/${jobId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!res.ok) return

    const data = await res.json()
    setIntrusions(data)
  }

  useEffect(() => {
    loadIntrusions()
  }, [])

  return (
    <div className="p-8 space-y-6">

      <button
        onClick={() => router.push("/dashboard/intrusions")}
        className="text-blue-600"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold">
        Intrusions for Job #{jobId}
      </h1>

      {intrusions.length === 0 && (
        <p className="text-gray-500">
          No intrusions found.
        </p>
      )}

      {intrusions.map(intrusion => (
        <div
          key={intrusion.id}
          className="border p-4 rounded"
        >
          <p><strong>Zone ID:</strong> {intrusion.hazardZoneId}</p>
          <p><strong>Duration:</strong> {intrusion.durationSeconds}s</p>
          <p><strong>Entry:</strong> {intrusion.entryTimeSeconds}s</p>
          <p><strong>Exit:</strong> {intrusion.exitTimeSeconds}s</p>

          {intrusion.screenshotUrl && (
            <img
              src={intrusion.screenshotUrl}
              className="mt-2 rounded max-w-sm"
            />
          )}
        </div>
      ))}

    </div>
  )
}