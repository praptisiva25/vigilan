"use client"

import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL
const SIDE_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"

export default function AuthPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const registerUserInBackend = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return

    await fetch(`${API}/api/users/me`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
  }

  const handleAuth = async () => {
    setLoading(true)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(error.message)
      } else {
        await registerUserInBackend()
        router.push("/dashboard")
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        alert(error.message)
      } else {
        alert("Account created successfully! You can now login.")
        setIsLogin(true)
      }
    }

    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[1.5fr_0.9fr]">
      
      {/* LEFT SIDE */}
      <div className="relative hidden lg:flex flex-col justify-between p-16 xl:p-20 overflow-hidden">
        <img
          src={SIDE_IMAGE}
          alt="Vigilan Monitoring"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/95 via-[#172554]/80 to-[#020617]/90" />

        {/* Top content */}
        <div className="relative z-10 max-w-2xl">
          <p className="text-blue-300 text-sm tracking-[0.35em] uppercase mb-6">
            Security Platform
          </p>

          <h1 className="text-6xl xl:text-7xl font-bold text-white leading-tight">
            VIGILAN
          </h1>

          <div className="mt-10 space-y-4 text-slate-200 text-2xl xl:text-3xl font-medium leading-relaxed">
            <p>Secure Monitoring.</p>
            <p>Instant Response.</p>
            <p>Total Visibility.</p>
          </div>

          <p className="mt-10 text-slate-300 text-lg xl:text-xl leading-9 max-w-xl">
            A centralized platform for surveillance, incident tracking,
            authentication, and operational awareness.
          </p>
        </div>

        {/* Bottom feature cards */}
        <div className="relative z-10 grid gap-5 max-w-2xl">
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-6 py-5 text-white text-lg">
            ✓ Real-time monitoring and alerts
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-6 py-5 text-white text-lg">
            ✓ Secure access and role-based authentication
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-6 py-5 text-white text-lg">
            ✓ Unified dashboard for operational control
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center bg-white px-8 py-14 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md">
          
          {/* Mobile branding */}
          <div className="lg:hidden mb-12 text-center">
            <h1 className="text-4xl font-bold text-slate-900">VIGILAN</h1>
            <p className="text-slate-500 mt-3 text-base">
              Secure Monitoring. Instant Response. Total Visibility.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-5xl font-bold text-slate-900 text-center leading-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>

            <p className="text-slate-500 text-center mt-4 text-lg">
              {isLogin
                ? "Access the official Vigilan dashboard"
                : "Create your official Vigilan account"}
            </p>
          </div>

          <div className="space-y-6">
            <input
              type="email"
              placeholder="Official Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-16 px-5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-16 px-5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold transition-all shadow-lg disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : isLogin
                ? "Secure Login"
                : "Create Account"}
            </button>

            <div className="text-center pt-1">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 hover:underline text-base"
              >
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Login"}
              </button>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-slate-400 text-sm font-medium">OR</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full h-16 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 transition font-medium text-slate-700 text-lg"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}