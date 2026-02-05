'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileStack, ArrowRightLeft, ShieldCheck, Zap, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Uploader from '@/components/Uploader';
import { AnalysisReport } from '@/types';

export default function Compare() {
    const [reports, setReports] = useState<[AnalysisReport | null, AnalysisReport | null]>([null, null]);

    const setReport = (index: number, report: AnalysisReport) => {
        const newReports = [...reports] as [AnalysisReport | null, AnalysisReport | null];
        newReports[index] = report;
        setReports(newReports);
    };

    return (
        <main className="min-h-screen pb-32">
            <Navbar />

            <div className="container-fixed pt-40 space-y-16">
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                        <ArrowRightLeft className="w-3 h-3" />
                        Regression Analysis
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground uppercase leading-none">Compare <span className="premium-gradient">Builds.</span></h1>
                    <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto opacity-80">
                        Upload two versions of your extension to perform a differential security audit and track performance regressions.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-14 h-14 rounded-xl glass-card border border-primary/10 text-primary shadow-xl premium-blur">
                        <ArrowRightLeft className="w-6 h-6" />
                    </div>

                    {[0, 1].map((index) => (
                        <div key={index} className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-primary'}`} />
                                    Build {index === 0 ? 'A (Base)' : 'B (Modified)'}
                                </h3>
                                {reports[index] && (
                                    <button onClick={() => {
                                        const newReports = [...reports] as [AnalysisReport | null, AnalysisReport | null];
                                        newReports[index] = null;
                                        setReports(newReports);
                                    }} className="text-[9px] font-bold uppercase text-destructive hover:opacity-70 transition-all flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/5 border border-destructive/10">
                                        <X className="w-2.5 h-2.5" /> Remove
                                    </button>
                                )}
                            </div>

                            {!reports[index] ? (
                                <div className="p-1.5 rounded-[32px] border border-dashed border-border/40 bg-muted/20">
                                    <Uploader onReport={(r) => setReport(index, r)} />
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-card rounded-[32px] p-8 md:p-10 space-y-10 border border-border/40 shadow-xl premium-blur"
                                >
                                    <div className="space-y-3">
                                        <h2 className="text-2xl font-bold tracking-tight text-foreground uppercase">{reports[index].extensionName}</h2>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-0.5 rounded-md bg-muted border border-border/30 text-[9px] font-mono font-bold text-primary uppercase">v{reports[index].version}</span>
                                            <span className="px-2 py-0.5 rounded-md bg-muted border border-border/30 text-[9px] font-mono font-bold text-muted-foreground uppercase">{reports[index].type}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <MiniStat
                                            label="Risk"
                                            value={reports[index].readiness.chrome.riskScore}
                                            trend={reports[index === 1 ? 0 : 1] ? reports[index].readiness.chrome.riskScore - (reports[index === 1 ? 0 : 1]?.readiness.chrome.riskScore || 0) : 0}
                                            inverse
                                        />
                                        <MiniStat label="Latency" value={`${reports[index].performance.loadTime}ms`} />
                                        <MiniStat label="Tests" value={reports[index].results.filter(r => r.status === 'passed').length} suffix="Pass" />
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Key Findings</h4>
                                        <div className="space-y-2">
                                            {reports[index].results.filter(r => r.status !== 'passed').slice(0, 3).map((res, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/40">
                                                    <div className="flex items-center gap-3">
                                                        {res.status === 'error' ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <AlertTriangle className="w-4 h-4 text-warning" />}
                                                        <span className="text-sm font-bold text-foreground truncate max-w-[150px]">{res.name}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-foreground/5 text-muted-foreground">{res.severity}</span>
                                                </div>
                                            ))}
                                            {reports[index].results.filter(r => r.status !== 'passed').length === 0 && (
                                                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-success/5 border border-success/10 text-success font-bold text-xs">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    No security issues detected.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>

                {reports[0] && reports[1] && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-[48px] p-12 md:p-16 text-center space-y-12 border border-primary/20 shadow-2xl premium-blur relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent" />

                        <div className="space-y-4 relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground uppercase">Delta Intelligence</h2>
                            <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto opacity-80">
                                Total security delta: <span className="text-foreground font-bold">{Math.abs(reports[1].readiness.chrome.riskScore - reports[0].readiness.chrome.riskScore)} points</span>
                            </p>
                        </div>

                        <div className="flex justify-center gap-16 md:gap-24 flex-wrap relative z-10">
                            <ComparisonMetric
                                label="Risk Stance"
                                valA={reports[0].readiness.chrome.riskScore}
                                valB={reports[1].readiness.chrome.riskScore}
                                inverse
                            />
                            <ComparisonMetric
                                label="Latency impact"
                                valA={reports[0].performance.loadTime}
                                valB={reports[1].performance.loadTime}
                                inverse
                                unit="ms"
                            />
                        </div>

                        <button className="relative z-10 h-14 px-10 rounded-xl bg-foreground text-background font-bold uppercase tracking-widest text-[11px] hover:opacity-90 active:scale-[0.98] transition-all shadow-xl">
                            Export Comprehensive Diff
                        </button>
                    </motion.div>
                )}
            </div>
        </main>
    );
}

function MiniStat({ label, value, trend, inverse, suffix }: { label: string, value: string | number, trend?: number, inverse?: boolean, suffix?: string }) {
    const isBetter = trend !== undefined && (inverse ? trend < 0 : trend > 0);
    return (
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 text-center space-y-1">
            <div className="text-xl font-bold text-foreground tracking-tight">{value} {suffix && <span className="text-[9px] uppercase opacity-40 ml-0.5">{suffix}</span>}</div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
            {trend !== 0 && trend !== undefined && (
                <div className={`text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block mt-0.5 ${isBetter ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {trend > 0 ? '+' : ''}{trend}
                </div>
            )}
        </div>
    );
}

function ComparisonMetric({ label, valA, valB, inverse, unit = '' }: { label: string, valA: number, valB: number, inverse?: boolean, unit?: string }) {
    const diff = valB - valA;
    const isBetter = inverse ? diff < 0 : diff > 0;

    return (
        <div className="space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">{label}</div>
            <div className="flex items-center gap-6 md:gap-10">
                <div className="text-3xl font-bold opacity-10 text-foreground tracking-tighter">{valA}{unit}</div>
                <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary">
                    <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div className={`text-6xl md:text-8xl font-bold tracking-tighter ${diff === 0 ? 'text-foreground' : (isBetter ? 'text-success' : 'text-destructive')}`}>
                    {valB}{unit}
                </div>
            </div>
        </div>
    );
}
