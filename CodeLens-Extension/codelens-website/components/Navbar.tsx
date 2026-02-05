'use client';

import { useState, useEffect } from 'react';
import { Zap, Search, Settings, Shield, Menu, X, Github, Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Analyze', href: '/' },
        { name: 'Discover', href: '/discover' },
        { name: 'Security', href: '/#features' },
        { name: 'Legal', href: '/terms' },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'h-16 bg-card/80 backdrop-blur-2xl border-b border-border shadow-sm' : 'h-24 bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-border/50">
                        <Image src="/icon.png" alt="CodeLens Logo" width={40} height={40} className="w-10 h-10 object-contain" />
                    </div>
                    <span className="font-black text-2xl tracking-tighter uppercase italic hidden sm:block text-foreground">CodeLens</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-2 bg-muted/50 p-1 rounded-2xl border border-border/50">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pathname === link.href
                                ? 'bg-card text-primary shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/settings"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                    </Link>

                    <a
                        href="https://github.com/haider-subhan/CodeLens-Extension"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex items-center gap-3 px-6 py-3 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10 active:scale-95"
                    >
                        <Github className="w-4 h-4" /> Node Source
                    </a>

                    <button
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-card border-b border-border p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300 md:hidden shadow-2xl">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-lg font-black uppercase tracking-widest border-b border-border pb-4 ${pathname === link.href ? 'text-primary' : 'text-foreground'}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
