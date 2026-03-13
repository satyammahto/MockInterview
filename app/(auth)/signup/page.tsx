"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Loader2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError("Passwords do not match."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    setLoading(true); setError("")
    try {
      await signUp(email, password)
      router.push("/upload")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#080B14" }}>
      <div className="w-full max-w-md px-8 py-10 rounded-2xl" style={{ background: "#0E1220", border: "1px solid #1E2535" }}>
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-extrabold mb-1" style={{ color: "#E8EDF5" }}>Create account</h1>
          <p style={{ color: "#8892A4", fontSize: 14 }}>Start your mock interview prep today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8892A4" }}>Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ background: "#080B14", border: "1px solid #1E2535", color: "#E8EDF5" }}
              onFocus={e => e.target.style.borderColor = "#4EFFA3"}
              onBlur={e => e.target.style.borderColor = "#1E2535"}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8892A4" }}>Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ background: "#080B14", border: "1px solid #1E2535", color: "#E8EDF5" }}
              onFocus={e => e.target.style.borderColor = "#4EFFA3"}
              onBlur={e => e.target.style.borderColor = "#1E2535"}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8892A4" }}>Confirm Password</label>
            <input
              type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ background: "#080B14", border: "1px solid #1E2535", color: "#E8EDF5" }}
              onFocus={e => e.target.style.borderColor = "#4EFFA3"}
              onBlur={e => e.target.style.borderColor = "#1E2535"}
            />
          </div>

          {error && <p className="text-sm rounded-xl px-4 py-3" style={{ color: "#FF6B6B", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-heading font-bold text-base text-black disabled:opacity-50 transition-all hover:-translate-y-px"
            style={{ background: "#4EFFA3" }}
          >
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Creating account...</span> : "Create Account"}
          </button>

          <p className="text-center text-sm" style={{ color: "#8892A4" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#4EFFA3" }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
