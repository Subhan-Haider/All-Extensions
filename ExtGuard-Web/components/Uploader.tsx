'use client';

import { useState } from 'react';
import { Upload, X, Loader2, ShieldCheck, AlertCircle, FileArchive, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisReport } from '@/types';

interface UploaderProps {
    onReport: (report: AnalysisReport) => void;
}

export default function Uploader({ onReport }: UploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processFile = async (selectedFile: File) => {
        if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
            setError('Please upload a .zip extension package.');
            return;
        }

        setError(null);
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to analyze package.');
            }

            const report = await response.json();
            onReport(report);
        } catch (error: any) {
            console.error(error);
            setError(error.message || 'An error occurred during analysis.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full">
            <motion.div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) processFile(file); }}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className={`
                    relative group cursor-pointer overflow-hidden rounded-[32px] border-2 transition-all duration-500
                    flex flex-col items-center justify-center p-12 md:p-16 text-center min-h-[380px]
                    ${isDragging ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' : 'border-border/40 bg-card/20 hover:bg-card/40 hover:border-primary/40'}
                    ${isUploading ? 'pointer-events-none border-primary/40' : ''}
                    premium-blur
                `}
                onClick={() => document.getElementById('fileInput')?.click()}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] bg-size-[24px_24px]" />

                {isUploading && <div className="scan-line" />}

                <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    accept=".zip"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) processFile(file); }}
                />

                <AnimatePresence mode="wait">
                    {isUploading ? (
                        <motion.div
                            key="uploading"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-8"
                        >
                            <div className="relative flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 rounded-full border-[3px] border-t-primary border-r-primary/20 border-b-primary/10 border-l-primary/20"
                                />
                                <ShieldCheck className="absolute w-10 h-10 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold tracking-tight text-foreground">Analyzing Assets</h3>
                                <p className="text-base text-muted-foreground font-medium opacity-80">Decompiling bytecode and auditing permissions...</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-8 relative z-10"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm transition-all group-hover:bg-primary group-hover:text-white">
                                <ArrowUp className="w-10 h-10" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-bold tracking-tight text-foreground">Upload Package</h3>
                                <p className="text-lg text-muted-foreground font-medium max-w-sm text-balance opacity-80">
                                    Drop your extension .zip here or <span className="text-primary font-bold hover:underline">browse</span> to begin.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="px-4 py-1.5 rounded-lg bg-muted/40 border border-border/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">MV2/MV3 Supported</div>
                                <div className="px-4 py-1.5 rounded-lg bg-muted/40 border border-border/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Private Audit</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-8 left-8 right-8 p-6 rounded-3xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm font-bold flex items-center justify-between gap-4 backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6" />
                            <span className="text-lg">{error}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setError(null); }} className="p-2 hover:bg-destructive/10 rounded-xl transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
