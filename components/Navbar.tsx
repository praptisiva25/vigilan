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
    router.push("/login")
  }

  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <h2 className="text-lg font-semibold text-slate-700">
        Dashboard Overview
      </h2>

      <div className="flex items-center gap-6">
        <span className="text-slate-600 text-sm">{email}</span>

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
