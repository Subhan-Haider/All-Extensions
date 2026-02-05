'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Shield, AlertTriangle, Github, Globe, Zap, Star, Clock, Layers, ChevronRight, CheckCircle2, Info, Package, SearchCheck, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Extension {
    id: string;
    name: string;
    description: string;
    category: string;
    riskScore: number;
    isOpenSource: boolean;
    lastUpdated: string;
    rating: number;
    installs: string;
    tags: string[];
    icon: string;
}

const CATEGORIES = ['All', 'Security', 'Productivity', 'Developer Tools', 'Shopping', 'Social', 'Privacy'];
const FILTERS = [
    { id: 'safe', label: 'Safe Only', icon: Shield },
    { id: 'high-risk', label: 'High Risk', icon: AlertTriangle },
    { id: 'open-source', label: 'Open Source', icon: Github },
    { id: 'recent', label: 'Recently Updated', icon: Clock }
];

export default function DiscoverPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [recentAnalyses, setRecentAnalyses] = useState([
        { id: '1', name: 'UBlock Origin', icon: '🛡️', score: 98, time: '2m ago' },
        { id: '2', name: 'React DevTools', icon: '⚛️', score: 94, time: '5m ago' },
        { id: '3', name: 'JSON Vue', icon: '📋', score: 88, time: '8m ago' },
        { id: '4', name: 'ColorZilla', icon: '🎨', score: 96, time: '12m ago' },
        { id: '5', name: 'Wappalyzer', icon: '🔍', score: 91, time: '15m ago' },
    ]);

    // Simulated Live Feed Logic
    useEffect(() => {
        const mockupPool = [
            { name: 'Tailwind CSS DevTools', icon: '🌊', score: 95 },
            { name: 'Privacy Badger', icon: '🦡', score: 99 },
            { name: 'Meta Pixel Helper', icon: '♾️', score: 72 },
            { name: 'Vimium', icon: '⌨️', score: 93 },
            { name: 'Pushbullet', icon: '🔔', score: 85 },
            { name: 'LastPass', icon: '🔑', score: 88 },
            { name: 'Honey', icon: '🍯', score: 64 },
        ];

        const interval = setInterval(() => {
            const randomExt = mockupPool[Math.floor(Math.random() * mockupPool.length)];
            setRecentAnalyses(prev => [
                { id: Math.random().toString(), ...randomExt, time: 'Just now' },
                ...prev.slice(0, 5)
            ]);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Mock data for discovery
    const [extensions, setExtensions] = useState<Extension[]>([
        {
            id: 'cjpalhdlnbpafiamejdnhcphjbkeiagm',
            name: 'uBlock Origin',
            description: 'An efficient blocker. Fast, potent, and lean.',
            category: 'Security',
            riskScore: 5,
            isOpenSource: true,
            lastUpdated: '2 days ago',
            rating: 4.9,
            installs: '10M+',
            tags: ['Adblock', 'Privacy'],
            icon: '🛡️'
        },
        {
            id: 'dhdgffkkebhmkfjojejmpbldmpobfkfo',
            name: 'Tampermonkey',
            description: 'The world\'s most popular userscript manager.',
            category: 'Developer Tools',
            riskScore: 45,
            isOpenSource: false,
            lastUpdated: '1 month ago',
            rating: 4.7,
            installs: '10M+',
            tags: ['Scripts', 'Automation'],
            icon: '🐒'
        },
        {
            id: 'bmnlcghcbidmghhceoeohibihfhcikca',
            name: 'Honey',
            description: 'Automatically find and apply coupon codes.',
            category: 'Shopping',
            riskScore: 65,
            isOpenSource: false,
            lastUpdated: '1 week ago',
            rating: 4.8,
            installs: '10M+',
            tags: ['Coupons', 'Savings'],
            icon: '🍯'
        },
        {
            id: 'fmkadmapgofadopljbhfhoadpjkbbdbm',
            name: 'React Developer Tools',
            description: 'Tools for the React JavaScript library.',
            category: 'Developer Tools',
            riskScore: 2,
            isOpenSource: true,
            lastUpdated: '3 days ago',
            rating: 4.6,
            installs: '3M+',
            tags: ['React', 'Dev'],
            icon: '⚛️'
        }
    ]);

    const toggleFilter = (filterId: string) => {
        setActiveFilters(prev =>
            prev.includes(filterId)
                ? prev.filter(f => f !== filterId)
                : [...prev, filterId]
        );
    };

    const filteredExtensions = extensions.filter(ext => {
        const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ext.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || ext.category === selectedCategory;

        let matchesFilters = true;
        if (activeFilters.includes('safe')) matchesFilters = matchesFilters && ext.riskScore < 20;
        if (activeFilters.includes('high-risk')) matchesFilters = matchesFilters && ext.riskScore > 50;
        if (activeFilters.includes('open-source')) matchesFilters = matchesFilters && ext.isOpenSource;

        return matchesSearch && matchesCategory && matchesFilters;
    });

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <main className="max-w-7xl mx-auto px-6 py-32">
                <div className="mb-16 text-center">
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                                <Globe className="w-3 h-3" /> Worldwide Search
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                <Clock className="w-3 h-3" /> Next Sync: 48m
                            </div>
                        </div>
                    </div>
                    <h1 className="text-6xl font-black text-foreground mb-4 uppercase tracking-tight leading-none">Discovery Engine</h1>
                    <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">Explore and verify millions of browser extensions with AI-powered security auditing.</p>
                </div>

                {/* Top 20 Trending Section - High Fidelity Redesign */}
                <div className="mb-24 relative">
                    <div className="absolute -inset-x-20 -top-20 -bottom-10 bg-primary/5 blur-[100px] rounded-full opacity-50 pointer-events-none" />

                    <div className="flex items-end justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 rotate-3">
                                <Star className="w-8 h-8 text-white fill-current" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none mb-2">Top 20 Trending</h2>
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Real-time analysis stream // v2.5</p>
                                </div>
                            </div>
                        </div>
                        <Link href="/discover" className="group flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-primary hover:text-white transition-all shadow-sm">
                            Full Leaderboard <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="flex gap-8 overflow-x-auto pb-10 no-scrollbar relative z-10 -mx-4 px-4">
                        {[
                            { name: 'AdGuard', id: 'bgnkhhnnamicmpeenaelnjfhikgbkllg', risk: 8, icon: '🛡️', category: 'Privacy', rank: 1 },
                            { name: 'Bitwarden', id: 'nngceckbapebfimnlniiiahkandclblb', risk: 2, icon: '🔐', category: 'Security', rank: 2 },
                            { name: 'Grammarly', id: 'kbfnbcaeplbcioaajhpnepejiffbgghn', risk: 12, icon: '✍️', category: 'Writing', rank: 3 },
                            { name: 'Dark Reader', id: 'eimadpbcimnchlhckidahhionpkbeak', risk: 5, icon: '🌙', category: 'Accessibility', rank: 4 },
                            { name: 'Volume Master', id: 'pibobdmogkeepbedbedpjdu', risk: 15, icon: '🔊', category: 'Utility', rank: 5 }
                        ].map((ext, i) => (
                            <Link
                                key={i}
                                href={`/analyze?url=https://chrome.google.com/webstore/detail/${ext.id}`}
                                className="min-w-[320px] bg-card/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border-2 border-border/50 hover:border-primary transition-all group flex flex-col shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="text-5xl font-black text-foreground/5 italic">#{ext.rank}</div>
                                </div>

                                <div className="flex items-start gap-5 mb-8">
                                    <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        {ext.icon}
                                    </div>
                                    <div className="flex-1 pt-2">
                                        <div className="inline-block px-3 py-1 bg-primary/10 rounded-lg text-[9px] font-black text-primary uppercase tracking-widest mb-2 border border-primary/10">
                                            {ext.category}
                                        </div>
                                        <h4 className="font-black text-foreground uppercase tracking-tight text-xl leading-tight group-hover:text-primary transition-colors">{ext.name}</h4>
                                    </div>
                                </div>

                                <div className="mt-auto grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                                        <div className="text-2xl font-black text-foreground">{100 - ext.risk}</div>
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Safety
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 flex flex-col items-center justify-center">
                                        <Zap className="w-5 h-5 text-yellow-500 mb-1" />
                                        <div className="text-[10px] font-black text-foreground uppercase tracking-widest">Quick Scan</div>
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted group-hover:bg-primary transition-colors overflow-hidden">
                                    <div className="h-full bg-primary w-[70%] group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find extensions by name, URL, or ID..."
                            className="w-full h-18 pl-16 pr-6 bg-card border-2 border-border rounded-4xl text-lg font-medium focus:border-indigo-600 focus:outline-none transition-all shadow-sm hover:shadow-md text-foreground placeholder-muted-foreground"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3">
                        {FILTERS.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => toggleFilter(filter.id)}
                                className={`h-18 px-8 rounded-4xl border-2 font-black uppercase text-xs tracking-widest flex items-center gap-3 transition-all ${activeFilters.includes(filter.id)
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'bg-card border-border text-muted-foreground hover:border-indigo-400'
                                    }`}
                            >
                                <filter.icon className="w-4 h-4" />
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat
                                ? 'bg-foreground text-background shadow-xl translate-y-[-2px]'
                                : 'bg-card text-muted-foreground hover:bg-muted border border-border'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Extension Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredExtensions.map(ext => (
                        <div key={ext.id} className="group bg-card rounded-[3rem] border-2 border-border overflow-hidden hover:border-indigo-600 transition-all hover:shadow-2xl">
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-20 h-20 bg-muted rounded-4xl border border-border/50 flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform">
                                        {ext.icon}
                                    </div>
                                    <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border-2 ${ext.riskScore < 20 ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                        ext.riskScore < 50 ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                            'bg-red-500/10 border-red-500/20 text-red-500'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${ext.riskScore < 20 ? 'bg-green-500' :
                                            ext.riskScore < 50 ? 'bg-orange-500' :
                                                'bg-red-500'
                                            }`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest font-sans">
                                            {ext.riskScore < 20 ? 'Safe' : ext.riskScore < 50 ? 'Medium Risk' : 'High Risk'}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-foreground mb-2 truncate leading-tight uppercase tracking-tight">{ext.name}</h3>
                                <p className="text-muted-foreground text-sm font-medium line-clamp-2 mb-8">{ext.description}</p>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {ext.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-muted rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{tag}</span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Users</div>
                                        <div className="text-lg font-black text-foreground font-sans">{ext.installs}</div>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Rating</div>
                                        <div className="text-lg font-black text-foreground flex items-center gap-1 font-sans">
                                            <Star className="w-4 h-4 text-orange-400 fill-current" />
                                            {ext.rating}
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/analyze?url=https://chrome.google.com/webstore/detail/${ext.id}`}
                                    className="w-full py-4 bg-foreground text-background rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3"
                                >
                                    Deep Audit <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {/* Add More Placeholders */}
                    <div className="bg-muted/50 rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center justify-center p-12 text-center opacity-60">
                        <Package className="w-16 h-16 text-muted-foreground mb-6" />
                        <h3 className="text-xl font-black text-muted-foreground uppercase tracking-tight mb-2 leading-none">Millions More</h3>
                        <p className="text-muted-foreground/60 text-sm font-medium">Use the search bar above to audit any extension from the Chrome Web Store or Edge Add-ons.</p>
                    </div>
                </div>
            </main>

            {/* Recently Analyzed Section */}
            <section className="bg-card py-24 border-t border-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-black uppercase tracking-tight leading-none">Recently Analyzed</h2>
                        <div className="flex gap-2">
                            <button className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors cursor-not-allowed">
                                <ChevronRight className="rotate-180 w-5 h-5" />
                            </button>
                            <button className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors cursor-not-allowed">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-6 overflow-hidden relative">
                        <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-card to-transparent z-10 pointer-events-none" />
                        <AnimatePresence initial={false}>
                            {recentAnalyses.map((ext) => (
                                <motion.div
                                    key={ext.id}
                                    layout
                                    initial={{ opacity: 0, x: -50, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="min-w-[300px] p-6 bg-background rounded-3xl border border-border flex items-center gap-4 hover:border-primary/50 transition-colors shadow-sm relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-2xl shadow-inner shadow-black/5">
                                        {ext.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-black text-foreground truncate uppercase tracking-tight text-sm mb-0.5">{ext.name}</div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">{ext.time}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${ext.score}%` }}
                                                    className={`h-full rounded-full ${ext.score > 90 ? 'bg-green-500' : ext.score > 80 ? 'bg-primary' : 'bg-orange-500'}`}
                                                />
                                            </div>
                                            <span className={`text-[10px] font-black ${ext.score > 90 ? 'text-green-500' : 'text-primary'} tabular-nums`}>{ext.score}%</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>
        </div>
    );
}
