'use client';

import { useState } from 'react';
import { ArrowRight, ShieldCheck, Zap, Globe, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Uploader from '@/components/Uploader';
import Report from '@/components/Report';
import { AnalysisReport } from '@/types';

export default function SubmitExtension() {
    const [step, setStep] = useState<'upload' | 'details' | 'success'>('upload');
    const [report, setReport] = useState<AnalysisReport | null>(null);
    const [form, setForm] = useState({
        category: 'Productivity',
        github: '',
        description: '',
        consent: false
    });

    const onReport = (newReport: AnalysisReport) => {
        setReport(newReport);
        setStep('details');
    };

    const handlePublish = () => {
        setStep('success');
    };

    return (
        <main className="min-h-screen pb-32">
            <Navbar />

            <div className="container-fixed pt-40">
                {/* Progress Stepper */}
                <div className="flex items-center justify-center gap-3 md:gap-6 mb-16">
                    <StepItem num={1} label="Audit" active={step === 'upload'} done={step !== 'upload'} />
                    <div className={`h-1 flex-1 max-w-[80px] rounded-full transition-all duration-700 ${step !== 'upload' ? 'bg-primary' : 'bg-border/20'}`} />
                    <StepItem num={2} label="Metadata" active={step === 'details'} done={step === 'success'} />
                    <div className={`h-1 flex-1 max-w-[80px] rounded-full transition-all duration-700 ${step === 'success' ? 'bg-primary' : 'bg-border/20'}`} />
                    <StepItem num={3} label="Verified" active={step === 'success'} done={false} />
                </div>

                <AnimatePresence mode="wait">
                    {step === 'upload' && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-4xl mx-auto space-y-16 flex flex-col items-center text-center"
                        >
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                                    <Sparkles className="w-3 h-3" />
                                    Launch Pad
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground uppercase leading-none">
                                    Publish Your<br />
                                    <span className="premium-gradient">Build.</span>
                                </h1>
                                <p className="text-base md:text-lg text-muted-foreground mx-auto max-w-2xl leading-relaxed font-medium opacity-80">
                                    Join the industry's most trusted ecosystem. Every submission undergoes a mandatory
                                    Deep-Scan for enterprise-grade security vetting.
                                </p>
                            </div>

                            <div className="w-full">
                                <Uploader onReport={onReport} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                <SmallFeature
                                    icon={<ShieldCheck className="w-5 h-5" />}
                                    title="Mandatory Audit"
                                    desc="Heuristic blocking of advanced malware and obfuscation."
                                />
                                <SmallFeature
                                    icon={<Zap className="w-5 h-5" />}
                                    title="Verified Hosting"
                                    desc="Professional landing pages for your extension binaries."
                                />
                                <SmallFeature
                                    icon={<Globe className="w-5 h-5" />}
                                    title="Store Readiness"
                                    desc="Compliance checks for Chrome, Firefox, and Edge."
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 'details' && report && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12"
                        >
                            <div className="lg:col-span-12 space-y-8 mb-4">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase text-foreground">Registry Entry</h2>
                                        <p className="text-lg text-muted-foreground font-medium opacity-70 italic">Finalize the listing metadata for your verified hub profile.</p>
                                    </div>
                                    <div className="h-px flex-1 bg-border/20 hidden md:block mb-4" />
                                </div>
                            </div>

                            <div className="lg:col-span-7 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3 text-left">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Market Category</label>
                                        <select
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            className="w-full bg-muted/40 border border-border/40 rounded-xl px-5 py-4 outline-none focus:border-primary/40 transition-all font-bold text-foreground uppercase tracking-widest text-[11px]"
                                        >
                                            <option>Productivity</option>
                                            <option>Security</option>
                                            <option>Developer Tools</option>
                                            <option>Themes</option>
                                            <option>Games</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3 text-left">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">GitHub Repository</label>
                                        <input
                                            type="text"
                                            placeholder="https://github.com/..."
                                            className="w-full bg-muted/40 border border-border/40 rounded-xl px-5 py-4 outline-none focus:border-primary/40 transition-all font-medium text-foreground text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 text-left">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Public Declaration</label>
                                    <textarea
                                        rows={6}
                                        placeholder="Clear, impact-driven overview for the community..."
                                        className="w-full bg-muted/40 border border-border/40 rounded-2xl px-6 py-5 outline-none focus:border-primary/40 transition-all font-medium resize-none text-foreground text-sm leading-relaxed"
                                    />
                                </div>

                                <div className="p-8 rounded-[32px] glass-card space-y-8 border border-border/40 premium-blur shadow-xl shadow-black/5">
                                    <div className="flex gap-4 items-start">
                                        <div className="relative flex items-center mt-1">
                                            <input
                                                type="checkbox"
                                                id="consent"
                                                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                                                className="peer appearance-none w-5 h-5 rounded-md border border-border/40 bg-muted/40 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                            />
                                            <CheckCircle2 className="w-3.5 h-3.5 text-white absolute left-[3px] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                                        </div>
                                        <label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed font-semibold cursor-pointer select-none">
                                            I verify this release is untampered, contains no backdoors, and adheres to
                                            the <span className="text-primary font-bold hover:underline ml-1">ExtGuard Protocol v3.0</span>.
                                        </label>
                                    </div>
                                    <button
                                        disabled={!form.consent || report.readiness.chrome.status === 'error'}
                                        onClick={handlePublish}
                                        className="w-full py-5 rounded-xl bg-foreground text-background font-bold uppercase tracking-widest text-[11px] hover:opacity-90 active:scale-[0.99] transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        Submit to Registry
                                        <Sparkles className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="lg:col-span-5">
                                <div className="sticky top-32 space-y-6">
                                    <div className="flex items-center gap-3 ml-2">
                                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Certified Pre-Audit Findings</h3>
                                    </div>
                                    <div className="scale-[0.85] origin-top border border-border/40 rounded-[32px] overflow-hidden shadow-2xl bg-background/50 backdrop-blur-sm">
                                        <div className="p-2 opacity-80 pointer-events-none">
                                            <Report report={report} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-3xl mx-auto text-center space-y-12 py-16"
                        >
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 bg-success/20 blur-2xl animate-pulse" />
                                <div className="relative w-24 h-24 rounded-3xl bg-success/10 border border-success/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-12 h-12 text-success" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground uppercase leading-none">
                                    Package<br />
                                    <span className="text-success">Verified.</span>
                                </h2>
                                <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-xl mx-auto opacity-80">
                                    Your build <span className="text-foreground font-bold">"{report?.extensionName}"</span> has passed initial heuristics and entered the human-verification tier.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                <button className="h-14 px-8 rounded-xl border border-border/40 font-bold text-[11px] tracking-widest uppercase hover:bg-muted/50 transition-all flex items-center gap-2 justify-center">
                                    Review Receipt
                                </button>
                                <button
                                    onClick={() => window.location.href = '/hub'}
                                    className="h-14 px-8 rounded-xl bg-foreground text-background font-bold text-[11px] tracking-widest uppercase hover:opacity-90 transition-all shadow-xl active:scale-95"
                                >
                                    Return to Hub
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

function StepItem({ num, label, active, done }: { num: number, label: string, active: boolean, done: boolean }) {
    return (
        <div className={`flex items-center gap-3 transition-all ${active ? 'text-foreground' : (done ? 'text-primary' : 'text-muted-foreground/60')}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${active
                ? 'bg-foreground border-foreground text-background shadow-lg scale-105'
                : (done ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-muted/30 border-border/40')
                }`}>
                {done ? <CheckCircle2 className="w-5 h-5 font-bold" /> : <span className="font-bold text-base">{num}</span>}
            </div>
            <span className={`hidden md:inline font-bold uppercase tracking-widest text-[10px] ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
        </div>
    );
}

function SmallFeature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="glass-card p-8 text-center space-y-4 border border-border/40 rounded-[24px]">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                {icon}
            </div>
            <div className="space-y-2">
                <h4 className="font-bold text-lg text-foreground tracking-tight">{title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium opacity-70">{desc}</p>
            </div>
        </div>
    );
}
