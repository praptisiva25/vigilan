interface Props {
  onStart: (mode: "LIVE" | "FAST") => void
  status: string | null
  progress: number
}

export default function MonitoringPanel({ onStart, status, progress }: Props) {
  return (
    <div className="bg-white p-4 rounded shadow max-w-4xl">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => onStart("LIVE")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Start LIVE
        </button>

        <button
          onClick={() => onStart("FAST")}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Start FAST
        </button>
      </div>

      {status && (
        <>
          <p>Status: <strong>{status}</strong></p>

          <div className="w-full bg-gray-200 h-4 rounded mt-2">
            <div
              className="bg-green-600 h-4 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm mt-1">{progress}%</p>
        </>
      )}
    </div>
  )
}