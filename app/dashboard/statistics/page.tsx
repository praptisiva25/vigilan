"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"

import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
PointElement,
LineElement,
Title,
Tooltip,
Legend
} from "chart.js"

import { Bar, Line } from "react-chartjs-2"

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
PointElement,
LineElement,
Title,
Tooltip,
Legend
)

const API = process.env.NEXT_PUBLIC_API_URL!

export default function StatsPage() {

const [videos, setVideos] = useState<any[]>([])
const [selectedVideo, setSelectedVideo] = useState<number | null>(null)

const [dailyStats, setDailyStats] = useState<any[]>([])
const [cameraStats, setCameraStats] = useState<any>({})

const getToken = async () => {
const { data: { session } } = await supabase.auth.getSession()
return session?.access_token
}

const authFetch = async (url: string) => {

const token = await getToken()
if (!token) return null

const res = await fetch(`${API}${url}`, {
headers: { Authorization: `Bearer ${token}` }
})

if (!res.ok) return null
return res.json()

}

// ---------------- LOAD CAMERAS ----------------

const loadVideos = async () => {

const data = await authFetch("/api/videos")

if (data) setVideos(data)

}

// ---------------- LOAD DAILY STATS ----------------

const loadDailyStats = async (videoId:number) => {

const data = await authFetch(`/api/intrusions/stats/video/${videoId}`)

if (data) setDailyStats(data)

}

// ---------------- LOAD CAMERA STATS ----------------

const loadCameraStats = async () => {

const data = await authFetch(`/api/intrusions/stats/cameras`)

if (data) setCameraStats(data)

}

useEffect(()=>{

loadVideos()
loadCameraStats()

},[])

useEffect(()=>{

if(selectedVideo){
loadDailyStats(selectedVideo)
}

},[selectedVideo])

// ---------------- GRAPH 1 DATA ----------------

const dateLabels = dailyStats.map((s:any)=>
new Date(s.date).toLocaleDateString()
)

const dateCounts = dailyStats.map((s:any)=>s.count)

const intrusionsPerDayChart = {

labels: dateLabels,

datasets: [

{

label:"Intrusions per Day",

data: dateCounts,

borderColor:"#2563eb",
backgroundColor:"#2563eb",

pointBackgroundColor:"#000",

pointRadius:6,

tension:0.4,

fill:false

}

]

}

// ---------------- GRAPH 2 DATA ----------------

const cameraLabels = Object.keys(cameraStats)

const cameraCounts = Object.values(cameraStats)

const intrusionsPerCameraChart = {

labels: cameraLabels,

datasets: [

{

label:"Intrusions per Camera",

data: cameraCounts,

backgroundColor:"#2563eb",

borderColor:"#1e3a8a",

borderWidth:1

}

]

}

// ---------------- CHART OPTIONS ----------------

const chartOptions = {

responsive:true,

plugins:{
legend:{
labels:{
color:"#000"
}
}
},

scales:{

y:{
beginAtZero:true,
ticks:{
stepSize:1,
color:"#000"
},
grid:{
color:"rgba(0,0,0,0.1)"
}
},

x:{
ticks:{
color:"#000"
},
grid:{
display:false
}
}

}

}

return (

<div className="p-8 space-y-10 bg-gray-50 min-h-screen">

<h1 className="text-3xl font-bold text-gray-900">
Intrusion Statistics
</h1>

{/* CAMERA SELECT */}

<div className="flex items-center gap-4">

<label className="font-semibold text-gray-800">
Select Camera
</label>

<select
className="border border-gray-300 p-2 rounded shadow-sm"
onChange={(e)=>setSelectedVideo(Number(e.target.value))}

>

<option>Select Camera</option>

{videos.map(video=>(

<option key={video.id} value={video.id}>
{video.name}
</option>
))}

</select>

</div>

{/* CHARTS */}

<div className="grid grid-cols-2 gap-10">

{/* GRAPH 1 */}

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-xl font-semibold mb-4 text-gray-900">
Intrusions Per Day
</h2>

<Line
data={intrusionsPerDayChart}
options={chartOptions}
/>

</div>

{/* GRAPH 2 */}

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-xl font-semibold mb-4 text-gray-900">
Intrusions Per Camera
</h2>

<Bar
data={intrusionsPerCameraChart}
options={chartOptions}
/>

</div>

</div>

</div>

)

}
