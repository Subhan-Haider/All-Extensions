'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Uploader from '@/components/Uploader';
import Report from '@/components/Report';
import { AnalysisReport } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Search, Globe, ArrowRight, CheckCircle, Lock, Layout, Star } from 'lucide-react';

export default function Home() {
  const [report, setReport] = useState<AnalysisReport | null>(null);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Navbar />

      <div className="container-fixed pt-40 pb-32 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!report ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full flex flex-col items-center text-center space-y-12"
            >
              {/* Hero Header */}
              <div className="max-w-4xl space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  AI-Powered Security
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none text-foreground text-balance">
                  Trust Your<br />
                  <span className="premium-gradient">Extensions.</span>
                </h1>

                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed opacity-80">
                  The industry-standard AI auditor for browser extensions.
                  Identify hidden threats, malicious scripts, and compliance issues instantly.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <button className="h-14 px-8 rounded-xl bg-foreground text-background font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-xl active:scale-95 group">
                    Begin Analysis
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => window.location.href = '/hub'}
                    className="h-14 px-8 rounded-xl border border-border/40 bg-background/50 font-bold text-[11px] uppercase tracking-widest hover:bg-muted transition-all text-foreground premium-blur"
                  >
                    View Verified Hub
                  </button>
                </div>
              </div>

              {/* Uploader Component */}
              <div className="w-full max-w-4xl relative">
                <div className="absolute -inset-4 bg-primary/20 blur-3xl opacity-10 -z-10 animate-pulse" />
                <Uploader onReport={setReport} />
              </div>

              {/* Bento Features */}
              <div className="w-full space-y-12 pt-8">
                <div className="flex flex-col items-center space-y-3">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Security Done Right.</h2>
                  <p className="text-base text-muted-foreground max-w-xl opacity-70">Deep analysis tools built for modern extension audit teams.</p>
                </div>

                <div className="bento-grid gap-6">
                  <BentoCard
                    icon={<Lock className="w-6 h-6" />}
                    title="Bytecode Analysis"
                    desc="Decompile and analyze every line of JS to find obfuscated logic and sneaky backdoors."
                    delay={0.1}
                  />
                  <BentoCard
                    icon={<Search className="w-6 h-6" />}
                    title="Secret Detection"
                    desc="Automatically flag exposed API keys, private tokens, and sensitive credentials."
                    delay={0.2}
                  />
                  <BentoCard
                    icon={<Zap className="w-6 h-6" />}
                    title="Performance Audit"
                    desc="Measure memory leaks and CPU spikes to ensure lightning fast execution."
                    delay={0.3}
                  />
                  <BentoCard
                    icon={<Globe className="w-6 h-6" />}
                    title="Compliance Link"
                    desc="Verify if your extension meets the latest major browser store guidelines."
                    delay={0.4}
                  />
                </div>
              </div>

              {/* Social Proof Stats */}
              <div className="w-full flex flex-wrap justify-center gap-12 md:gap-24 py-12 border-y border-border/40">
                <BigStat val="24M+" label="Codes Scanned" />
                <BigStat val="850K" label="Threats Found" />
                <BigStat val="0.2s" label="Scan Speed" />
                <BigStat val="100%" label="Detection Rate" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="report"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-6xl space-y-10"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold tracking-tight">Analysis Report</h2>
                  <p className="text-base text-muted-foreground opacity-70">Package security verification and heuristic analysis.</p>
                </div>
                <button
                  onClick={() => setReport(null)}
                  className="h-12 px-6 rounded-xl border border-border/40 font-bold text-[10px] uppercase tracking-widest hover:bg-muted transition-all premium-blur shadow-sm"
                >
                  ← New Scan
                </button>
              </div>
              <Report report={report} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="w-full text-center py-12 border-t border-border/40">
        <div className="container-fixed flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold tracking-tighter uppercase text-sm">ExtGuard AI</span>
          </div>
          <p className="text-muted-foreground font-medium text-[11px] uppercase tracking-widest opacity-60">© 2026 Audit infrastructure. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function BentoCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="p-8 rounded-[32px] glass-card card-hover flex flex-col items-start text-left gap-5 group border border-border/40"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-sm opacity-80">{desc}</p>
      </div>
    </motion.div>
  );
}

function BigStat({ val, label }: { val: string, label: string }) {
  return (
    <div className="flex flex-col items-center text-center group cursor-default">
      <div className="text-4xl md:text-5xl font-bold tracking-tight text-foreground group-hover:scale-110 transition-transform">{val}</div>
      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">{label}</div>
    </div>
  );
}
