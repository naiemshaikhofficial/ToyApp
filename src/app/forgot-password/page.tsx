'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Mail, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid work email address.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw new Error(error.message)
      setIsSent(true)
    } catch (err: any) {
      console.error('Password reset error:', err)
      setErrorMsg(err.message || 'Could not send reset link. Please check your email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-4 py-10 font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-[440px] bg-[#161616] border border-[#262626] rounded-2xl p-7 sm:p-10 shadow-2xl space-y-6 relative">
        {/* Top Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-mono font-bold transition-colors uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        {isSent ? (
          <div className="flex flex-col items-center text-center space-y-5 py-4">
            <div className="w-14 h-14 rounded-full bg-[#202020] border border-[#383838] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">
                Reset Link Dispatched
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                We sent secure password reset instructions to{' '}
                <span className="font-mono text-white font-semibold">{email}</span>. Click the link in the message to update your access credentials.
              </p>
            </div>

            <div className="w-full pt-3">
              <Link
                href="/login"
                className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-md tracking-wider uppercase transition-all flex items-center justify-center"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Brand Header */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-[#2e2e2e] bg-[#181818] shadow-md p-1">
                <Image
                  src="/Manager Bear Dashboard Mascot.png"
                  alt="Toy App Mascot"
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>

              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight uppercase">
                  Reset Password
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Enter your verified staff email to receive recovery instructions.
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="bg-[#202020] border border-white/20 text-white p-3.5 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-white shrink-0" />
                  <span>Request Failed</span>
                </div>
                <p className="text-[11px] text-zinc-300 pl-6 leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Staff Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@producertoy.com"
                    className="w-full h-11 bg-[#181818] border border-[#2a2a2a] hover:border-[#383838] focus:border-white text-white text-xs pl-10 pr-3.5 rounded-md outline-none transition-colors placeholder:text-zinc-600 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-md tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span>Sending Instructions...</span>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-[#262626] flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Encrypted Security</span>
              </div>
              <span className="text-[10px] uppercase">Toy App</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
