"use client"

const API = process.env.NEXT_PUBLIC_API_URL!

interface Props {
  zones: any[]
  selectedZones: number[]
  setSelectedZones: (ids: number[]) => void
  onDelete: () => void
}

export default function ZoneList({
  zones,
  selectedZones,
  setSelectedZones,
  onDelete
}: Props) {

  const deleteZone = async (id: number) => {
    await fetch(`${API}/api/zones/${id}`, {
      method: "DELETE"
    })

    setSelectedZones(selectedZones.filter(zoneId => zoneId !== id))

    onDelete()
  }

  const toggleZone = (id: number) => {
    if (selectedZones.includes(id)) {
      setSelectedZones(selectedZones.filter(zoneId => zoneId !== id))
    } else {
      setSelectedZones([...selectedZones, id])
    }
  }

  if (zones.length === 0) {
    return (
      <div className="max-w-4xl">
        <h2 className="font-semibold mb-3">Existing Zones</h2>
        <p className="text-gray-500">No zones created yet.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h2 className="font-semibold mb-3">Existing Zones</h2>

      {zones.map((zone) => (
        <div
          key={zone.id}
          className="border p-3 mb-2 rounded flex justify-between items-center"
        >

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedZones.includes(zone.id)}
              onChange={() => toggleZone(zone.id)}
              className="w-4 h-4"
            />

            <div>
              <p className="font-semibold">
                {zone.name}
              </p>
              <p className="text-sm text-gray-600">
                Severity: {zone.severity}
              </p>
            </div>
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