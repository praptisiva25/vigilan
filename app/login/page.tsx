"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL

export default function AuthPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const registerUserInBackend = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return

    await fetch(`${API}/api/users/me`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })
  }

  const handleAuth = async () => {
    setLoading(true)

    if (isLogin) {
      // LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(error.message)
      } else {
        // IMPORTANT: register user in backend
        await registerUserInBackend()
        router.push("/dashboard")
      }

    } else {
      // SIGN UP
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
        redirectTo: "http://localhost:3000/dashboard",
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
      <div className="w-[420px] bg-white p-10 rounded-3xl shadow-xl border border-slate-200">

        <h1 className="text-3xl font-bold text-slate-800 text-center">
          VIGILAN
        </h1>

        <p className="text-slate-500 text-center mt-2 mb-8">
          {isLogin ? "Official Login" : "Create Official Account"}
        </p>

        <div className="space-y-5">
          <input
            type="email"
            placeholder="Official Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />

          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full p-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all shadow-md disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : isLogin
              ? "Secure Login"
              : "Create Account"}
          </button>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 hover:underline text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Login"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full p-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 transition font-medium text-slate-700"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}