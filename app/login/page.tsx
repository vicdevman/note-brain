import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-full h-vh bg-(--nb-bg-subtle)">
      {/* Header with Brand */}
      <div className="flex items-center pl-6 pt-6">
        <div className="flex items-center gap-3">
          <img
            src="/brane-brand-kit/new-logo-primary.png"
            alt="Brane"
            className="w-8"
          />
          <div className="text-xl font-medium text-[var(--nb-border)]">Brane</div>
        </div>
      </div>
      {/* Left Column - Branding */}
      {/* <div className="hidden lg:flex lg:w-1/2 bg-[var(--nb-sidebar-bg)] items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-8">
            <img
              src="/brane-brand-kit/new-logo-primary.png"
              alt="Brane"
              className="w-26"
            />
          </div>
          <h1 className="text-3xl font-bold text-[var(--nb-border)] mb-4">
            Welcome Back to Brane
          </h1>
          <p className="text-[var(--nb-text-muted)] text-lg">
            Sign in to access your notes and continue where you left off. Your thoughts are waiting for you.
          </p>
        </div>
      </div> */}

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
