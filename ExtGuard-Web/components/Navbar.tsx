'use client';

import Link from 'next/link';
import { Shield, Moon, Sun, Menu, X, ArrowRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-6 transition-all duration-500 pointer-events-none ${scrolled ? 'top-4' : 'top-8'}`}>
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`
                    w-full max-w-7xl flex items-center justify-between px-6 py-2.5 rounded-2xl border transition-all duration-500 pointer-events-auto
                    ${scrolled
                        ? 'glass-card shadow-lg premium-blur border-border/40'
                        : 'bg-transparent border-transparent'}
                `}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-all duration-500 group-hover:scale-105">
                        <Shield className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">ExtGuard<span className="text-primary">.</span></span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-1">
                    <NavItem href="/" active={pathname === '/'}>Analyzer</NavItem>
                    <NavItem href="/hub" active={pathname === '/hub'}>Hub</NavItem>
                    <NavItem href="/compare" active={pathname === '/compare'}>Compare</NavItem>
                    <NavItem href="/docs" active={pathname === '/docs'}>Docs</NavItem>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <Link
                        href="/submit"
                        className="hidden md:flex h-10 px-6 items-center gap-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
                    >
                        Submit
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center border border-border/50"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-6 top-32 z-50 p-10 glass-card premium-blur rounded-[40px] lg:hidden flex flex-col gap-8 pointer-events-auto border-2 border-primary/20 shadow-2xl"
                    >
                        <MobileNavLink href="/" onClick={() => setIsOpen(false)}>Analyzer</MobileNavLink>
                        <MobileNavLink href="/hub" onClick={() => setIsOpen(false)}>Verified Hub</MobileNavLink>
                        <MobileNavLink href="/compare" onClick={() => setIsOpen(false)}>Delta Check</MobileNavLink>
                        <MobileNavLink href="/docs" onClick={() => setIsOpen(false)}>Developers</MobileNavLink>
                        <Link
                            href="/submit"
                            onClick={() => setIsOpen(false)}
                            className="flex h-16 items-center justify-center rounded-[24px] bg-primary text-white text-xl font-bold transition-all shadow-xl shadow-primary/30"
                        >
                            Launch Build
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

function NavItem({ href, children, active }: { href: string, children: React.ReactNode, active: boolean }) {
    return (
        <Link
            href={href}
            className={`
                px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                ${active
                    ? 'bg-background text-foreground shadow-md border border-border/50 ring-4 ring-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'}
            `}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, children, onClick }: { href: string, children: React.ReactNode, onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="text-3xl font-bold text-foreground border-b-2 border-border/50 pb-6 group flex items-center justify-between"
        >
            {children}
            <ArrowRight className="w-8 h-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}
