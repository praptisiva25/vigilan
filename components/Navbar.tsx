"use client"

import { supabase } from "../lib/supabaseClient"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Navbar() {

const router = useRouter()
const [email, setEmail] = useState("")

useEffect(() => {

const getUser = async () => {
  const { data } = await supabase.auth.getUser()
  if (data.user) {
    setEmail(data.user.email || "")
  }
}

getUser()


}, [])

const handleLogout = async () => {
await supabase.auth.signOut()
router.push("/")
}

const navStyle =
"hover:text-blue-600 transition-colors duration-200"

return (


<div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">

  {/* NAV LINKS */}
  <div className="flex items-center gap-6 text-slate-700 font-medium">

    <button
      onClick={() => router.push("/dashboard")}
      className={navStyle}
    >
      Dashboard
    </button>

    <button
      onClick={() => router.push("/dashboard/videos")}
      className={navStyle}
    >
      Videos
    </button>

    <button
      onClick={() => router.push("/dashboard/zones")}
      className={navStyle}
    >
      Hazard Zones
    </button>

    <button
      onClick={() => router.push("/dashboard/intrusions")}
      className={navStyle}
    >
      Intrusions
    </button>

    <button
      onClick={() => router.push("/dashboard/statistics")}
      className={navStyle}
    >
      Statistics
    </button>


    <button
      onClick={() => router.push("/dashboard/helpline")}
      className={navStyle}
    >
      Helpline
    </button>

  </div>

  {/* USER + LOGOUT */}
  <div className="flex items-center gap-6">

    <span className="text-slate-600 text-sm">
      {email}
    </span>

    <button
      onClick={handleLogout}
      className="bg-blue-500 px-4 py-2 rounded-lg text-white hover:bg-blue-600 transition"
    >
      Logout
    </button>

  </div>

</div>


)

}
