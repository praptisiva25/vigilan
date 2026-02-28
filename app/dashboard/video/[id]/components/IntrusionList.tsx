export default function IntrusionList({ intrusions }: { intrusions: any[] }) {
  if (!intrusions.length) return null

  return (
    <div className="bg-white p-4 rounded shadow max-w-4xl">
      <h2 className="font-semibold mb-3">Intrusion Events</h2>

      {intrusions.map((intrusion) => (
        <div key={intrusion.id} className="border p-3 mb-2 rounded">
          <p>Zone ID: {intrusion.zoneId}</p>
          <p>Object ID: {intrusion.objectId}</p>
          <p>Duration: {intrusion.durationSeconds?.toFixed(2)}s</p>

          {intrusion.screenshotUrl && (
            <img
            src={intrusion.screenshotUrl}
            className="w-48 mt-2 rounded"
            alt="Intrusion Screenshot"
            />
          )}
        </div>
      ))}
    </div>
  )
}