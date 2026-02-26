const API = process.env.NEXT_PUBLIC_API_URL!

export default function ZoneList({
  zones,
  onDelete
}: {
  zones: any[]
  onDelete: () => void
}) {
  const deleteZone = async (id: number) => {
    await fetch(`${API}/api/zones/${id}`, { method: "DELETE" })
    onDelete()
  }

  return (
    <div className="max-w-4xl">
      <h2 className="font-semibold mb-3">Existing Zones</h2>

      {zones.map((zone) => (
        <div
          key={zone.id}
          className="border p-3 mb-2 rounded flex justify-between"
        >
          <div>
            <p className="font-semibold">
              {zone.name} — {zone.severity}
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
  )
}