'use client';

import { useState } from 'react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: 'Is CodeLens really free?',
            answer: 'Yes! CodeLens is 100% free and open source. No hidden fees, no premium tiers, no subscriptions.'
        },
        {
            question: 'Does CodeLens collect my data?',
            answer: 'Absolutely not. CodeLens processes everything locally in your browser. We don\'t track, collect, or store any user data. Zero analytics, zero tracking.'
        },
        {
            question: 'Which browsers are supported?',
            answer: 'CodeLens works on Chrome, Edge, and other Chromium-based browsers. Firefox support is coming soon!'
        },
        {
            question: 'Can I analyze private/unpublished extensions?',
            answer: 'CodeLens can only analyze publicly available extensions from web stores. For local/unpublished extensions, you can manually load the source code.'
        },
        {
            question: 'How accurate is the security scoring?',
            answer: 'Our security scoring analyzes permissions, code patterns, and manifest configurations. While highly accurate, it should be used as a guide alongside manual review for critical applications.'
        },
        {
            question: 'Can I contribute to CodeLens?',
            answer: 'Yes! CodeLens is open source. Check out our GitHub repository to contribute code, report bugs, or suggest features.'
        }
    ];

    return (
        <section className="py-24 bg-muted/20">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-black mb-4 uppercase tracking-tight">
                        <span className="gradient-text">F.A.Q</span>
                    </h2>
                    <p className="text-xl text-muted-foreground font-medium">
                        Common questions about CodeLens
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-card rounded-2xl overflow-hidden border-2 border-border shadow-sm">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                            >
                                <h3 className="text-xl font-black tracking-tight text-foreground pr-8">{faq.question}</h3>
                                <span className={`text-xs transition-transform text-muted-foreground ${openIndex === index ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-6 text-muted-foreground font-medium leading-relaxed">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
