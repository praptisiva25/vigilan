interface Props {
  onStart: () => void
  status: string | null
  progress: number
}

export default function MonitoringPanel({ onStart, status, progress }: Props) {
  return (
    <div className="bg-white p-4 rounded shadow max-w-4xl">
      <div className="mb-4">
        <button
          onClick={onStart}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Start Monitoring
        </button>
      </div>

      {status && (
        <>
          <p>
            Status: <strong>{status}</strong>
          </p>

          <div className="w-full bg-gray-200 h-4 rounded mt-2">
            <div
              className="bg-green-600 h-4 rounded transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm mt-1">{progress}%</p>
        </>
      )}
    </div>
  )
}