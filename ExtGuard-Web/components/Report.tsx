'use client';

import { AnalysisReport, TestResult, StoreStatus as IStoreStatus } from '@/types';
import { CheckCircle2, AlertTriangle, XCircle, Globe, ShieldAlert, Zap, Cpu, MemoryStick as Memory, FileText, Code, ShieldCheck, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportProps {
    report: AnalysisReport;
}

export default function Report({ report }: ReportProps) {
    const stats = {
        passed: report.results.filter(r => r.status === 'passed').length,
        warnings: report.results.filter(r => r.status === 'warning').length,
        errors: report.results.filter(r => r.status === 'error').length,
    };

    return (
        <div className="w-full space-y-12">
            {/* Summary Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 glass-card p-10 flex flex-col justify-between gap-8 relative overflow-hidden group border border-border/40">
                    <div className="absolute -top-20 -right-20 p-10 opacity-[0.02] pointer-events-none transition-transform duration-1000 group-hover:scale-110">
                        <ShieldCheck className="w-[400px] h-[400px]" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-wrap gap-2">
                            <Badge content="Security Audit" primary />
                            <Badge content={report.type} />
                            <Badge content={`v${report.version}`} />
                            <div className="ml-auto flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                <span className="text-[9px] font-bold text-success uppercase tracking-widest">Authenticated</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground uppercase">{report.extensionName}</h1>
                        <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed font-medium opacity-80">
                            {report.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border/40 relative z-10">
                        <DataPoint label="Latency" value={`${report.performance.loadTime}ms`} />
                        <DataPoint label="Memory" value={`${(report.performance.memoryEstimate / 1024).toFixed(1)}MB`} />
                        <DataPoint label="CPU Load" value={report.performance.cpuImpact} capitalize />
                        <div className="flex items-center gap-6 md:justify-end">
                            <div className="text-center group/stat">
                                <div className="text-4xl font-bold text-destructive tracking-tighter">{stats.errors}</div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Threats</div>
                            </div>
                            <div className="text-center group/stat">
                                <div className="text-4xl font-bold text-warning tracking-tighter">{stats.warnings}</div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Alerts</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-8 space-y-8 flex-1 border border-border/40">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Store Profiles</h3>
                        <div className="space-y-5">
                            <StoreRow label="Chrome Web Store" data={report.readiness.chrome} />
                            <StoreRow label="Firefox Add-ons" data={report.readiness.firefox} />
                            <StoreRow label="Edge Store" data={report.readiness.edge} />
                        </div>
                    </div>

                    {report.readiness.recommendations.length > 0 && (
                        <div className="p-10 rounded-[32px] bg-primary/10 border-2 border-primary/20 space-y-6 premium-blur shadow-2xl shadow-primary/10">
                            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                                <Zap className="w-5 h-5 fill-current" />
                                Action Plan
                            </h3>
                            <ul className="space-y-4">
                                {report.readiness.recommendations.map((rec, i) => (
                                    <li key={i} className="text-sm font-semibold text-muted-foreground flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                        <span className="italic leading-relaxed">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Diagnostic Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-12">
                    <div className="flex items-center justify-between border-b border-border/50 pb-8">
                        <div className="space-y-2">
                            <h3 className="text-4xl font-bold tracking-tight">Technical Diagnostics</h3>
                            <p className="text-muted-foreground font-medium">Deep-dive into individual security probes.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-10 px-4 rounded-xl bg-muted border border-border/50 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                <Search className="w-4 h-4" />
                                {report.results.length} Tests
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {report.results.map((result, i) => (
                            <motion.div
                                key={result.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-8 glass-card card-hover border-t-4 ${result.status === 'passed' ? 'border-success' :
                                    result.status === 'warning' ? 'border-warning' : 'border-destructive'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <span className="px-3 py-1 rounded-lg bg-muted text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border/50">
                                        {result.category}
                                    </span>
                                    <StatusIcon status={result.status} />
                                </div>
                                <h4 className="font-bold text-foreground mb-3 text-xl tracking-tight">{result.name}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium italic opacity-80">"{result.message}"</p>
                                {result.details && (
                                    <div className="mt-8 p-6 rounded-2xl bg-muted/80 font-mono text-[11px] text-primary leading-relaxed overflow-x-auto border border-border/50 shadow-inner">
                                        {result.details}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-12">
                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold tracking-tight text-balance">Compliance Engine</h3>
                        <p className="text-muted-foreground font-medium">Automated legal and privacy artifacts.</p>
                    </div>
                    <div className="glass-card p-10 space-y-10 border-2 border-border/50">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-foreground flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Security Policy
                                </h4>
                                <button className="text-[10px] font-bold uppercase text-primary hover:opacity-70 transition-all px-3 py-1 rounded-lg bg-primary/5 border border-primary/10">Copy Draft</button>
                            </div>
                            <div className="p-8 rounded-[32px] bg-muted/50 text-[12px] font-mono text-muted-foreground h-[500px] overflow-y-auto leading-loose border border-border/50 shadow-inner custom-scrollbar">
                                {report.privacyAutoPolicy}
                            </div>
                        </div>
                        <button className="w-full py-6 rounded-2xl bg-foreground text-background font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-all shadow-2xl hover:scale-[1.02] active:scale-98">
                            Export Certification (JSON)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Badge({ content, primary }: { content: string, primary?: boolean }) {
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border ${primary ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border text-muted-foreground'
            }`}>
            {content}
        </span>
    );
}

function DataPoint({ label, value, capitalize }: { label: string, value: string, capitalize?: boolean }) {
    return (
        <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
            <div className={`text-2xl font-bold text-foreground ${capitalize ? 'capitalize' : ''}`}>{value}</div>
        </div>
    );
}

function StoreRow({ label, data }: { label: string, data: IStoreStatus }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
            <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground">{label}</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Risk: {data.riskScore}</div>
            </div>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${data.status === 'passed' ? 'bg-success/5 border-success/30 text-success' :
                data.status === 'warning' ? 'bg-warning/5 border-warning/30 text-warning' : 'bg-destructive/5 border-destructive/30 text-destructive'
                }`}>
                {data.status}
            </span>
        </div>
    );
}

function StatusIcon({ status }: { status: TestResult['status'] }) {
    switch (status) {
        case 'passed': return <CheckCircle2 className="w-5 h-5 text-success" />;
        case 'warning': return <AlertTriangle className="w-5 h-5 text-warning" />;
        case 'error': return <XCircle className="w-5 h-5 text-destructive" />;
        default: return null;
    }
}
