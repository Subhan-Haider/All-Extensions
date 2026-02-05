'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { detectStore } from '@/lib/extension-utils';

export default function SearchBar() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!url.trim()) {
            setError('Please enter a valid URL.');
            return;
        }

        setLoading(true);

        // Small timeout to allow state to update
        setTimeout(() => {
            const info = detectStore(url);
            if (!info) {
                setError('Invalid or unsupported store URL. Please use Chrome, Edge, or Firefox Web Store links.');
                setLoading(false);
                return;
            }

            router.push(`/analyze?url=${encodeURIComponent(info.url)}`);
        }, 100);
    };

    return (
        <div className="w-full relative">
            <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste extension store URL..."
                        className={`w-full bg-card border ${error ? 'border-red-300 ring-2 ring-red-100/20' : 'border-border'} rounded-2xl pl-14 pr-6 py-5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg font-medium shadow-sm`}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-5 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/10 min-w-[180px]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Analysis...</span>
                        </>
                    ) : 'Analyze Now'}
                </button>
            </form>

            {error && (
                <div className="absolute top-full left-0 right-0 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-semibold flex items-center justify-center shadow-sm animate-in fade-in slide-in-from-top-2 z-20">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}
        </div>
    );
}
