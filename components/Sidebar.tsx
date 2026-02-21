"use client"

import Link from "next/link"

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-slate-200 p-6">
      <h1 className="text-xl font-bold text-blue-600 mb-10">
        VIGILAN
      </h1>

      <nav className="space-y-4">
        <Link
          href="/dashboard"
          className="block p-3 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          Dashboard
        </Link>

        <Link
          href="/dashboard/videos"
          className="block p-3 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          Videos
        </Link>

        <Link
          href="/dashboard/zones"
          className="block p-3 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          Hazard Zones
        </Link>

        <Link
          href="/dashboard/intrusions"
          className="block p-3 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          Intrusions
        </Link>
      </nav>
    </div>
  )
}
