"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"

const API = process.env.NEXT_PUBLIC_API_URL!

export default function IntrusionDetailsPage() {

const params = useParams<{ jobId?: string | string[] }>()
const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId

const router = useRouter()

const [intrusions, setIntrusions] = useState<any[]>([])
const [startedAt, setStartedAt] = useState<string | null>(null)

// -------- AUTH TOKEN --------
const getToken = async () => {
const { data: { session } } = await supabase.auth.getSession()
return session?.access_token
}

// -------- LOAD INTRUSIONS --------
const loadIntrusions = async () => {

const token = await getToken()
if (!token || !jobId) return

const res = await fetch(
  `${API}/api/intrusions/job/${jobId}`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
)

if (!res.ok) return

const data = await res.json()

setIntrusions(data)

// Get job start time from first intrusion
if (data.length > 0 && data[0].startedAt) {
  setStartedAt(data[0].startedAt)
}


}

useEffect(() => {
loadIntrusions()
}, [])

return ( <div className="p-8 space-y-6">

```
  {/* BACK BUTTON */}
  <button
    onClick={() => router.push("/dashboard/intrusions")}
    className="text-blue-600 hover:underline"
  >
    ← Back
  </button>

  {/* TITLE */}
  <div>

    <h1 className="text-2xl font-bold">
      Intrusions for Job #{jobId}
    </h1>

    {startedAt && (
      <p className="text-gray-600 mt-1">
        Started at {new Date(startedAt).toLocaleString()}
      </p>
    )}

  </div>

  {/* NO INTRUSIONS */}
  {intrusions.length === 0 && (
    <p className="text-gray-500">
      No intrusions found.
    </p>
  )}

  {/* INTRUSION LIST */}
  <div className="space-y-4">

    {intrusions.map((intrusion) => (

      <div
        key={intrusion.id}
        className="border p-4 rounded shadow-sm"
      >
        <p>
          <strong>Time:</strong> {intrusion.startedAt}
        </p>

        <p>
          <strong>Zone ID:</strong> {intrusion.hazardZoneId}
        </p>

        <p>
          <strong>Duration:</strong> {intrusion.durationSeconds}s
        </p>

        <p>
          <strong>Entry:</strong> {intrusion.entryTimeSeconds}s
        </p>

        <p>
          <strong>Exit:</strong> {intrusion.exitTimeSeconds}s
        </p>

        {/* SCREENSHOT */}
        {intrusion.screenshotUrl && (

          <img
            src={intrusion.screenshotUrl}
            className="mt-3 rounded max-w-sm"
          />

        )}

      </div>

    ))}

  </div>

</div>


)
}
