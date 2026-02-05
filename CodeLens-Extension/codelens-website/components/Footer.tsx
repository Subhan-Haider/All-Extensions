import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="bg-card border-t border-border py-20 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="text-center md:text-left">
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-border/50">
                            <Image src="/icon.png" alt="CodeLens Logo" width={32} height={32} className="w-8 h-8 object-contain" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">CodeLens</h3>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-sm font-medium">The elite toolkit for browser extension security. 100% private, on-device analysis.</p>
                </div>
                <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    <a href="/privacy" className="hover:text-indigo-500 transition-colors">Privacy</a>
                    <a href="/terms" className="hover:text-indigo-500 transition-colors">Terms</a>
                    <a href="https://github.com/haider-subhan/CodeLens-Extension" className="hover:text-indigo-500 transition-colors">GitHub Source</a>
                </div>
                <div className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest bg-muted px-4 py-2 rounded-lg border border-border/50">
                    v2.5 // PRODUCTION
                </div>
            </div>
        </footer>
    );
}
