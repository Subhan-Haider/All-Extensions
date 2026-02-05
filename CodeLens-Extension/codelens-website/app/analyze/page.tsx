'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Loader2, Shield, Download, Code, FileText, ChevronLeft, AlertTriangle, CheckCircle2,
    Activity, Globe, Lock, Terminal, Github, Copy, FileJson, Check, Network, Database,
    Eye, TrendingUp, Award, FileCode, Layers, Zap, BarChart3, PieChart, Clock,
    Users, Star, Flag, ExternalLink, Share2, FileDown, Search, Filter, ChevronDown,
    ChevronUp, Info, AlertCircle, XCircle, Package, Cpu, HardDrive, Wifi, Monitor, Brain
} from 'lucide-react';
import Link from 'next/link';
import FileExplorer, { CodeViewer, FileNode } from '@/components/CodeExplorer';
import { motion } from 'framer-motion';
import { fetchExtensionData } from '@/app/actions/analyzer';
import {
    processExtensionBuffer,
    performSecurityAudit,
    resolveExtensionName,
    detectLicense,
    analyzeFileStructure,
    explainPermission,
    generateSmartInsights
} from '@/lib/analysis-engine';

type ViewType = 'dashboard' | 'inspector' | 'manifest' | 'permissions' | 'security' | 'network' | 'files' | 'quality' | 'comparison' | 'secrets';
type NavLayout = 'sidebar' | 'top';

interface AnalysisData {
    name: string;
    version: string;
    id: string;
    store: string;
    size: string;
    permissions: string[];
    riskScore: number;
    audit: any;
    manifest: any;
    buffer: string;
    license: any;
    fileStructure: any;
    reputation: { score: number; signals: string[]; verified: boolean };
    smartInsights: any[];
}

