'use client';

import { Check, X, Shield, Github } from 'lucide-react';

export default function Comparison() {
    const data = [
        { name: 'Full Package Inspection', codelens: true, others: true },
        { name: 'Multi-Store (CRX/XPI) Support', codelens: true, others: false },
        { name: 'Security Threat Mapping', codelens: true, others: false },
        { name: '100% On-Device Analysis', codelens: true, others: false },
        { name: 'GitHub Mirror Integration', codelens: true, others: false, icon: <Github className="w-4 h-4" /> },
        { name: 'Zero Telemetry Policy', codelens: true, others: false, icon: <Shield className="w-4 h-4 text-green-500" /> },
    ];

    return (
        <section className="py-32 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-24">
                    <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-primary mb-6">Performance Matrix</h2>
                    <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">Superior by design.</h2>
                </div>

                <div className="bg-card rounded-[3rem] overflow-hidden border-2 border-border shadow-xl">
                    <div className="grid grid-cols-12 bg-muted/30 py-10 px-8 items-center border-b border-border font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        <div className="col-span-6 pl-4">Platform Intelligence</div>
                        <div className="col-span-3 text-center text-primary">CodeLens Pro</div>
                        <div className="col-span-3 text-center">Standard Tools</div>
                    </div>

                    <div className="divide-y divide-border">
                        {data.map((row, i) => (
                            <div key={i} className="grid grid-cols-12 py-10 px-8 items-center hover:bg-muted/50 transition-colors group">
                                <div className="col-span-6 flex items-center gap-6 pl-4">
                                    <span className="text-xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{row.name}</span>
                                </div>
                                <div className="col-span-3 flex justify-center">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                                        <Check className="w-5 h-5" strokeWidth={3} />
                                    </div>
                                </div>
                                <div className="col-span-3 flex justify-center">
                                    {row.others ? (
                                        <Check className="w-5 h-5 text-muted-foreground opacity-30" strokeWidth={3} />
                                    ) : (
                                        <X className="w-5 h-5 text-red-500" strokeWidth={3} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
