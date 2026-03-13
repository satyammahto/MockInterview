import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mic, ChartBar, FileText, BrainCircuit, Activity, Code2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="w-full relative overflow-hidden bg-background">
      {/* Dark Futuristic Background */}
      <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
        {/* Core deep dark gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-[#060810] to-[#020305]" />

        {/* Neon Glow Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] bg-[radial-gradient(circle,rgba(78,255,163,0.12)_0%,transparent_70%)] animate-[float_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full blur-[150px] bg-[radial-gradient(circle,rgba(123,97,255,0.15)_0%,transparent_70%)] animate-[float_12s_ease-in-out_infinite_reverse]" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0zOSAzOUgxVjFoMzh2MzhoLTF6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent_80%)] opacity-30" />
      </div>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center text-center px-6 py-20 relative pt-32 shrink-0">

        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-2/10 to-accent-2/5 border border-accent-2/20 rounded-full py-1.5 px-5 mb-10 shadow-[0_0_20px_rgba(123,97,255,0.15)] backdrop-blur-md">
          <BrainCircuit className="w-4 h-4 text-accent-2 animate-pulse" />
          <span className="text-sm font-semibold text-accent-2 tracking-wide uppercase">Next-Gen AI Interviewer v2.0</span>
        </div>

        <h1 className="font-heading text-6xl md:text-7xl lg:text-9xl font-extrabold tracking-tighter mb-8 max-w-5xl leading-[1.05]">
          Master your next <br />
          <span className="bg-gradient-to-br from-accent via-white to-accent-2 bg-clip-text text-transparent drop-shadow-sm">
            tech interview
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mb-14 leading-relaxed">
          Upload your resume and the target job description. Our advanced AI conducts a highly realistic, technical voice interview tailored precisely to the role you want.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link href="/upload">
            {/* Primary CTA: Start Free Mock Interview */}
            <Button size="lg" className="h-16 px-10 rounded-2xl font-heading font-extrabold bg-accent text-black hover:bg-accent/90 hover:-translate-y-1 transition-all hover:shadow-[0_0_40px_rgba(78,255,163,0.4)] gap-3 text-lg border border-accent/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              Start Free Mock Interview <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/architecture">
            {/* Secondary CTA: View Architecture */}
            <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl font-heading font-bold border-border/50 bg-surface/30 backdrop-blur-sm hover:bg-surface hover:border-accent-2/50 transition-all text-lg hover:shadow-[0_0_30px_rgba(123,97,255,0.15)] hover:text-accent-2">
              <Code2 className="w-5 h-5 mr-3" /> View Architecture
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mt-32 max-w-5xl mx-auto items-center p-8 rounded-3xl bg-surface/20 border border-border/30 backdrop-blur-xl shrink-0">
          <div className="flex flex-col items-center justify-center relative">
            <div className="absolute -inset-4 bg-accent/5 blur-xl rounded-full" />
            <div className="font-heading text-4xl md:text-5xl font-black text-foreground leading-none mb-2">
              95<span className="text-accent">%</span>
            </div>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Placement Rate</div>
          </div>

          <div className="flex flex-col items-center justify-center relative">
            <div className="absolute -inset-4 bg-accent-2/5 blur-xl rounded-full" />
            <div className="font-heading text-4xl md:text-5xl font-black text-foreground leading-none mb-2">
              50<span className="text-accent-2">k+</span>
            </div>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Interviews Done</div>
          </div>

          <div className="flex flex-col items-center justify-center relative">
            <div className="absolute -inset-4 bg-accent-4/5 blur-xl rounded-full" />
            <div className="font-heading text-4xl md:text-5xl font-black text-foreground leading-none mb-2">
              500<span className="text-accent-4">+</span>
            </div>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Companies Covered</div>
          </div>

          <div className="flex flex-col items-center justify-center relative">
            <div className="absolute -inset-4 bg-accent-3/5 blur-xl rounded-full" />
            <div className="font-heading text-4xl md:text-5xl font-black text-foreground leading-none mb-2">
              &lt;2<span className="text-accent-3">s</span>
            </div>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Voice Latency</div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-32 px-6 md:px-12 max-w-7xl mx-auto relative shrinks-0">

        <div className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[100px] bg-accent-2/20 blur-[100px] pointer-events-none" />
          <div className="text-accent-2 font-black tracking-[4px] uppercase text-sm mb-4">Platform Capabilities</div>
          <h2 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Engineered to simulate the toughest tech interviews.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Feature 1 */}
          <div className="bg-surface/40 backdrop-blur-xl border border-border/50 rounded-[32px] p-10 hover:-translate-y-2 hover:border-accent/40 transition-all duration-300 group relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />

            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-8 shadow-inner shadow-accent/20 relative z-10">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-2xl font-bold mb-4 relative z-10">Context-Aware AI</h3>
            <p className="text-muted-foreground text-base leading-relaxed relative z-10">
              Provide your resume and a target job description. The model synthesizes the requirements and grills you exactly like a hiring manager would.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-surface/40 backdrop-blur-xl border border-border/50 rounded-[32px] p-10 hover:-translate-y-2 hover:border-accent-2/40 transition-all duration-300 group relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-2/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-2/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />

            <div className="w-16 h-16 rounded-2xl bg-accent-2/10 border border-accent-2/20 text-accent-2 flex items-center justify-center mb-8 shadow-inner shadow-accent-2/20 relative z-10">
              <Mic className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-2xl font-bold mb-4 relative z-10">Real-Time Voice</h3>
            <p className="text-muted-foreground text-base leading-relaxed relative z-10">
              Engage via voice. No typing required. Low-latency speech-to-text ensures the conversation flows naturally without awkward silences.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-surface/40 backdrop-blur-xl border border-border/50 rounded-[32px] p-10 hover:-translate-y-2 hover:border-accent-4/40 transition-all duration-300 group relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-4/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-4/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />

            <div className="w-16 h-16 rounded-2xl bg-accent-4/10 border border-accent-4/20 text-accent-4 flex items-center justify-center mb-8 shadow-inner shadow-accent-4/20 relative z-10">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-2xl font-bold mb-4 relative z-10">Deep Analytics</h3>
            <p className="text-muted-foreground text-base leading-relaxed relative z-10">
              After the interview, receive a highly detailed dashboard with scores on clarity, relevance, confidence, and filler word detection.
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}
