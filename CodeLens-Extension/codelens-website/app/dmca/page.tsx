'use client';

import LegalLayout from '@/components/LegalLayout';
import { Send } from 'lucide-react';

export default function DMCAPage() {
    return (
        <LegalLayout title="DMCA Takedown" lastUpdated="January 23, 2026">
            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Copyright Notice</h2>
                    <p className="text-slate-600 leading-relaxed font-medium mb-8">
                        CodeLens is committed to respecting the intellectual property rights of others. We operate as a search engine and analytical tool for public web content. If you believe your copyrighted work has been indexed or analyzed in a way that constitutes infringement, please submit a formal notice below.
                    </p>

                    <div className="bg-slate-50 border-2 border-slate-200 rounded-4xl p-10">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8">Formal Takedown Request</h3>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                                    <input type="text" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-bold" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                                    <input type="email" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-bold" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Infringing URL (CodeLens Analysis Link)</label>
                                <input type="text" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-bold" placeholder="https://codelens.sec/analyze?id=..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Statement of Infringement</label>
                                <textarea className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-bold min-h-[150px]" placeholder="Decribe the copyrighted work and the infringement..."></textarea>
                            </div>
                            <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                                Submit Formal Notice <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Counter Notification</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        If you believe that your extension analysis was removed by mistake or misidentification, you may submit a counter-notification to dmca@codelens.sec.
                    </p>
                </section>
            </div>
        </LegalLayout>
    );
}
