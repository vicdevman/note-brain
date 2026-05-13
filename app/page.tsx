import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[var(--nb-note-bg)]">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-[var(--nb-border)] mb-6">
            Welcome to Brane
          </h1>
          <p className="text-xl text-[var(--nb-text-muted)] mb-8">
            Your intelligent note-taking companion. Organize thoughts, capture ideas, and boost productivity.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-[var(--nb-primary)] text-black px-6 py-3 text-base font-medium hover:bg-[var(--nb-primary)]/90 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup"
              className="inline-flex items-center justify-center rounded-md border border-[var(--nb-border-strong)] bg-[var(--nb-surface-muted)] text-[var(--nb-border)] px-6 py-3 text-base font-medium hover:bg-[var(--nb-surface)]/50 transition-colors"
            >
              Create Account
            </Link>
          </div>
          
          <div className="mt-12 text-[var(--nb-text-muted)]">
            <p className="text-sm">
              Experience the future of note-taking with Brane's powerful features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
