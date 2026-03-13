import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mic, ChartBar, FileText, BrainCircuit } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="w-full relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(78,255,163,0.08)_0%,transparent_70%)] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(123,97,255,0.1)_0%,transparent_70%)] animate-[float_8s_ease-in-out_infinite_reverse_left_4s]" />
      </div>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center text-center px-6 py-20 relative">
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full py-1.5 px-4 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-medium text-accent">AI-Powered Interview Prep</span>
        </div>

        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 max-w-4xl leading-[1.1]">
          Master your next <br />
          <span className="bg-gradient-to-br from-accent to-[var(--accent-2)] bg-clip-text text-transparent">
            tech interview
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mb-12">
          Practice with a realistic AI interviewer tailored to your exact job description and resume.
          Get instant, actionable feedback to land your dream role.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/upload">
            <Button size="lg" className="h-14 px-8 rounded-xl font-heading font-bold bg-accent text-black hover:bg-accent/90 hover:-translate-y-1 transition-all hover:shadow-[0_16px_40px_rgba(78,255,163,0.35)] gap-2 text-base">
              Start Practice Session <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl font-heading font-semibold border-border bg-transparent hover:bg-secondary/50 transition-all text-base">
              View Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-12 mt-20 flex-wrap justify-center">
          <div className="text-center">
            <div className="font-heading text-3xl md:text-4xl font-extrabold text-foreground leading-none">
              95<span className="text-accent">%</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="font-heading text-3xl md:text-4xl font-extrabold text-foreground leading-none">
              10<span className="text-accent-2">k+</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">Interviews Conducted</div>
          </div>
          <div className="text-center">
            <div className="font-heading text-3xl md:text-4xl font-extrabold text-foreground leading-none">
              24<span className="text-accent-4">/7</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">Availability</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-accent font-bold tracking-[3px] uppercase text-xs mb-4">Features</div>
          <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Everything you need to succeed.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-3xl p-8 hover:-translate-y-1 hover:border-accent/30 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-2)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-2)]/10 text-[var(--accent-2)] flex items-center justify-center mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold mb-3">Resume Analysis</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Upload your resume and a job description. Our AI aligns its questions specifically with the core competencies required.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 hover:-translate-y-1 hover:border-accent/30 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-6">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold mb-3">Voice Interviews</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Practice in a real conversational format. Engage with our low-latency AI interviewer just like you would on a Zoom call.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 hover:-translate-y-1 hover:border-accent-4/30 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-4)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-4)]/10 text-[var(--accent-4)] flex items-center justify-center mb-6">
              <ChartBar className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold mb-3">Actionable Feedback</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Receive detailed scorecards on confidence, clarity, and relevance. Review transcripts with AI-suggested ideal answers.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
