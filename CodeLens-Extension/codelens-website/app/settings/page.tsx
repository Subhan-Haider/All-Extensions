'use client';

import { useState, useEffect } from 'react';
import {
    Settings, Shield, Zap, Bell, Monitor, Globe,
    Save, RotateCcw, ChevronRight, Lock, Eye,
    Download, FileText, Smartphone, Tablet, Laptop
} from 'lucide-react';
import Link from 'next/link';

import { useTheme } from '@/components/ThemeProvider';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [depth, setDepth] = useState(50);
    const [notifications, setNotifications] = useState(true);
    const [format, setFormat] = useState('json');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Persist to localStorage
    useEffect(() => {
        const savedDepth = localStorage.getItem('cl-depth');
        const savedNotifs = localStorage.getItem('cl-notifications');
        const savedFormat = localStorage.getItem('cl-format');

        if (savedDepth) setDepth(parseInt(savedDepth));
        if (savedNotifs) setNotifications(savedNotifs === 'true');
        if (savedFormat) setFormat(savedFormat);
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            localStorage.setItem('cl-depth', depth.toString());
            localStorage.setItem('cl-notifications', notifications.toString());
            localStorage.setItem('cl-format', format);
            // Theme is handled by ThemeProvider via setTheme

            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 800);
    };

    const handleReset = () => {
        setTheme('system');
        setDepth(50);
        setNotifications(true);
        setFormat('json');
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <main className="max-w-4xl mx-auto px-6 py-32">
                <div className="mb-16">
                    <h1 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tight">Preferences</h1>
                    <p className="text-muted-foreground text-lg font-medium">Control your analysis environment, sensitivity thresholds, and export formats.</p>
                </div>

                <div className="space-y-10">
                    {/* Appearance */}
                    <section className="bg-card rounded-[3rem] border-2 border-border p-10 shadow-sm">
                        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-3">
                            <Monitor className="w-4 h-4" /> Appearance
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'light', label: 'Light Mode', icon: Monitor },
                                { id: 'dark', label: 'Dark Mode', icon: Laptop },
                                { id: 'system', label: 'System', icon: Globe }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setTheme(item.id as any)}
                                    className={`p-6 rounded-3xl border-2 transition-all text-left ${theme === item.id
                                        ? 'border-indigo-600 bg-indigo-50/10'
                                        : 'border-border bg-muted/50 hover:border-indigo-400'
                                        }`}
                                >
                                    <item.icon className={`w-8 h-8 mb-4 ${theme === item.id ? 'text-indigo-600' : 'text-muted-foreground'}`} />
                                    <div className="font-black uppercase text-xs tracking-widest">{item.label}</div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Analysis Depth */}
                    <section className="bg-card rounded-[3rem] border-2 border-border p-10 shadow-sm">
                        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-3">
                            <Zap className="w-4 h-4" /> Analysis Depth Control
                        </h2>
                        <div className="space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-xl font-black text-foreground mb-1">Warning Sensitivity</h3>
                                    <p className="text-sm text-muted-foreground font-medium">Higher values detect more heuristic patterns but increase false positives.</p>
                                </div>
                                <div className="text-4xl font-black text-indigo-600">{depth}%</div>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={depth}
                                onChange={(e) => setDepth(parseInt(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="grid grid-cols-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <span>Standard</span>
                                <span className="text-center">Aggressive</span>
                                <span className="text-right">Paranoid</span>
                            </div>
                        </div>
                    </section>

                    {/* Export Preferences */}
                    <section className="bg-card rounded-[3rem] border-2 border-border p-10 shadow-sm">
                        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-3">
                            <Download className="w-4 h-4" /> Export Presets
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {['json', 'txt', 'pdf', 'csv'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFormat(f)}
                                    className={`px-8 py-4 rounded-2xl border-2 font-black uppercase text-xs tracking-widest transition-all ${format === f
                                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg'
                                        : 'border-border bg-muted/50 text-muted-foreground hover:border-indigo-400'
                                        }`}
                                >
                                    {f.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="bg-card rounded-[3rem] border-2 border-border p-10 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-indigo-50/10 rounded-2xl flex items-center justify-center">
                                    <Bell className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground">Push Notifications</h3>
                                    <p className="text-sm text-muted-foreground font-medium">Alert me when a saved extension has a safety regression.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`w-16 h-8 rounded-full transition-all relative ${notifications ? 'bg-indigo-600' : 'bg-muted'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${notifications ? 'left-9' : 'left-1'}`} />
                            </button>
                        </div>
                    </section>

                    <div className="flex gap-4 pt-10">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`flex-1 py-5 rounded-4xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 ${saved ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'
                                }`}
                        >
                            {isSaving ? (
                                <RotateCcw className="w-4 h-4 animate-spin" />
                            ) : saved ? (
                                <>
                                    <Shield className="w-4 h-4" /> Settings Saved
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Save Changes
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-10 py-5 bg-card border-2 border-border text-muted-foreground rounded-4xl font-black uppercase text-xs tracking-widest hover:border-red-500 hover:text-red-500 transition-all font-sans"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
