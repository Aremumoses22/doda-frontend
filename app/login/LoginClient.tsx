"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { Eye, EyeOff } from "lucide-react"

const loginSchema = z.object({
  email:    z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { login, user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) {
      const from = searchParams.get("from")
      if (user.role === "client") {
        router.replace(from?.startsWith("/dashboard") ? from : "/dashboard")
      } else {
        router.replace(from?.startsWith("/admin") ? from : "/admin")
      }
    }
  }, [user, router, searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { role } = await login(data.email, data.password)
      const from = searchParams.get("from")
      if (role === "client") {
        router.replace(from?.startsWith("/dashboard") ? from : "/dashboard")
      } else {
        router.replace(from?.startsWith("/admin") ? from : "/admin")
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Login failed. Please check your credentials."
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-doda-light flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-3xl font-bold text-doda-navy tracking-tight">
              DODA<span className="text-doda-gold">.</span>
            </span>
            <p className="text-xs text-doda-muted uppercase tracking-wider mt-1">
              Legal Practitioners
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-doda-navy mb-1">Welcome back</h1>
          <p className="text-sm text-doda-muted mb-6">Sign in to access your portal</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                placeholder="you@company.com"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-doda-muted">
              Don't have an account?{" "}
              <span className="text-gray-500">Clients are onboarded by the Doda team.</span>
            </p>
            <p className="text-xs text-doda-muted mt-2">
              <Link href="/contact" className="text-doda-gold hover:underline">
                Get in touch to start your engagement
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-doda-muted mt-6">
          <Link href="/" className="hover:text-doda-navy transition-colors">← Back to website</Link>
        </p>
      </div>
    </div>
  )
}
