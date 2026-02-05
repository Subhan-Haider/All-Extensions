'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Globe, Server } from 'lucide-react';

export default function Badges() {
    const badges = [
        { icon: <Shield className="w-4 h-4" />, label: 'Engine', value: 'v2.1 Pro', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { icon: <Lock className="w-4 h-4" />, label: 'Security', value: 'Zero-Log', color: 'text-green-600', bg: 'bg-green-50' },
        { icon: <Globe className="w-4 h-4" />, label: 'License', value: 'MPL 2.0', color: 'text-blue-600', bg: 'bg-blue-50' },
        { icon: <Server className="w-4 h-4" />, label: 'Node', value: 'Distributed', color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <section className="py-12 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-wrap justify-between gap-8 md:gap-4">
                    {badges.map((badge, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 group"
                        >
                            <div className={`w-12 h-12 ${badge.bg} ${badge.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                {badge.icon}
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{badge.label}</p>
                                <p className="font-bold text-gray-900 font-headline">{badge.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
