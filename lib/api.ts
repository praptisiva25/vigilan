export const API_BASE = "http://localhost:8080/api"

export async function startMonitoring(videoId: number, mode: string) {
  const res = await fetch(
    `${API_BASE}/monitoring/start/${videoId}?mode=${mode}`,
    {
      method: "POST",
    }
  )

  if (!res.ok) throw new Error("Failed to start monitoring")

  return res.json()
}

export async function getJobStatus(jobId: number) {
  const res = await fetch(
    `${API_BASE}/monitoring/status/${jobId}`
  )

  if (!res.ok) throw new Error("Failed to fetch status")

  return res.json()
}
