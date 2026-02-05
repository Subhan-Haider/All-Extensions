'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Code, Cpu, ExternalLink, Zap, ShieldAlert, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';

const ENDPOINTS = [
    {
        method: 'POST',
        path: '/api/analyze',
        desc: 'Upload a ZIP for deep security analysis.',
        auth: 'None (Rate Limited)',
        params: [
            { name: 'file', type: 'File (ZIP)', desc: 'The extension ZIP to scan.' }
        ]
    },
    {
        method: 'GET',
        path: '/api/extensions',
        desc: 'List all verified extensions from the Hub.',
        auth: 'None',
        params: [
            { name: 'category', type: 'String', desc: 'Filter by category.' }
        ]
    }
];

export default function ApiDocs() {
    const [selected, setSelected] = useState(0);

    return (
        <main className="min-h-screen pb-32">
            <Navbar />

            <div className="container-fixed pt-40 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                            <Terminal className="w-3 h-3" />
                            API Reference
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight text-foreground leading-none">
                            Developer<br />
                            <span className="premium-gradient">Portal.</span>
                        </h1>
                        <p className="text-base text-muted-foreground font-medium leading-relaxed opacity-80">Build secure browser tools with our industry-standard security API infrastructure.</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Rest Endpoints</h3>
                        <div className="space-y-2">
                            {ENDPOINTS.map((ep, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelected(i)}
                                    className={`w-full p-5 rounded-2xl border text-left transition-all group ${selected === i
                                        ? 'bg-primary/5 border-primary/30 shadow-sm'
                                        : 'bg-transparent border-border/40 hover:bg-muted/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${ep.method === 'POST' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/10' : 'bg-success/10 text-success border border-success/10'}`}>
                                            {ep.method}
                                        </span>
                                        <span className="text-sm font-mono font-bold text-foreground opacity-80 group-hover:opacity-100 transition-opacity">{ep.path}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium italic truncate">"{ep.desc}"</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Console Area */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selected}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass-card rounded-[32px] p-8 md:p-12 space-y-10 min-h-[550px] border border-border/40 premium-blur shadow-xl shadow-black/5"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-bold tracking-tight text-foreground">{ENDPOINTS[selected].method} {ENDPOINTS[selected].path}</h2>
                                    <div className="px-3 py-1 rounded-lg bg-muted border border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Stable v2.0
                                    </div>
                                </div>
                                <p className="text-lg text-muted-foreground font-medium leading-relaxed opacity-90">{ENDPOINTS[selected].desc}</p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Request Parameters
                                    </h4>
                                    <div className="space-y-2">
                                        {ENDPOINTS[selected].params.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/40 group">
                                                <div className="flex items-center gap-4">
                                                    <span className="font-mono text-sm text-primary font-bold">{p.name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-bold italic opacity-60">{p.type}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground font-medium">{p.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                                            <Code className="w-4 h-4 text-primary" />
                                            Request Example
                                        </h4>
                                        <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:opacity-70 transition-all">Copy Curl</button>
                                    </div>
                                    <div className="bg-[#0a0a0b] rounded-2xl p-6 md:p-8 font-mono text-xs text-primary/80 relative group border border-white/5 shadow-inner overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                                        <pre className="overflow-x-auto custom-scrollbar leading-relaxed">
                                            {`curl -X ${ENDPOINTS[selected].method} "https://extguard.ai${ENDPOINTS[selected].path}" \\
  -H "Accept: application/json" \\
  ${ENDPOINTS[selected].method === 'POST' ? '-F "file=@/path/to/extension.zip"' : ''}`}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border/40 flex gap-12">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Burst Capacity</span>
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5 text-warning" />
                                        <span className="text-base font-bold text-foreground">100 req / hr</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Authentication</span>
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="w-3.5 h-3.5 text-success" />
                                        <span className="text-base font-bold text-foreground">{ENDPOINTS[selected].auth}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
