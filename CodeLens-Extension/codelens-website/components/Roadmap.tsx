'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';

export default function Roadmap() {
    const roadmapItems = [
        { status: 'done', title: 'GitHub Integration', description: 'One-click mirror of extension source to GitHub repos.' },
        { status: 'done', title: 'V3 Core Engine', description: 'Deep analysis support for Manifest V3 and Service Workers.' },
        { status: 'progress', title: 'AI Behavior Narrator', description: 'Real-time plain English summaries of code logic.' },
        { status: 'progress', title: 'Firefox Addons', description: 'Full support for Mozilla XPI packages and AMO links.' },
        { status: 'planned', title: 'Diff Engine', description: 'Visual comparison between extension versions.' },
        { status: 'planned', title: 'Safe Sandbox', description: 'Isolated execution environment for behavioral monitoring.' },
    ];

    return (
        <section className="py-32 bg-[#050505]">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-24">
                    <h2 className="text-sm font-black uppercase tracking-[0.5em] text-primary mb-6">Strategic Path</h2>
                    <h3 className="text-5xl md:text-7xl font-headline font-black leading-none tracking-tighter">
                        Product <span className="gradient-text">Evolution.</span>
                    </h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {roadmapItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`glass p-10 rounded-[40px] border-l-4 ${item.status === 'done' ? 'border-accent-green bg-accent-green/5' :
                                    item.status === 'progress' ? 'border-accent-orange bg-accent-orange/5' :
                                        'border-gray-800'
                                } hover:scale-105 transition-all duration-500 group relative overflow-hidden`}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 glass rounded-2xl">
                                    {item.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-accent-green" /> :
                                        item.status === 'progress' ? <Loader2 className="w-5 h-5 text-accent-orange animate-spin" /> :
                                            <Clock className="w-5 h-5 text-gray-700" />}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${item.status === 'done' ? 'text-accent-green' :
                                        item.status === 'progress' ? 'text-accent-orange' :
                                            'text-gray-600'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                            <h4 className="text-2xl font-headline font-bold mb-4">{item.title}</h4>
                            <p className="text-gray-500 font-light leading-relaxed mb-4">
                                {item.description}
                            </p>

                            {/* Decorative gradient overlay */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
