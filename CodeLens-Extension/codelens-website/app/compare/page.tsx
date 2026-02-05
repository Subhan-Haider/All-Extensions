'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import CompareExtensions from '@/components/CompareExtensions';

export default function ComparePage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="h-24 px-10 border-b border-slate-200 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <Link href="/" className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-colors">
                        <ChevronLeft className="w-6 h-6 text-slate-500" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Extension Comparison</h1>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Side-by-Side Analysis</span>
                    </div>
                </div>
            </header>

            <main className="p-10 max-w-7xl mx-auto">
                <CompareExtensions />
            </main>
        </div>
    );
}
