'use client';

import { Shield, Lock, FileText, ChevronLeft, Globe, Scale, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LegalPage({ title, lastUpdated, children }: { title: string, lastUpdated: string, children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
            <main className="max-w-4xl mx-auto px-6 py-32">
                <div className="mb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                        <Globe className="w-3 h-3" /> Global Compliance
                    </div>
                    <h1 className="text-6xl font-black text-foreground mb-6 uppercase tracking-tight leading-none">{title}</h1>
                    <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Last Material Update: {lastUpdated}</p>
                </div>

                <div className="bg-card rounded-4xl border-2 border-border p-12 md:p-20 shadow-xl prose prose-slate dark:prose-invert max-w-none">
                    {children}
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-10 bg-card rounded-3xl border-2 border-border hover:border-primary transition-all group">
                        <Shield className="w-10 h-10 text-primary mx-auto mb-6 group-hover:scale-110 transition-transform" />
                        <h4 className="font-black uppercase text-sm tracking-widest mb-4">Privacy Safe</h4>
                        <p className="text-xs text-muted-foreground font-medium">We do not store extension source code permanently.</p>
                    </div>
                    <div className="p-10 bg-card rounded-3xl border-2 border-border hover:border-primary transition-all group">
                        <Lock className="w-10 h-10 text-primary mx-auto mb-6 group-hover:scale-110 transition-transform" />
                        <h4 className="font-black uppercase text-sm tracking-widest mb-4">Encryption</h4>
                        <p className="text-xs text-muted-foreground font-medium">All analysis occurs in an isolated, encrypted sandbox.</p>
                    </div>
                    <div className="p-10 bg-card rounded-3xl border-2 border-border hover:border-primary transition-all group">
                        <AlertCircle className="w-10 h-10 text-primary mx-auto mb-6 group-hover:scale-110 transition-transform" />
                        <h4 className="font-black uppercase text-sm tracking-widest mb-4">Reporting</h4>
                        <p className="text-xs text-muted-foreground font-medium">Issues found? Contact our security response team.</p>
                    </div>
                </div>

                <div className="mt-32 text-center border-t border-border pt-20">
                    <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.5em] mb-8">© 2026 CodeLens Security. All Rights Reserved.</p>
                    <div className="flex justify-center gap-10">
                        <Link href="/terms" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary">Terms</Link>
                        <Link href="/privacy" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary">Privacy</Link>
                        <Link href="/dmca" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary">DMCA</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
