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

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      // Create user account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      // Sign in user after successful signup
      const result = await signIn("credentials", {
        redirect: false,
        callbackUrl: "/app",
        email,
        password,
      })

      if (result?.error) {
        setError(result.error === "CredentialsSignin" 
          ? "Login failed after signup. Please try logging in manually." 
          : result.error)
        setIsLoading(false)
        return
      } else if (result?.ok) {
        // Successful login, redirect manually
        window.location.href = "/app"
        return
      } else {
        setError("Account created but login failed. Please try logging in manually.")
        setIsLoading(false)
        return
      }
      
      // If no error, login was successful
      setIsLoading(false)
    } catch (error) {
      console.error("Signup error:", error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    setIsLoading(true)
    signIn("google", { callbackUrl: "/app" })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props} style={{ fontFamily: 'var(--font-sans)' }}>
      <form onSubmit={handleEmailSignup}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold text-[var(--nb-border)]">Welcome to Brane</h1>
            <FieldDescription className="">
              Already have an account? <Link href="/login" className="hover:text-[var(--nb-primary)] text-[var(--nb-text)] hover:underline">Sign in</Link>
            </FieldDescription>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name" className="text-[var(--nb-border)]">Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[var(--nb-sidebar-bg)] border-[var(--nb-border-strong)] text-[var(--nb-text)] placeholder:text-[var(--nb-text-muted)] focus:border-[var(--nb-primary)]"
                disabled={isLoading}
              />
            </Field>
            
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
                  placeholder="Create a password"
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
                className="w-full bg-[var(--nb-text)] text-md text-black hover:bg-[var(--nb-text)]/80"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
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
              className="w-full border-[var(--nb-border-strong)] text-[var(--nb-text)] bg-transparent"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      
      <FieldDescription className="px-6 text-center text-[var(--nb-text-muted)] text-sm">
        By creating an account, you agree to our <a href="#" className="text-[var(--nb-primary)] hover:underline">Terms of Service</a>{" "}
        and <a href="#" className="text-[var(--nb-primary)] hover:underline">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
