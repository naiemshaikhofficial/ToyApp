'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid work email address.')
      return
    }

    if (!password) {
      setErrorMsg('Please enter your password.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
          throw new Error('Incorrect email or password. Please verify your credentials.')
        } else if (msg.includes('email not confirmed')) {
          throw new Error('Please confirm your email address before signing in.')
        }
        throw new Error(error.message)
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      console.error('Login error:', err)
      setErrorMsg(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-4 py-10 font-sans selection:bg-white selection:text-black">
      {/* Dark Auth Card Container (#161616 background, border #262626, rounded-2xl) */}
      <div className="w-full max-w-[440px] bg-[#161616] border border-[#262626] rounded-2xl p-7 sm:p-10 shadow-2xl space-y-6 relative">
        {/* Brand Mascot + 3D Logo Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#2e2e2e] bg-[#181818] shadow-md p-1">
            <Image
              src="/Manager Bear Dashboard Mascot.png"
              alt="Toy App Mascot"
              width={64}
              height={64}
              className="object-cover w-full h-full"
              priority
            />
          </div>

          <div className="relative h-7 w-36">
            <Image
              src="/Producer Toy Charcoal 3D Logo.webp"
              alt="ProducerToy"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight uppercase">
              TOY APP
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              ProducerToy Operations &amp; Platform Portal
            </p>
          </div>
        </div>

        {/* Error Notification Banner (Pure Monochrome) */}
        {errorMsg && (
          <div className="bg-[#202020] border border-white/20 text-white p-3.5 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
              <span>Authentication Error</span>
            </div>
            <p className="text-[11px] text-zinc-300 pl-6 leading-relaxed">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Work Email Address
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

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 bg-[#181818] border border-[#2a2a2a] hover:border-[#383838] focus:border-white text-white text-xs pl-10 pr-10 rounded-md outline-none transition-colors placeholder:text-zinc-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-500 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Submit Button (Pure Monochrome) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black font-extrabold text-xs rounded-md tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Toy App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="pt-4 border-t border-[#262626] flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Authorized Staff Only</span>
          </div>
          <span className="text-[10px] uppercase">app.producertoy.com</span>
        </div>
      </div>
    </div>
  )
}
