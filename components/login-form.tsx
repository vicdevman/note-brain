"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Loader, Loader2, Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/app"
      })

      if (result?.error) {
        // Handle custom error messages
        switch (result.error) {
          case "NO_ACCOUNT":
            setError("No account found with this email address")
            break
          case "INVALID_PASSWORD":
            setError("Invalid email or password")
            break
          case "OAUTH_ACCOUNT":
            setError("This account uses Google sign-in. Please use Google to sign in.")
            break
          default:
            setError(result.error === "Configuration" 
              ? "Invalid email or password" 
              : result.error)
        }
      } else if (result?.ok) {
        // Successful login, redirect manually
        window.location.href = "/app"
      } else {
        setError("An unexpected error occurred during login")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setIsLoading(true)
    signIn("google", { callbackUrl: "/app" })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props} style={{ fontFamily: 'var(--font-sans)' }}>
      <form onSubmit={handleEmailLogin}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold text-[var(--nb-border)]">Welcome Back to Brane</h1>
            <FieldDescription className="">
              Don&apos;t have an account? <Link href="/signup" className="hover:text-[var(--nb-primary)] text-[var(--nb-text)] hover:underline">Sign up</Link>
            </FieldDescription>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="email" className="text-[var(--nb-border)]">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[var(--nb-sidebar-bg)] border-[var(--nb-border-strong)] text-[var(--nb-text)] placeholder:text-[var(--nb-text-muted)] focus:border-[var(--nb-primary)]"
                disabled={isLoading}
              />
            </Field>
            
            <Field>
              <FieldLabel htmlFor="password" className="text-[var(--nb-border)]">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[var(--nb-sidebar-bg)] border-[var(--nb-border-strong)] text-[var(--nb-text)] placeholder:text-[var(--nb-text-muted)] focus:border-[var(--nb-primary)] pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--nb-text-muted)] hover:text-[var(--nb-text)] transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>
            
            <Field>
              <Button 
                type="submit" 
                size="md"
                className="w-full bg-[var(--nb-text)] text-black hover:bg-[var(--nb-text)]/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </Field>
          </div>
          
          <FieldSeparator className="text-[var(--nb-text-muted)]">Or continue with</FieldSeparator>
          
          <Field>
            <Button 
              type="button"
              variant="outline"
              size="lg"
              className="w-full border-[var(--nb-border-strong)] text-[var(--nb-text)]"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                   <Image src='/google.png' alt="google" width={500} height={500} className="w-5 mr-2"/>
                  Connecting...
                </>
              ) : (
                <>
                   <Image src='/google.png' alt="google" width={500} height={500} className="w-5 mr-2"/>
                  Continue with Google
                </>
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      
      <FieldDescription className="px-6 text-center text-[var(--nb-text-muted)] text-sm">
        By signing in, you agree to our <a href="#" className="text-[var(--nb-primary)] hover:underline">Terms of Service</a>{" "}
        and <a href="#" className="text-[var(--nb-primary)] hover:underline">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