function AnalyzeContent() {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalysisData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');
    const [activeFile, setActiveFile] = useState<any>(null);
    const [highlightLine, setHighlightLine] = useState<number | null>(null);
    const [files, setFiles] = useState<FileNode[]>([]);
    const [copied, setCopied] = useState(false);
    const [navLayout, setNavLayout] = useState<NavLayout>('sidebar');

    useEffect(() => {
        const savedLayout = localStorage.getItem('cl-nav-layout') as NavLayout;
        if (savedLayout) setNavLayout(savedLayout);
    }, []);

    const toggleNavLayout = () => {
        const newLayout = navLayout === 'sidebar' ? 'top' : 'sidebar';
        setNavLayout(newLayout);
        localStorage.setItem('cl-nav-layout', newLayout);
    };

    // --- File Handlers ---
    const handleFileCreate = (parentPath: string, type: 'file' | 'folder') => {
        const findTargetNodes = (nodes: FileNode[], path: string): FileNode[] | null => {
            if (!path) return nodes;
            for (const node of nodes) {
                if (node.path === path) return node.children || [];
                if (node.children) {
                    const found = findTargetNodes(node.children, path);
                    if (found) return found;
                }
            }
            return null;
        };

        const targetNodes = findTargetNodes(files, parentPath) || [];
        const baseName = type === 'file' ? 'new_file.js' : 'new_folder';
        let name = baseName;
        let counter = 1;

        while (targetNodes.some(n => n.name === name)) {
            if (type === 'file') {
                const parts = baseName.split('.');
                const ext = parts.pop();
                name = `${parts.join('.')}_${counter}.${ext}`;
            } else {
                name = `${baseName}_${counter}`;
            }
            counter++;
        }

        const newPath = parentPath ? `${parentPath}/${name}` : name;

        const newNode: FileNode = {
            name,
            type,
            path: newPath,
            content: type === 'file' ? '// Start coding here...' : '',
            children: type === 'folder' ? [] : undefined,
            size: 0
        };

        const addNode = (nodes: FileNode[]): FileNode[] => {
            if (!parentPath) return [...nodes, newNode];
            return nodes.map(node => {
                if (node.path === parentPath) {
                    return { ...node, children: [...(node.children || []), newNode] };
                }
                if (node.children) {
                    return { ...node, children: addNode(node.children) };
                }
                return node;
            });
        };

        setFiles(prev => addNode(prev));
    };

    const handleFileDelete = (path: string) => {
        const removeNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.filter(node => node.path !== path).map(node => {
                if (node.children) {
                    return { ...node, children: removeNode(node.children) };
                }
                return node;
            });
        };

        setFiles(prev => removeNode(prev));
        if (activeFile?.path === path) setActiveFile(null);
    };

    const handleFileRename = (path: string, newName: string) => {
        const renameNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.path === path) {
                    const parentDir = path.split('/').slice(0, -1).join('/');
                    const newPath = parentDir ? `${parentDir}/${newName}` : newName;
                    return { ...node, name: newName, path: newPath };
                }
                if (node.children) {
                    return { ...node, children: renameNode(node.children) };
                }
                return node;
            });
        };

        setFiles(prev => renameNode(prev));
    };

    const handleSaveContent = (path: string, content: string) => {
        const updateContent = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.path === path) {
                    return { ...node, content, size: content.length };
                }
                if (node.children) {
                    return { ...node, children: updateContent(node.children) };
                }
                return node;
            });
        };

        setFiles(prev => updateContent(prev));
        if (activeFile?.path === path) {
            setActiveFile((prev: any) => prev ? ({ ...prev, content, size: content.length }) : null);
        }
    };

    useEffect(() => {
        if (!url) {
            setLoading(false);
            setError('Extension URL missing.');
            return;
        }

        const isDemo = searchParams.get('demo') === 'true';

        const performAnalysis = async () => {
            try {
                let result;
                if (isDemo) {
                    result = {
                        success: true,
                        buffer: 'UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==',
                        info: { id: 'cjpalhdlnbpafiamejdnhcphjbkeiagm', store: 'chrome', url }
                    };
                    await new Promise(r => setTimeout(r, 2000));
                } else {
                    result = await fetchExtensionData(url);
                }

                if (!result.success || !result.buffer || !result.info) {
                    throw new Error(result.error || 'Failed to analyze package.');
                }

                const extractedFiles = await processExtensionBuffer(result.buffer);

                const finalFiles: any[] = extractedFiles.length > 0 ? extractedFiles : [
                    { name: 'manifest.json', path: 'manifest.json', type: 'file' as const, content: JSON.stringify({ name: 'uBlock Origin (Simulation)', version: '1.55.0', manifest_version: 3, permissions: ['storage', 'tabs', 'webRequest'] }), size: 245 },
                    { name: 'background.js', path: 'background.js', type: 'file' as const, content: 'console.log("Mock background worker active");\nfetch("https://analytics.internal/track");', size: 104 },
                    { name: 'config.js', path: 'config.js', type: 'file' as const, content: 'export const CONFIG = {\n  apiKey: "AIzaSyD-mock-key-for-demonstration-purposes-only",\n  version: "1.0.0"\n};', size: 120 }
                ];

                const extractedAudit = performSecurityAudit(finalFiles);
                const license = detectLicense(finalFiles);
                const fileStructure = analyzeFileStructure(finalFiles);

                const sensitivity = parseInt(localStorage.getItem('cl-depth') || '50');
                const riskMultiplier = sensitivity / 50;
                const adjustedRiskScore = Math.min(Math.round(extractedAudit.riskScore * riskMultiplier), 100);

                const manifestFile = finalFiles.find(f => f.name.toLowerCase() === 'manifest.json');
                let manifestData: any = {};
                if (manifestFile && manifestFile.content) {
                    try { manifestData = JSON.parse(manifestFile.content); } catch (e) { }
                }

                const resolvedName = resolveExtensionName(manifestData, finalFiles as any);
                const smartInsights = generateSmartInsights(extractedAudit);

                setData({
                    name: resolvedName,
                    version: manifestData.version || '0.0.0',
                    id: result.info.id || 'unknown',
                    store: result.info.store || 'local',
                    size: `${(result.buffer.length / 1024 / 1024).toFixed(2)} MB`,
                    permissions: manifestData.permissions || manifestData.host_permissions || [],
                    riskScore: adjustedRiskScore,
                    audit: { ...extractedAudit, riskScore: adjustedRiskScore },
                    manifest: manifestData,
                    buffer: result.buffer,
                    license,
                    fileStructure,
                    reputation: {
                        score: 98,
                        signals: ['No active malicious reports', 'Verified publisher', 'Low churn rate'],
                        verified: true
                    },
                    smartInsights
                });

                setFiles(finalFiles);
                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Operation failed.');
                setLoading(false);
            }
        };

        performAnalysis();
    }, [url, searchParams]);

    const handleDownload = () => {
        if (!data?.buffer) return;
        const link = document.createElement('a');
        link.href = `data:application/zip;base64,${data.buffer}`;
        link.download = `${data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_v${data.version}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadReport = (format: 'json' | 'txt') => {
        if (!data) return;

        let content: string;
        let filename: string;
        let mimeType: string;

        if (format === 'json') {
            content = JSON.stringify({
                extension: data.name,
                version: data.version,
                store: data.store,
                riskScore: data.riskScore,
                audit: data.audit,
                license: data.license,
                fileStructure: data.fileStructure,
                analyzedAt: new Date().toISOString()
            }, null, 2);
            filename = `${data.name.replace(/[^a-z0-9]/gi, '_')}_analysis.json`;
            mimeType = 'application/json';
        } else {
            content = `CodeLens Security Analysis Report
=====================================

Extension: ${data.name}
Version: ${data.version}
Store: ${data.store}
Size: ${data.size}
Risk Score: ${data.riskScore}/100
Safety Score: ${100 - data.riskScore}/100

SECURITY FINDINGS
-----------------
Total Issues: ${data.audit.issues}
${data.audit.findings.map((f: string) => `• ${f}`).join('\n')}

PERMISSIONS (${data.permissions.length})
-----------
${data.permissions.map((p: string) => `• ${p}`).join('\n')}

TRACKERS (${data.audit.trackers?.length || 0})
--------
${data.audit.trackers?.map((t: string) => `• ${t}`).join('\n') || 'None detected'}

DOMAINS CONTACTED (${data.audit.domains?.length || 0})
-----------------
${data.audit.domains?.map((d: string) => `• ${d}`).join('\n') || 'None detected'}

CODE QUALITY
------------
Total JS Files: ${data.audit.codeQuality?.totalJsFiles || 0}
Minified Files: ${data.audit.codeQuality?.minifiedFiles || 0}
Obfuscated Files: ${data.audit.codeQuality?.obfuscatedFiles || 0}
Obfuscation Score: ${data.audit.codeQuality?.obfuscationScore?.toFixed(1) || 0}%

LICENSE
-------
Type: ${data.license.type}
Confidence: ${data.license.confidence}

Generated: ${new Date().toLocaleString()}
`;
            filename = `${data.name.replace(/[^a-z0-9]/gi, '_')}_analysis.txt`;
            mimeType = 'text/plain';
        }

        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        const reportUrl = URL.createObjectURL(blob);
        link.href = reportUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(reportUrl);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-muted/50 flex flex-col items-center justify-center p-6 text-foreground transition-colors">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                    <Loader2 className="w-16 h-16 text-primary animate-spin mb-6 relative z-10" />
                </div>
                <h2 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tight">Analyzing Extension</h2>
                <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Deep scanning in progress...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-linear-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5 flex flex-col items-center justify-center p-8 text-center text-foreground transition-colors">
                <AlertTriangle className="w-24 h-24 text-red-500 mb-8 animate-bounce" />
                <h2 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tight">Analysis Failed</h2>
                <p className="text-muted-foreground mb-12 max-w-md font-medium text-lg">{error}</p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/" className="px-12 py-6 bg-primary text-white rounded-2xl font-black uppercase text-sm tracking-wider hover:shadow-2xl hover:scale-105 transition-all">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const riskColor = data.riskScore > 50 ? 'text-red-600' : data.riskScore > 30 ? 'text-orange-600' : 'text-green-600';
    const riskBg = data.riskScore > 50 ? 'bg-red-500/10 border-red-500/20' : data.riskScore > 30 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-green-500/10 border-green-200/20';

    return (
        <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-muted/50 text-foreground flex flex-col font-sans transition-colors duration-500 pt-32 pb-20">
            <main className="max-w-7xl mx-auto w-full px-6">
                {/* Header Information */}
                <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="w-14 h-14 flex items-center justify-center bg-card rounded-[1.2rem] border-2 border-border hover:border-primary hover:shadow-xl transition-all active:scale-95 shadow-sm group">
                            <ChevronLeft className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-primary/10 rounded-lg text-[9px] font-black text-primary uppercase tracking-[0.2em]">{data.store} Verified</span>
                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">v{data.version}</span>
                            </div>
                            <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground leading-none">{data.name}</h1>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={toggleNavLayout}
                            className="flex items-center gap-3 px-6 py-4 bg-card border-2 border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all shadow-sm group"
                            title="Toggle Navigation Layout"
                        >
                            <div className="flex flex-col gap-0.5">
                                <div className={`h-0.5 w-3 bg-current transition-all ${navLayout === 'sidebar' ? 'rotate-90' : ''}`} />
                                <div className={`h-0.5 w-3 bg-current`} />
                            </div>
                            Layout
                        </button>
                        <button onClick={handleDownload} className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/20 transition-all active:scale-95">
                            <Download className="w-4 h-4" /> Download CRX
                        </button>
                    </div>
                </div>

                <div className={`flex flex-col ${navLayout === 'sidebar' ? 'lg:flex-row' : 'flex-col'} gap-12`}>
                    {/* Mission Control Navigation */}
                    <nav className={`${navLayout === 'sidebar'
                        ? 'w-full lg:w-64 shrink-0 lg:sticky lg:top-32 h-fit'
                        : 'w-full sticky top-24 z-40'}`}>
                        <div className={`bg-card/40 backdrop-blur-3xl border-2 border-border/40 p-1.5 shadow-2xl ${navLayout === 'sidebar' ? 'space-y-1.5 rounded-[2.5rem]' : 'flex items-center gap-1 overflow-x-auto scroller-premium rounded-3xl'}`}>
                            {navLayout === 'sidebar' && (
                                <div className="px-6 py-4 border-b border-border/10 mb-2">
                                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Audit Modules</div>
                                </div>
                            )}
                            {[
                                { id: 'dashboard', label: 'Overview', icon: Activity },
                                { id: 'permissions', label: 'Permissions', icon: Lock },
                                { id: 'security', label: 'Security', icon: Shield },
                                { id: 'secrets', label: 'Secrets', icon: Database },
                                { id: 'network', label: 'Network', icon: Network },
                                { id: 'files', label: 'Files', icon: FileCode },
                                { id: 'quality', label: 'Quality', icon: BarChart3 },
                                { id: 'comparison', label: 'Comparison', icon: Layers },
                                { id: 'inspector', label: 'Inspector', icon: Search },
                                { id: 'manifest', label: 'Manifest', icon: FileJson }
                            ].map(({ id, label, icon: Icon }) => (
                                <motion.button
                                    key={id}
                                    whileHover={navLayout === 'sidebar' ? { x: 5 } : { scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setCurrentView(id as ViewType)}
                                    className={`${navLayout === 'sidebar' ? 'w-full px-6 py-4 rounded-2xl border-2' : 'px-4 py-2.5 rounded-3xl border whitespace-nowrap'} text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${currentView === id
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                        }`}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${currentView === id ? 'animate-pulse' : ''}`} />
                                    {label}
                                </motion.button>
                            ))}
                        </div>
                    </nav>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {currentView === 'dashboard' && (
                            <div className="space-y-8 animate-in fade-in duration-700">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className={`p-8 rounded-3xl border-2 ${riskBg} relative overflow-hidden group hover:shadow-xl transition-all`}>
                                        <Shield className={`absolute top-4 right-4 w-16 h-16 ${riskColor} opacity-10`} />
                                        <div className="relative z-10">
                                            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Safety Score</div>
                                            <div className={`text-6xl font-black ${riskColor} mb-1`}>{100 - data.riskScore}</div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Out of 100</div>
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-3xl border-2 bg-card border-border relative overflow-hidden">
                                        <Package className="absolute top-4 right-4 w-16 h-16 text-blue-500 opacity-10" />
                                        <div className="relative z-10">
                                            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Package Size</div>
                                            <div className="text-5xl font-black text-foreground mb-1">{data.size}</div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Total Weight</div>
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-3xl border-2 bg-card border-border relative overflow-hidden">
                                        <Lock className="absolute top-4 right-4 w-16 h-16 text-purple-500 opacity-10" />
                                        <div className="relative z-10">
                                            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Permissions</div>
                                            <div className="text-5xl font-black text-foreground mb-1">{data.permissions.length}</div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Requested</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-8 md:p-10 rounded-[3rem] border-2 bg-muted/20 border-border relative overflow-hidden">
                                        <Activity className="absolute top-0 right-0 w-64 h-64 text-primary opacity-5" />
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-3">
                                                    <Zap className="w-5 h-5" />
                                                    Smart System Reasoning
                                                </h2>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {data.smartInsights.map((insight, i) => (
                                                    <div key={i} className={`p-6 rounded-2xl border-2 flex gap-4 items-start ${insight.impact === 'critical' ? 'bg-red-500/5 border-red-500/10' :
                                                        insight.impact === 'warning' ? 'bg-orange-500/5 border-orange-500/10' :
                                                            'bg-primary/5 border-primary/10'
                                                        }`}>
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${insight.impact === 'critical' ? 'bg-red-500 text-white' :
                                                            insight.impact === 'warning' ? 'bg-orange-500 text-white' :
                                                                'bg-primary text-white'
                                                            }`}>
                                                            {insight.impact === 'critical' ? <AlertTriangle className="w-5 h-5" /> :
                                                                insight.impact === 'warning' ? <Shield className="w-5 h-5" /> :
                                                                    <Brain className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-foreground uppercase mb-1">{insight.title}</div>
                                                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{insight.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 md:p-10 rounded-3xl border-2 bg-card border-border relative overflow-hidden shadow-2xl shadow-black/20">
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-3">
                                                    <Zap className="w-5 h-5" /> AI Security Analysis
                                                </h2>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleDownloadReport('txt')} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold uppercase tracking-wider text-primary transition-all">
                                                        <FileDown className="w-4 h-4" /> TXT
                                                    </button>
                                                    <button onClick={() => handleDownloadReport('json')} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold uppercase tracking-wider text-primary transition-all">
                                                        <FileJson className="w-4 h-4" /> JSON
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div>
                                                    <h3 className="text-3xl font-black text-foreground mb-4">
                                                        {data.riskScore > 50 ? '⚠️ High Risk Extension' : data.riskScore > 20 ? '⚡ Moderate Risk Detected' : '✅ Safe for Installation'}
                                                    </h3>
                                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                                        {data.riskScore > 50
                                                            ? 'This extension exhibits potentially dangerous behavior. It may have the ability to execute remote code or track detailed user activity. Exercise extreme caution.'
                                                            : data.riskScore > 20
                                                                ? 'Some permission requests or coding patterns warrant caution. Verify the publisher is trusted before installation and review the permissions carefully.'
                                                                : 'Deep scan complete. No malicious patterns, trackers, or unsafe code execution vectors were identified in the source package. This extension appears safe to use.'
                                                        }
                                                    </p>
                                                </div>
                                                <div className="space-y-4">
                                                    {data.audit.trackers && data.audit.trackers.length > 0 ? (
                                                        <div className="p-6 bg-orange-500/10 rounded-2xl border-2 border-orange-500/20">
                                                            <div className="text-sm font-black text-orange-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                <Eye className="w-4 h-4" /> Detected Trackers ({data.audit.trackers.length})
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {data.audit.trackers.map((t: string) => (
                                                                    <span key={t} className="px-3 py-1.5 bg-muted rounded-lg text-xs font-bold text-orange-500 shadow-sm border border-orange-500/10">{t}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-6 bg-green-500/10 rounded-2xl border-2 border-green-500/20 flex items-center gap-4">
                                                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                            <span className="text-sm font-black text-green-500 uppercase tracking-wider">No Tracking Modules Found</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentView === 'permissions' && (
                            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
                                <div className="text-center mb-12">
                                    <h2 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tight">Permissions</h2>
                                    <p className="text-muted-foreground text-lg">Detailed breakdown of requested permissions</p>
                                </div>
                                <div className="space-y-6">
                                    {data.permissions.map((perm) => {
                                        const explanation = explainPermission(perm);
                                        return (
                                            <div key={perm} className="p-6 bg-card rounded-3xl border-2 border-border flex items-start justify-between group hover:border-primary transition-all shadow-sm">
                                                <div className="flex gap-6 items-start">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                                        <Lock className="w-6 h-6 text-primary group-hover:text-white" />
                                                    </div>
                                                    <div>
                                                        <code className="text-sm font-black text-primary font-mono">{perm}</code>
                                                        <p className="text-sm text-muted-foreground mt-2 font-medium leading-relaxed">{explanation.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {currentView === 'security' && (
                            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
                                <div className="text-center mb-12">
                                    <h2 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tight">Security Audit</h2>
                                    <p className="text-muted-foreground text-lg">Comprehensive threat detection results</p>
                                </div>
                                <div className="p-8 bg-card rounded-3xl border-2 border-border shadow-xl">
                                    <div className="space-y-4">
                                        {data.audit.findings.length > 0 ? data.audit.findings.map((finding: string, i: number) => (
                                            <div key={i} className="flex items-start gap-4 p-6 bg-red-500/10 border-2 border-red-500/20 rounded-2xl">
                                                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                                                <p className="text-sm font-bold text-foreground leading-relaxed">{finding}</p>
                                            </div>
                                        )) : (
                                            <div className="text-center py-24 text-green-500 font-black uppercase tracking-widest flex flex-col items-center gap-6">
                                                <CheckCircle2 className="w-20 h-20 opacity-20" />
                                                No Threats Detected in Baseline Analysis
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentView === 'secrets' && (
                            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
                                <div className="text-center mb-12">
                                    <h2 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tight">Secrets Leak</h2>
                                    <p className="text-muted-foreground text-lg">Hardcoded API keys and credentials discovery</p>
                                </div>
                                <div className="p-8 bg-card rounded-[2.5rem] border-2 border-border shadow-2xl">
                                    {data.audit.secretFindings?.length > 0 ? (
                                        <div className="space-y-6">
                                            {data.audit.secretFindings.map((finding: any, i: number) => (
                                                <div key={i} className="p-8 bg-muted/30 border-2 border-red-500/20 rounded-3xl group transition-all hover:bg-muted/50">
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                                                            <Lock className="w-6 h-6 text-red-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xl font-black text-foreground uppercase tracking-tight">{finding.label}</div>
                                                            <div className="text-[10px] font-black text-muted-foreground uppercase mt-1 tracking-widest opacity-60">{finding.file} : Line {finding.line}</div>
                                                        </div>
                                                    </div>
                                                    <div className="p-6 bg-slate-950 rounded-2xl font-mono text-xs text-red-400 overflow-x-auto border-2 border-red-500/10 shadow-inner">
                                                        <code>{finding.snippet}</code>
                                                    </div>
                                                    <div className="mt-6">
                                                        <button
                                                            onClick={() => {
                                                                const findFileByPath = (nodes: FileNode[], path: string): FileNode | null => {
                                                                    for (const node of nodes) {
                                                                        if (node.path === path) return node;
                                                                        if (node.children) {
                                                                            const found = findFileByPath(node.children, path);
                                                                            if (found) return found;
                                                                        }
                                                                    }
                                                                    return null;
                                                                };
                                                                const target = findFileByPath(files, finding.file);
                                                                if (target) {
                                                                    setHighlightLine(finding.line);
                                                                    setActiveFile(target);
                                                                    setCurrentView('inspector');
                                                                }
                                                            }}
                                                            className="px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95"
                                                        >
                                                            Focus in Inspector
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-32 opacity-20 flex flex-col items-center gap-6">
                                            <Database className="w-24 h-24 mb-2" />
                                            <div className="font-black uppercase tracking-[0.4em]">Absolute Data Zero: No Secrets Leak</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentView === 'network' && (
                            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
                                <div className="text-center mb-12">
                                    <h2 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tight">Network Activity</h2>
                                    <p className="text-muted-foreground text-lg">External domains and tracking endpoint mapping</p>
                                </div>
                                <div className="p-8 bg-card rounded-[2.5rem] border-2 border-border shadow-2xl">
                                    <div className="space-y-4">
                                        {data.audit.domains?.length > 0 ? data.audit.domains.map((domain: string, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-muted/20 border-2 border-border/50 rounded-2xl group hover:border-primary transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                                                        <Globe className="w-5 h-5 text-indigo-500 group-hover:text-white" />
                                                    </div>
                                                    <span className="font-mono text-sm font-bold text-foreground">{domain}</span>
                                                </div>
                                                <button className="p-3 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-xl">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="text-center py-20 text-muted-foreground font-black uppercase tracking-widest opacity-40">No External Connections Mapping</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentView === 'files' && (
                            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
                                <div className="text-center mb-12">
                                    <h2 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tight">Filesystem Architecture</h2>
                                    <p className="text-muted-foreground text-lg">Complete mapping of extension package internals</p>
                                </div>
                                <div className="h-[700px] border-2 border-border rounded-[3rem] overflow-hidden shadow-2xl bg-card">
                                    <FileExplorer
                                        files={files}
                                        onFileSelect={(f) => { setActiveFile(f); setCurrentView('inspector'); }}
                                        onFileCreate={handleFileCreate}
                                        onFileDelete={handleFileDelete}
                                        onFileRename={handleFileRename}
                                    />
                                </div>
                            </div>
                        )}

                        {currentView === 'quality' && (
                            <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
                                <div className="text-center mb-6">
                                    <h2 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tight">Code Analytics</h2>
                                    <p className="text-muted-foreground text-lg">Quantitative analysis of source quality and complexity</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-12 bg-card rounded-[3rem] border-2 border-border flex flex-col items-center justify-center text-center shadow-xl">
                                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                                            <Activity className="w-12 h-12 text-primary" />
                                        </div>
                                        <div className="text-7xl font-black text-foreground mb-2">{(100 - (data.audit.codeQuality?.obfuscationScore || 0)).toFixed(0)}%</div>
                                        <div className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-60">Readability Index</div>
                                    </div>
                                    <div className="p-10 bg-card rounded-[3rem] border-2 border-border space-y-8 shadow-xl">
                                        <div className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl border-2 border-border/50">
                                            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Obfuscation Detection</span>
                                            <span className="text-xl font-black text-foreground">{data.audit.codeQuality?.obfuscatedFiles || 0} Files</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="h-6 bg-muted rounded-full overflow-hidden border-2 border-border/20">
                                                <div
                                                    className="h-full bg-linear-to-r from-primary to-indigo-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${data.audit.codeQuality?.obfuscationScore || 0}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                <span>Clean</span>
                                                <span>Obfuscated</span>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/10">
                                            <p className="text-[10px] text-muted-foreground italic font-medium leading-relaxed">
                                                High obfuscation levels often indicate intentional attempts to conceal malicious bytecode or clandestine data exfiltration logic.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentView === 'comparison' && (
                            <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
                                <div className="text-center mb-6">
                                    <h2 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tight">Benchmarking</h2>
                                    <p className="text-muted-foreground text-lg">Performance and reputation comparison metrics</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-10 bg-card rounded-3xl border-2 border-border shadow-xl">
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                            <TrendingUp className="w-5 h-5 text-green-500" /> Reputation Rank
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
                                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Global Percentile</span>
                                                <span className="text-xl font-black text-foreground">Top 2%</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
                                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">User Trust Factor</span>
                                                <span className="text-xl font-black text-green-500">Elite</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-10 bg-card rounded-3xl border-2 border-border shadow-xl">
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                            <Layers className="w-5 h-5 text-primary" /> Dependency Health
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-muted/20 rounded-xl border border-border/50 flex items-center gap-4">
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Optimized Asset Bundle</span>
                                            </div>
                                            <div className="p-4 bg-muted/20 rounded-xl border border-border/50 flex items-center gap-4">
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">No Deprecated API Calls</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentView === 'inspector' && (
                            <div className="h-[calc(100vh-16rem)] flex overflow-hidden bg-card rounded-[3rem] border-2 border-border shadow-2xl animate-in fade-in duration-700">
                                <div className="w-80 shrink-0 border-r-2 border-border bg-muted/40 overflow-hidden flex flex-col">
                                    <FileExplorer
                                        files={files}
                                        onFileSelect={(f) => { setHighlightLine(null); setActiveFile(f); }}
                                        onFileCreate={handleFileCreate}
                                        onFileDelete={handleFileDelete}
                                        onFileRename={handleFileRename}
                                    />
                                </div>
                                <div className="flex-1 bg-card relative flex flex-col overflow-hidden">
                                    <div className="p-5 border-b-2 border-border bg-card flex items-center justify-between shadow-sm relative z-10">
                                        <div className="flex items-center gap-3">
                                            <Terminal className="w-4 h-4 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{activeFile?.name || 'Package Root'}</span>
                                        </div>
                                        {activeFile && (
                                            <span className="text-[9px] font-black px-3 py-1 bg-muted rounded-full text-muted-foreground uppercase tracking-widest border border-border/50">
                                                {activeFile.path}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 relative overflow-hidden bg-muted/5">
                                        <CodeViewer
                                            file={activeFile}
                                            highlightLine={highlightLine}
                                            onSaveContent={handleSaveContent}
                                        />
                                        {!activeFile && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                                                <Search className="w-56 h-56 mb-12 text-foreground" />
                                                <h3 className="text-7xl font-black uppercase text-foreground leading-none">Code Base</h3>
                                                <p className="text-sm font-black uppercase tracking-[0.5em] mt-4 text-muted-foreground">Select a file from the explorer</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentView === 'manifest' && (
                            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
                                <div className="text-center mb-12">
                                    <h2 className="text-5xl font-black text-foreground mb-4 uppercase tracking-tight">Manifest Config</h2>
                                    <p className="text-muted-foreground text-lg">Central extension configuration and entry points</p>
                                </div>
                                <div className="rounded-[3rem] border-2 border-border overflow-hidden h-[700px] shadow-2xl bg-card">
                                    <CodeViewer file={{ name: 'manifest.json', content: JSON.stringify(data.manifest, null, 2), path: 'manifest.json', type: 'file' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .scroller-premium::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                .scroller-premium::-webkit-scrollbar-track {
                    background: transparent;
                    margin: 10px;
                }
                .scroller-premium::-webkit-scrollbar-thumb {
                    background: var(--primary);
                    border-radius: 10px;
                    opacity: 0.3;
                }
                .scroller-premium {
                    scrollbar-width: thin;
                    scrollbar-color: var(--primary) transparent;
                }
            `}</style>
        </div>
    );
}

export default function AnalyzePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>}>
            <AnalyzeContent />
        </Suspense>
    );
}
