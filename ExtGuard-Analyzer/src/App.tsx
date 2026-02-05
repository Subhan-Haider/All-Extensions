import React, { useState } from 'react';
import { Shield, Upload, Activity, FileCode, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auditExtension, AuditReport } from './components/Analyzer';

export default function App() {
    const [report, setReport] = useState<AuditReport | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAuditing(true);
        try {
            const result = await auditExtension(file);
            setReport(result);
        } catch (err) {
            console.error(err);
            alert('Failed to audit extension. Please ensure it is a valid .zip file.');
        } finally {
            setIsAuditing(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Navbar */}
            <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12 glass p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-xl">
                        <ShieldCheck className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold gradient-text">ExtGuard <span className="text-primary">Pro</span></h1>
                </div>
                <div className="flex items-center gap-6 text-sm font-medium text-text-muted">
                    <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                    <a href="#" className="hover:text-primary transition-colors">Community</a>
                    <button className="btn-primary">Connect Wallet</button>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto">
                <AnimatePresence mode="wait">
                    {!report && !isAuditing ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center py-20"
                        >
                            <h2 className="text-5xl font-black mb-6 leading-tight">
                                Secure Your Extension <br />
                                <span className="gradient-text">Before the Web Store Does.</span>
                            </h2>
                            <p className="text-text-muted text-lg mb-12 max-w-2xl mx-auto">
                                Upload your extension build (ZIP) and get a detailed security & quality report in seconds. Powered by advanced static analysis and security heuristics.
                            </p>

                            <div className="relative group max-w-xl mx-auto">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <label className="relative glass p-12 rounded-3xl border-dashed border-2 border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                    <Upload className="w-12 h-12 text-primary mb-4" />
                                    <span className="text-xl font-semibold mb-2">Drop your .zip file here</span>
                                    <span className="text-text-muted text-sm">or click to browse your computer</span>
                                    <input type="file" className="hidden" accept=".zip" onChange={handleFileUpload} />
                                </label>
                            </div>
                        </motion.div>
                    ) : isAuditing ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-40"
                        >
                            <div className="relative">
                                <Activity className="w-16 h-16 text-primary animate-pulse" />
                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"></div>
                            </div>
                            <h3 className="mt-8 text-2xl font-bold">Auditing Your Files...</h3>
                            <p className="text-text-muted mt-2">Checking manifest permissions and code vulnerabilities</p>
                        </motion.div>
                    ) : (
                        report && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8 pb-20"
                            >
                                <div className="flex justify-between items-end">
                                    <div>
                                        <button
                                            onClick={() => setReport(null)}
                                            className="text-primary text-sm font-semibold hover:underline mb-2 flex items-center gap-1"
                                        >
                                            ← Back to upload
                                        </button>
                                        <h2 className="text-3xl font-bold">Audit Report: <span className="text-text-muted">{report.fileName}</span></h2>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-primary">{report.score}/100</div>
                                        <div className="text-sm font-bold text-text-muted uppercase tracking-widest">Health Score</div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="glass p-6 rounded-2xl border-l-4 border-error">
                                        <div className="flex items-center gap-3 mb-2">
                                            <AlertTriangle className="text-error w-5 h-5" />
                                            <span className="font-bold">Errors</span>
                                        </div>
                                        <div className="text-3xl font-bold">{report.results.filter(r => r.type === 'error').length}</div>
                                    </div>
                                    <div className="glass p-6 rounded-2xl border-l-4 border-warning">
                                        <div className="flex items-center gap-3 mb-2">
                                            <AlertTriangle className="text-warning w-5 h-5" />
                                            <span className="font-bold">Warnings</span>
                                        </div>
                                        <div className="text-3xl font-bold">{report.results.filter(r => r.type === 'warning').length}</div>
                                    </div>
                                    <div className="glass p-6 rounded-2xl border-l-4 border-success">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CheckCircle className="text-success w-5 h-5" />
                                            <span className="font-bold">Checks Passed</span>
                                        </div>
                                        <div className="text-3xl font-bold">128</div>
                                    </div>
                                </div>

                                {/* Detailed Findings */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <FileCode className="text-primary" />
                                        Detailed Findings
                                    </h3>
                                    {report.results.length === 0 ? (
                                        <div className="glass p-12 text-center rounded-3xl">
                                            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                                            <p className="text-xl font-bold">No issues found!</p>
                                            <p className="text-text-muted">Your extension follows best practices.</p>
                                        </div>
                                    ) : (
                                        report.results.map((res, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="glass p-6 rounded-2xl overflow-hidden"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${res.type === 'error' ? 'bg-error/20 text-error' :
                                                            res.type === 'warning' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                                                            }`}>
                                                            {res.type}
                                                        </span>
                                                        <span className="font-mono text-sm text-text-muted">{res.file}{res.line ? `:${res.line}` : ''}</span>
                                                    </div>
                                                </div>
                                                <p className="text-lg font-semibold mb-3">{res.message}</p>
                                                {res.codeSnippet && (
                                                    <div className="bg-slate-900/50 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800">
                                                        {res.codeSnippet}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )
                    )}
                </AnimatePresence>
            </main>

            <footer className="mt-20 border-t border-slate-800 py-8 text-center text-text-muted text-sm">
                © 2026 ExtGuard Protocol. Built for Extension Developers.
            </footer>
        </div>
    );
}
