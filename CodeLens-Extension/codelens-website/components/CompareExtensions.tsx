'use client';

import { useState } from 'react';
import { Search, X, Shield, AlertTriangle, TrendingUp } from 'lucide-react';

interface ComparisonData {
    name: string;
    riskScore: number;
    permissions: number;
    trackers: number;
}

export default function CompareExtensions() {
    const [extensions, setExtensions] = useState<ComparisonData[]>([]);
    const [inputUrl, setInputUrl] = useState('');

    const addExtension = () => {
        // Mock data for demonstration
        const mockData: ComparisonData = {
            name: 'Extension ' + (extensions.length + 1),
            riskScore: Math.floor(Math.random() * 100),
            permissions: Math.floor(Math.random() * 20),
            trackers: Math.floor(Math.random() * 5)
        };
        setExtensions([...extensions, mockData]);
        setInputUrl('');
    };

    const removeExtension = (index: number) => {
        setExtensions(extensions.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full">
            <div className="mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">Compare Extensions</h2>
                <p className="text-slate-500">Analyze multiple extensions side-by-side to make informed decisions</p>
            </div>

            <div className="flex gap-3 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Paste extension URL to compare..."
                        className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                </div>
                <button
                    onClick={addExtension}
                    className="px-8 py-4 bg-indigo-600 text-white font-bold uppercase text-xs tracking-wider rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    Add to Compare
                </button>
            </div>

            {extensions.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Extension</th>
                                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-500">Risk Score</th>
                                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-500">Permissions</th>
                                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-500">Trackers</th>
                                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {extensions.map((ext, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{ext.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className={`text-2xl font-black ${ext.riskScore > 50 ? 'text-red-600' : ext.riskScore > 30 ? 'text-orange-600' : 'text-green-600'}`}>
                                                    {100 - ext.riskScore}
                                                </div>
                                                {ext.riskScore > 50 ? (
                                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                                ) : (
                                                    <Shield className="w-5 h-5 text-green-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-bold text-slate-700">{ext.permissions}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-lg font-bold ${ext.trackers > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                {ext.trackers}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => removeExtension(index)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                            >
                                                <X className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {extensions.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Add extensions to start comparing</p>
                </div>
            )}
        </div>
    );
}
