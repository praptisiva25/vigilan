"use client"

import { useState } from "react"

export default function IntrusionList({ intrusions }: { intrusions: any[] }) {

  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <>
      <div className="bg-white p-2 rounded shadow h-[1195px] overflow-y-auto">

        <h2 className="font-semibold mb-4 text-lg">
          🚨 Intrusion Alerts
        </h2>

        {!intrusions.length && (
          <p className="text-gray-500 text-sm">
            No intrusions detected yet
          </p>
        )}

        {intrusions.map((intrusion) => {

          const severityColor =
            intrusion.severity === "HIGH"
              ? "bg-red-100 border-red-500"
              : intrusion.severity === "MEDIUM"
              ? "bg-yellow-100 border-yellow-500"
              : "bg-green-100 border-green-500"

          const severityTextColor =
            intrusion.severity === "HIGH"
              ? "text-red-700"
              : intrusion.severity === "MEDIUM"
              ? "text-yellow-700"
              : "text-green-700"

          return (
            <div
              key={intrusion.id}
              className={`border-l-4 p-3 mb-3 rounded shadow-sm ${severityColor}`}
            >

              {/* ALERT LEVEL */}
              <p className={`font-bold text-sm ${severityTextColor}`}>
                {intrusion.severity} ALERT
              </p>

              {/* ZONE */}
              <p className="font-semibold">
                Zone: {intrusion.name ?? intrusion.zoneId}
              </p>

              {/* DETECTED OBJECT */}
              <p className="text-sm">
                Detected: {intrusion.blockedObjects ?? intrusion.objectId}
              </p>

              {/* ENTRY TIME */}
              <p className="text-sm">
                Entry Time: {intrusion.entryTimeSeconds?.toFixed(2)}s
              </p>

              {/* DURATION */}
              <p className="text-sm">
                Duration: {intrusion.durationSeconds?.toFixed(2)}s
              </p>

              {/* SCREENSHOT */}
              {intrusion.screenshotUrl && (
                <div className="relative mt-2">

                  <img
                    src={intrusion.screenshotUrl}
                    className="w-full rounded"
                    alt="Intrusion Screenshot"
                  />

                  {/* VIEW BUTTON */}
                  <button
                    onClick={() => setSelectedImage(intrusion.screenshotUrl)}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded hover:bg-black"
                    title="View Screenshot"
                  >
                    👁
                  </button>

                </div>
              )}

            </div>
          )
        })}

      </div>

      {/* FULLSCREEN MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
          />
        </div>
      )}
    </>
  )
}