"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { useRouter } from "next/navigation"
import VideoPlayer from "../video/[id]/components/VideoPlayer"
import ZoneCanvas from "../video/[id]/components/ZoneCanvas"

const API = process.env.NEXT_PUBLIC_API_URL!

export default function HazardZoneViewer() {

const router = useRouter()

const [videos, setVideos] = useState<any[]>([])
const [selectedVideo, setSelectedVideo] = useState<any | null>(null)
const [zones, setZones] = useState<any[]>([])
const [search, setSearch] = useState("")
const [hoveredZoneId, setHoveredZoneId] = useState<number | null>(null)

const getToken = async () => {

const { data: { session } } = await supabase.auth.getSession()

if (!session) {
  router.push("/")
  return null
}

return session.access_token


}

const authFetch = async (url: string) => {

const token = await getToken()
if (!token) return null

const res = await fetch(`${API}${url}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

if (!res.ok) return null

return res.json()


}

const loadVideos = async () => {


const data = await authFetch(
  search
    ? `/api/videos?search=${search}`
    : `/api/videos`
)

if (data) setVideos(data)


}

const loadZones = async (videoId: number) => {


const data = await authFetch(`/api/zones/video/${videoId}`)

if (data) setZones(data)


}

useEffect(() => {
loadVideos()
}, [search])

const selectVideo = (video: any) => {

setSelectedVideo(video)
loadZones(video.id)


}

return (


<div className="flex h-screen">

  {/* SIDEBAR */}

  <div className="w-80 border-r p-4 overflow-y-auto bg-white">

    <h2 className="text-xl font-bold mb-4">
      Cameras
    </h2>

    <input
      placeholder="Search camera..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border p-2 w-full mb-4 rounded"
    />

    {videos.map((video) => (

      <div
        key={video.id}
        onClick={() => selectVideo(video)}
        className={`p-2 rounded cursor-pointer mb-2 ${
          selectedVideo?.id === video.id
            ? "bg-blue-100"
            : "hover:bg-gray-100"
        }`}
      >

        {video.name}

      </div>

    ))}

    <hr className="my-4" />

    <h3 className="font-semibold mb-2">
      Hazard Zones
    </h3>

    {zones.length === 0 && (
      <p className="text-sm text-gray-500">
        No zones for this camera
      </p>
    )}

    {zones.map(zone => (

      <div
        key={zone.id}
        onMouseEnter={() => setHoveredZoneId(zone.id)}
        onMouseLeave={() => setHoveredZoneId(null)}
        className="border p-2 rounded mb-2 hover:bg-gray-100 cursor-pointer"
      >

        <p className="font-semibold">
          {zone.name}
        </p>

        <p className="text-sm text-gray-600">
          Severity: {zone.severity}
        </p>

      </div>

    ))}

  </div>

  {/* VIDEO AREA */}

  <div className="flex-1 p-8 flex items-start justify-center bg-gray-50">

    {selectedVideo ? (

      <div className="relative max-w-4xl w-full aspect-video">

        <VideoPlayer src={selectedVideo.filePath} />

        <ZoneCanvas
          zones={zones}
          points={[]}
          setPoints={() => {}}
          editable={false}
          hoveredZoneId={hoveredZoneId}
        />

      </div>

    ) : (

      <p className="text-gray-500">
        Select a camera to view hazard zones
      </p>

    )}

  </div>

</div>


)

}
