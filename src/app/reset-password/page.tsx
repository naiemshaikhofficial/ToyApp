'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogoIcon } from '@/components/Logo'
import { ButtonSpinner } from '@/components/ui/ButtonSpinner'
import { TurnstileWidget } from '@/components/TurnstileWidget'
import { validateTurnstileAction } from '@/actions/authActions'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

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

    if (!turnstileToken) {
      setErrorMsg('Security verification required. Please complete Cloudflare Turnstile before saving.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const turnstileCheck = await validateTurnstileAction(turnstileToken)
      if (!turnstileCheck.success) {
        setTurnstileToken(null)
        throw new Error(turnstileCheck.error || 'Security verification failed. Please try again.')
      }

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
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-4 py-8 sm:py-14 font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-[460px] bg-[#161616] border border-[#262626] rounded-2xl p-7 sm:p-10 shadow-2xl space-y-6 relative transition-all">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center space-y-6 py-2 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-[#202020] border border-[#2e2e2e] flex items-center justify-center relative">
              <CheckCircle2 className="w-8 h-8 text-white font-bold" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Password updated
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                Your staff credentials have been updated successfully. You can now sign in with your new password.
              </p>
            </div>

            <div className="w-full space-y-3 pt-2">
              <Link
                href="/login"
                className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-full tracking-wider uppercase transition-all flex items-center justify-center shadow-lg"
              >
                Proceed to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center space-y-3">
              <Link href="/" prefetch={true} className="hover:opacity-85 transition-opacity">
                <LogoIcon size={52} />
              </Link>

              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Set new password
              </h1>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Choose a strong new password for your Toy App account.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-white text-black font-extrabold p-3.5 rounded-2xl text-xs text-center space-y-2 shadow-lg animate-in fade-in">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-black flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-zinc-300">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    style={{ paddingLeft: '14px', paddingRight: '44px' }}
                    className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md outline-none transition-colors placeholder:text-zinc-500 shadow-sm touch-manipulation select-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                    }}
                    className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer touch-manipulation"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-zinc-300">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] px-3.5 rounded-md outline-none transition-colors placeholder:text-zinc-500 shadow-sm touch-manipulation select-text"
                />
              </div>

              {/* Cloudflare Turnstile */}
              <TurnstileWidget
                onSuccess={(token) => {
                  setTurnstileToken(token)
                  setErrorMsg('')
                }}
                onExpire={() => setTurnstileToken(null)}
              />

              <button
                type="submit"
                disabled={loading || !turnstileToken}
                className="w-full py-3.5 bg-white hover:bg-zinc-200 active:bg-zinc-300 active:scale-[0.99] text-black font-extrabold text-xs rounded-full tracking-wider uppercase transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
              >
                {loading ? (
                  <ButtonSpinner size={16} variant="dark" />
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
