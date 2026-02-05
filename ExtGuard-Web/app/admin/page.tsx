'use client';

import { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Eye, Trash2, User, RefreshCcw, Search, Clock, ShieldCheck, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';

// Mock Queue Data
const MOCK_QUEUE = [
    {
        id: 's1',
        name: 'AutoCrypto Miner',
        developer: 'UnknownDev',
        status: 'pending',
        riskScore: 85,
        submittedAt: '2026-01-29T14:20:00Z',
        criticalIssues: ['High Obfuscation', 'Eval usage', 'Broad permissions'],
        zipUrl: '#'
    },
    {
        id: 's2',
        name: 'FocusMode+',
        developer: 'Sarah Dev',
        status: 'reviewing',
        riskScore: 12,
        submittedAt: '2026-01-29T16:45:00Z',
        criticalIssues: [],
        zipUrl: '#'
    },
    {
        id: 's3',
        name: 'TabGroup Master',
        developer: 'Alex Chen',
        status: 'pending',
        riskScore: 24,
        submittedAt: '2026-01-29T18:10:00Z',
        criticalIssues: ['V2 Manifest'],
        zipUrl: '#'
    }
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'pending' | 'reports' | 'users'>('pending');
    const [selectedSubmission, setSelectedSubmission] = useState(MOCK_QUEUE[0]);

    return (
        <main className="min-h-screen pb-20 bg-background text-foreground transition-colors duration-500">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-40 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black flex items-center gap-3 italic text-foreground tracking-tight uppercase">
                            Admin Commander
                            <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest border border-destructive/20 shadow-lg not-italic">
                                Restricted Access
                            </span>
                        </h1>
                        <p className="text-muted-foreground font-medium">Monitor, review, and secure the extension ecosystem.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-muted p-1 rounded-2xl border border-border">
                        {['pending', 'reports', 'users'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-card text-foreground shadow-xl' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Queue */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search queue..."
                                className="w-full bg-muted border border-border rounded-2xl pl-12 pr-6 py-3.5 text-sm font-semibold focus:outline-none focus:border-primary/50 text-foreground transition-all"
                            />
                        </div>

                        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                            {MOCK_QUEUE.map((item) => (
                                <motion.div
                                    key={item.id}
                                    onClick={() => setSelectedSubmission(item)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`p-5 rounded-3xl border cursor-pointer transition-all ${selectedSubmission.id === item.id
                                        ? 'bg-primary/10 border-primary/30 shadow-2xl'
                                        : 'bg-muted border-border hover:bg-border'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-black text-sm tracking-tight text-foreground italic">{item.name}</h3>
                                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.riskScore > 50 ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-success/10 text-success border border-success/20'
                                            }`}>
                                            {item.riskScore}% Risk
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                                        <span>{item.developer}</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Review Panel */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <motion.div
                            layoutId="reviewPanel"
                            className="glass rounded-[48px] p-10 space-y-10 min-h-[600px] border-border shadow-2xl relative overflow-hidden"
                        >
                            {/* Background Glow */}
                            <div className={`absolute top-0 right-0 w-80 h-80 blur-[120px] -z-10 ${selectedSubmission.riskScore > 50 ? 'bg-destructive/10' : 'bg-success/20'
                                }`} />

                            <div className="flex justify-between items-start">
                                <div className="flex gap-8">
                                    <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center text-white text-4xl font-black italic shadow-2xl shadow-primary/20">
                                        {selectedSubmission.name[0]}
                                    </div>
                                    <div className="space-y-3">
                                        <h2 className="text-4xl font-black tracking-tight text-foreground italic uppercase">{selectedSubmission.name}</h2>
                                        <div className="flex items-center gap-6 text-sm text-muted-foreground font-bold">
                                            <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {selectedSubmission.developer}</span>
                                            <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> dev-support@extension.com</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="p-3.5 rounded-2xl bg-muted hover:bg-border transition-all border border-border">
                                        <RefreshCcw className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <button className="p-3.5 rounded-2xl bg-muted hover:bg-border transition-all border border-border text-destructive">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard label="Security Risk" value={`${selectedSubmission.riskScore}%`} color={selectedSubmission.riskScore > 50 ? 'text-destructive' : 'text-success'} />
                                <StatCard label="Manifest" value="Draft V3" color="text-secondary" />
                                <StatCard label="Reputation" value="New Dev" color="text-warning" />
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-foreground" />
                                    Critical Red Flags
                                </h4>
                                {selectedSubmission.criticalIssues.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedSubmission.criticalIssues.map((issue, i) => (
                                            <div key={i} className="p-5 rounded-[24px] bg-destructive/5 border border-destructive/20 flex items-center gap-4">
                                                <XCircle className="w-6 h-6 text-destructive" />
                                                <span className="text-sm font-black text-destructive uppercase tracking-tight">{issue}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 rounded-[32px] bg-success/5 border border-success/20 flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                                            <ShieldCheck className="w-6 h-6 text-success" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-black text-success italic tracking-tight uppercase">No Critical Policy Violations</div>
                                            <div className="text-sm text-success/60 font-medium">Auto-testing passed core security hurdles.</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-10 mt-auto border-t border-border flex gap-4">
                                <button className="flex-1 py-5 rounded-2xl bg-destructive/10 text-destructive font-black tracking-widest uppercase text-[10px] hover:bg-destructive hover:text-white transition-all border border-destructive/20 shadow-xl">
                                    Reject & Notify
                                </button>
                                <button className="flex-1 py-5 rounded-2xl bg-secondary/10 text-secondary font-black tracking-widest uppercase text-[10px] hover:bg-secondary hover:text-white transition-all border border-secondary/20 shadow-xl">
                                    Request Changes
                                </button>
                                <button className="flex-1 py-5 rounded-2xl bg-success text-white font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl shadow-success/20">
                                    Approve & Publish
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="p-8 rounded-[32px] bg-muted border border-border flex flex-col items-center justify-center text-center group card-hover shadow-xl">
            <div className={`text-3xl font-black mb-1 italic ${color}`}>{value}</div>
            <div className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">{label}</div>
        </div>
    );
}
