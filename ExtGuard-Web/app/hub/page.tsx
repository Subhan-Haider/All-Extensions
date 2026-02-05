'use client';

import { useState } from 'react';
import { Search, ShieldCheck, Download, Star, ExternalLink, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Extension } from '@/types';

// Mock Data for the Hub
const MOCK_EXTENSIONS: Extension[] = [
    {
        id: '1',
        name: 'VaultGuard Pro',
        developer: { name: 'CyberShield', id: 'd1', verified: true },
        currentVersion: '2.3.1',
        status: 'published',
        category: 'Security',
        downloads: 12500,
        updatedAt: '2026-01-25T10:00:00Z',
        zipUrl: '#',
        latestReport: { id: 'r1', extensionName: 'VaultGuard Pro', version: '2.3.1', type: 'MV3', manifestVersion: 3, results: [], readiness: { chrome: { status: 'passed', riskScore: 5 }, firefox: { status: 'passed', riskScore: 2 }, edge: { status: 'passed', riskScore: 5 }, recommendations: [] }, performance: { loadTime: 45, memoryEstimate: 1200, cpuImpact: 'low' }, timestamp: '2026-01-25T10:00:00Z' }
    },
    {
        id: '2',
        name: 'TabFlow AI',
        developer: { name: 'Mindset Labs', id: 'd2', verified: true },
        currentVersion: '1.0.4',
        status: 'published',
        category: 'Productivity',
        downloads: 8400,
        updatedAt: '2026-01-28T15:30:00Z',
        zipUrl: '#',
        latestReport: { id: 'r2', extensionName: 'TabFlow AI', version: '1.0.4', type: 'MV3', manifestVersion: 3, results: [], readiness: { chrome: { status: 'passed', riskScore: 12 }, firefox: { status: 'passed', riskScore: 8 }, edge: { status: 'passed', riskScore: 12 }, recommendations: [] }, performance: { loadTime: 120, memoryEstimate: 4500, cpuImpact: 'medium' }, timestamp: '2026-01-28T15:30:00Z' }
    },
    {
        id: '3',
        name: 'DarkMode Ultra',
        developer: { name: 'SoftPixel', id: 'd3', verified: false },
        currentVersion: '0.9.8',
        status: 'published',
        category: 'Themes',
        downloads: 45000,
        updatedAt: '2026-01-20T08:15:00Z',
        zipUrl: '#',
        latestReport: { id: 'r3', extensionName: 'DarkMode Ultra', version: '0.9.8', type: 'MV2', manifestVersion: 2, results: [], readiness: { chrome: { status: 'warning', riskScore: 25 }, firefox: { status: 'passed', riskScore: 5 }, edge: { status: 'warning', riskScore: 25 }, recommendations: ['Upgrade to MV3'] }, performance: { loadTime: 30, memoryEstimate: 800, cpuImpact: 'low' }, timestamp: '2026-01-20T08:15:00Z' }
    }
];

export default function Hub() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [view, setView] = useState<'grid' | 'list'>('grid');

    const filtered = MOCK_EXTENSIONS.filter(ext =>
        (ext.name.toLowerCase().includes(search.toLowerCase()) || ext.category.toLowerCase().includes(search.toLowerCase())) &&
        (category === 'All' || ext.category === category)
    );

    return (
        <main className="min-h-screen pb-32">
            <Navbar />

            <div className="container-fixed pt-40 space-y-16">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                            <Star className="w-3 h-3 fill-current" />
                            Curated Directory
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground uppercase leading-none">Extension <span className="premium-gradient">Hub</span></h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-xl font-medium opacity-80">
                            The industry standard for verified, audited, and production-ready browser extensions.
                        </p>
                    </div>

                    <div className="relative group w-full md:w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search verified builds..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-muted/40 border border-border/60 focus:border-primary/40 focus:bg-background outline-none transition-all font-semibold text-foreground text-base shadow-sm"
                        />
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-6 py-8 border-y border-border/40">
                    <div className="flex flex-wrap items-center gap-2">
                        {['All', 'Security', 'Productivity', 'Themes', 'Developer'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${category === cat
                                    ? 'bg-foreground text-background shadow-lg'
                                    : 'bg-muted/40 text-muted-foreground border border-border/40 hover:bg-muted/80'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-xl border border-border/40">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Extensions Grid */}
                <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
                    <AnimatePresence mode="popLayout">
                        {filtered.map((ext, i) => (
                            <ExtensionCard key={ext.id} extension={ext} index={i} view={view} />
                        ))}
                    </AnimatePresence>
                </div>

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center border border-border/40">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold tracking-tight text-foreground">No matches found</h3>
                            <p className="text-base text-muted-foreground opacity-70">Adjust your criteria and try again.</p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

function ExtensionCard({ extension, index, view }: { extension: Extension, index: number, view: 'grid' | 'list' }) {
    if (view === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 flex items-center justify-between group card-hover border border-border/40"
            >
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {extension.name[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-foreground tracking-tight">{extension.name}</h3>
                            {extension.developer.verified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">by {extension.developer.name} • {extension.category}</p>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="hidden lg:block text-right">
                        <div className="text-xl font-bold text-foreground tracking-tight">{extension.downloads.toLocaleString()}</div>
                        <div className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest">Users</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${extension.latestReport.readiness.chrome.status === 'error' ? 'bg-destructive/5 text-destructive border-destructive/20' :
                            (extension.latestReport.readiness.chrome.status === 'warning' ? 'bg-warning/5 text-warning border-warning/20' : 'bg-success/5 text-success border-success/20')
                            }`}>
                            {extension.latestReport.readiness.chrome.status}
                        </div>
                        <button className="h-10 w-10 rounded-lg bg-muted/40 border border-border/40 hover:border-primary/40 transition-all flex items-center justify-center text-foreground hover:bg-primary hover:text-white">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 }}
            className="glass-card p-6 md:p-7 flex flex-col justify-between group card-hover border border-border/40 min-h-[340px]"
        >
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold group-hover:scale-105 transition-transform">
                        {extension.name[0]}
                    </div>
                    <div className="flex items-center gap-1 text-warning bg-warning/5 px-2 py-0.5 rounded-md border border-warning/10">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-[10px] font-bold">4.9</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 pt-1">
                        <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{extension.name}</h3>
                        {extension.developer.verified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-3 opacity-80">
                        Reliable security infrastructure designed for production environments. Full auditing transparency.
                    </p>
                </div>
            </div>

            <div className="mt-6 pt-5 border-t border-border/40 flex items-center justify-between">
                <div>
                    <div className="text-[11px] font-bold text-foreground">{extension.developer.name}</div>
                    <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">{extension.category}</div>
                </div>
                <button className="h-9 px-4 rounded-md bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all">
                    View Build
                </button>
            </div>
        </motion.div>
    );
}
