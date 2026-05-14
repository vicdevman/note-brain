import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cloud,
  Command,
  FileText,
  Globe2,
  LockKeyhole,
  Search,
  Sparkles,
  Wifi,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: <Wifi className="h-4 w-4" />,
    title: "Local-first writing",
    body: "Draft, edit, and reopen notes instantly, even when the network drops.",
  },
  {
    icon: <Bot className="h-4 w-4" />,
    title: "AI beside the page",
    body: "Brainstorm with the note without leaving the editor or covering the canvas.",
  },
  {
    icon: <Search className="h-4 w-4" />,
    title: "Global command search",
    body: "Jump to notes, profile, and key actions from one fast command surface.",
  },
  {
    icon: <Globe2 className="h-4 w-4" />,
    title: "Share with control",
    body: "Create public links with view or edit permissions when collaboration needs to move.",
  },
];

const workflow = [
  "Capture messy thinking",
  "Shape it with blocks",
  "Ask AI for angles",
  "Share only what is ready",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#161715] text-[#f7f2e8]" >
      <section className="relative min-h-[96svh] overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(216,122,91,0.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(91,149,216,0.16),transparent_24%),linear-gradient(180deg,#1f211e_0%,#171816_56%,#121311_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent,#121311)]" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/brane-brand-kit/new-logo-primary.png" alt="Brane" width={34} height={34} className="w-7" priority />
            <span className="text-2xl font-semibold tracking-tight">Brane</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[#d8d0c1] md:flex" style={{ fontFamily: "Inter, var(--nb-font-sidebar), sans-serif" }}>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#workflow" className="hover:text-white">Workflow</a>
            <a href="#security" className="hover:text-white">Sync</a>
          </nav>
          <div className="flex items-center gap-2" style={{ fontFamily: "Inter, var(--nb-font-sidebar), sans-serif" }}>
            <Link href="/login" className="hidden h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-[#e7dfd0] hover:bg-white/8 sm:inline-flex">
              Sign in
            </Link>
            <Link href="/signup" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#d87a5b] px-4 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(216,122,91,0.22)]">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(96svh-4.5rem)] max-w-7xl flex-col justify-between px-4 pb-6 pt-10 sm:px-6 lg:px-8 lg:pt-14">
          <div className="max-w-4xl">
            <h1 className="max-w-4xl text-5xl font-medium tracking-normal text-[#fff7ea] sm:text-6xl lg:text-7xl">
              The <span className="italic">thinking</span> workspace that stays fast when your brain does.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#d8d0c1] sm:text-lg" style={{ fontFamily: "Inter, var(--nb-font-sidebar), sans-serif" }}>
              Brane is a local-first note app for people who move between rough ideas, searchable knowledge, and shareable work without wanting the tool to get loud.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row" style={{ fontFamily: "Inter, var(--nb-font-sidebar), sans-serif" }}>
              <Link href="/signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#d87a5b] px-5 text-sm font-semibold text-black">
                Create workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/14 bg-white/6 px-5 text-sm font-semibold text-[#f7f2e8] backdrop-blur hover:bg-white/10">
                Open Brane
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_21rem] lg:items-end" style={{ fontFamily: "Inter, var(--nb-font-sidebar), sans-serif" }}>
            <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#20211f]/88 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#d87a5b]" />
                  <span className="h-3 w-3 rounded-full bg-[#b7c88b]" />
                  <span className="h-3 w-3 rounded-full bg-[#6fa4d8]" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-[#d8d0c1]">
                  <Cloud className="h-3.5 w-3.5 text-[#b7c88b]" />
                  Synced
                </div>
              </div>
              <div className="grid min-h-[24rem] md:grid-cols-[15rem_1fr]">
                <aside className="hidden border-r border-white/10 bg-black/14 p-4 md:block">
                  <button className="mb-4 flex h-10 w-full items-center gap-2 rounded-md bg-[#d87a5b] px-3 text-sm font-semibold text-black">
                    <FileText className="h-4 w-4" />
                    New note
                  </button>
                  {["Launch plan", "Reading notes", "Customer calls", "AI brainstorm"].map((item, index) => (
                    <div key={item} className={`mb-2 rounded-md px-3 py-2 text-sm ${index === 0 ? "bg-white/10 text-white" : "text-[#bdb4a4]"}`}>
                      {item}
                    </div>
                  ))}
                </aside>
                <div className="p-5 sm:p-7">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/16 px-3 py-1.5 text-xs text-[#d8d0c1]">
                      <Command className="h-3.5 w-3.5" />
                      Search anywhere
                    </div>
                    <div className="flex gap-2">
                      <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs text-[#d8d0c1]">
                        <Bot className="h-3.5 w-3.5 text-[#d87a5b]" />
                        AI
                      </span>
                      <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs text-[#d8d0c1]">
                        <Globe2 className="h-3.5 w-3.5 text-[#6fa4d8]" />
                        Share
                      </span>
                    </div>
                  </div>
                  <div className="max-w-2xl">
                    <div className="mb-4 h-9 w-4/5 rounded-md bg-[#efe6d4]" />
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-white/16" />
                      <div className="h-3 w-11/12 rounded bg-white/16" />
                      <div className="h-3 w-3/5 rounded bg-white/16" />
                    </div>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-black/14 p-4">
                        <Zap className="mb-3 h-5 w-5 text-[#b7c88b]" />
                        <div className="text-sm font-semibold">Instant local save</div>
                        <div className="mt-1 text-xs leading-5 text-[#bdb4a4]">Write now. Sync later.</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/14 p-4">
                        <Search className="mb-3 h-5 w-5 text-[#6fa4d8]" />
                        <div className="text-sm font-semibold">Notes stay findable</div>
                        <div className="mt-1 text-xs leading-5 text-[#bdb4a4]">Search notes and actions together.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/12 bg-[#efe6d4] p-5 text-[#1c1d1a] shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div className="text-sm font-semibold">Daily signal</div>
                <CheckCircle2 className="h-5 w-5 text-[#4f7c4d]" />
              </div>
              <div className="text-4xl font-semibold tracking-normal">83%</div>
              <p className="mt-2 text-sm leading-6 text-[#555047]">
                Less context switching when notes, search, AI, and sharing live in the same writing surface.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b relative border-white/10 bg-[#f2eadc] px-4 py-16 text-[#171816] sm:px-6 lg:px-8" >
        <div className="grid lg:grid-cols-2 mx-auto max-w-7xl">
          <div className="max-w-2xl lg:sticky top-50">
            <p className="text-sm font-semibold text-[#a95f48]">Built for steady work</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">A notes app that behaves like infrastructure.</h2>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-1" style={{ fontFamily: "Inter, var(--nb-font-sidebar), sans-serif" }}>
            {features.map((feature) => (
              <article key={feature.title} className="rounded-xl border border-[#bdb3a4] bg-[#efe6d4] p-5">
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#171816] text-[#f2eadc]">{feature.icon}</div>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5d574e]">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="border-b border-white/10 bg-[#171816] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-[#d87a5b]">One workspace</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">From loose capture to shared clarity.</h2>
            <p className="mt-4 text-sm leading-7 text-[#c9c0b1]" style={{ fontFamily: "Inter, var(--nb-font-sidebar), sans-serif" }}>
              Brane keeps the important controls close, but never louder than the note itself. Search, AI, sync, and share are available when the work asks for them.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2" style={{ fontFamily: "Inter, var(--nb-font-sidebar), sans-serif" }}>
            {workflow.map((step, index) => (
              <div key={step} className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
                <div className="mb-8 text-3xl text-[#d87a5b]">0{index + 1}</div>
                <div className="text-sm font-semibold">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="bg-[#d8d0c1] px-4 py-16 text-[#171816] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-2xl border border-[#bdb3a4] bg-[#efe6d4] p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-normal">Start writing before the network catches up.</h2>
            <p className="mt-3 text-sm leading-7 text-[#5d574e]" style={{ fontFamily: "Inter, var(--nb-font-sidebar), sans-serif" }}> 
              Local persistence, visible sync state, and queued updates keep the app useful in the messy parts of real work.
            </p>
          </div>
          <Link href="/signup" style={{ fontFamily: "Inter, var(--nb-font-sidebar), sans-serif" }} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-[#171816] px-5 text-sm font-semibold text-[#f2eadc]">
            Try Brane
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
