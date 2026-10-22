'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw new Error(error.message)
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Update password error:', err)
      setErrorMsg(err.message || 'Failed to update password. Please check your reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-4 py-10 font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-[440px] bg-[#161616] border border-[#262626] rounded-2xl p-7 sm:p-10 shadow-2xl space-y-6 relative">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center space-y-5 py-4">
            <div className="w-14 h-14 rounded-full bg-[#202020] border border-[#383838] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">
                Password Updated
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                Your staff account credentials have been successfully updated. You can now sign in with your new password.
              </p>
            </div>

            <div className="w-full pt-3">
              <Link
                href="/login"
                className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-md tracking-wider uppercase transition-all flex items-center justify-center"
              >
                Proceed to Sign In
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
                  Set New Password
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Enter a secure new password for your Toy App account.
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="bg-[#202020] border border-white/20 text-white p-3.5 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-white shrink-0" />
                  <span>Update Failed</span>
                </div>
                <p className="text-[11px] text-zinc-300 pl-6 leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full h-11 bg-[#181818] border border-[#2a2a2a] hover:border-[#383838] focus:border-white text-white text-xs pl-10 pr-10 rounded-md outline-none transition-colors placeholder:text-zinc-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full h-11 bg-[#181818] border border-[#2a2a2a] hover:border-[#383838] focus:border-white text-white text-xs pl-10 pr-10 rounded-md outline-none transition-colors placeholder:text-zinc-600 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-md tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <span>Save New Password</span>
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
