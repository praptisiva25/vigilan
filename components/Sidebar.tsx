"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {

  const pathname = usePathname()

  const isActive = (path: string, exact = false) => {
    if (exact) return pathname === path
    return pathname.startsWith(path)
  }

  const linkClass = (path: string, exact = false) =>
    `block p-3 rounded-lg transition ${
      isActive(path, exact)
        ? "bg-blue-100 text-blue-500 font-semibold"
        : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
    }`

  return (
    <div className="w-64 bg-white border-r border-slate-200 p-6">

      <h1 className="text-xl font-bold text-blue-600 mb-10">
        VIGILAN
      </h1>

      <nav className="space-y-4">

        <Link href="/dashboard" className={linkClass("/dashboard", true)}>
          Dashboard
        </Link>

        <Link href="/dashboard/videos" className={linkClass("/dashboard/videos")}>
          Videos
        </Link>

        <Link href="/dashboard/zones" className={linkClass("/dashboard/zones")}>
          Hazard Zones
        </Link>

        <Link href="/dashboard/intrusions" className={linkClass("/dashboard/intrusions")}>
          Intrusions
        </Link>

        <Link href="/dashboard/statistics" className={linkClass("/dashboard/statistics")}>
          Statistics
        </Link>

      </nav>

    </div>
  )
}