'use client';

import { motion } from 'framer-motion';
import { Search, Shield, Code, Zap, Globe, Github } from 'lucide-react';

export default function Features() {
    const items = [
        { title: 'Store Detection', desc: 'Identify any extension from Chrome, Edge, or Firefox instantly.', icon: <Search className="w-5 h-5 text-indigo-400" /> },
        { title: 'Security Audit', desc: 'Deep scan for malware, unsafe eval(), and data exfiltration.', icon: <Shield className="w-5 h-5 text-indigo-400" /> },
        { title: 'Module Inspector', desc: 'Browse full source code with syntax highlighting in-browser.', icon: <Code className="w-5 h-5 text-indigo-400" /> },
        { title: 'Package Extraction', desc: 'Convert CRX/XPI to optimized ZIP files for local study.', icon: <Zap className="w-5 h-5 text-indigo-400" /> },
        { title: 'Privacy Pulse', desc: '100% local processing. Zero logs, zero telemetry, zero data sent.', icon: <Globe className="w-5 h-5 text-indigo-400" /> },
        { title: 'Git Integration', desc: 'Mirror extension source code directly to your GitHub repos.', icon: <Github className="w-5 h-5 text-indigo-400" /> },
    ];

    return (
        <section className="bg-background py-32 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-24">
                    <h2 className="text-xs font-black uppercase tracking-[0.5em] text-indigo-500 mb-6">Core Infrastructure</h2>
                    <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">Engineered for precision.</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {items.map((item, i) => (
                        <div key={i} className="bg-card p-10 rounded-[2.5rem] border-2 border-border hover:border-indigo-500/50 transition-all group hover:shadow-2xl hover:shadow-indigo-500/5">
                            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight">{item.title}</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
