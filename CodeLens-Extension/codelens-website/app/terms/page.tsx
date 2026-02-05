'use client';

import LegalLayout from '@/components/LegalLayout';

export default function TermsPage() {
    return (
        <LegalLayout title="Terms of Service" lastUpdated="January 23, 2026">
            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6">1. Acceptance of Terms</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        By accessing CodeLens ("the Platform"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you must immediately terminate use of the service. These terms constitute a legally binding agreement between you and CodeLens Security.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6">2. Analytical Purpose</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        CodeLens is an educational and diagnostic tool designed to provide security insights into browser extensions. The "Safety Score" and "Risk Analysis" are heuristic automated assessments and do not constitute absolute proof of safety or malice.
                    </p>
                    <div className="mt-6 p-6 bg-slate-50 border-l-4 border-indigo-600 rounded-r-2xl font-bold text-slate-700 italic">
                        Disclaimer: Always cross-reference CodeLens automated results with manual code inspection for critical security decisions.
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6">3. Educational Use Disclaimer</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        The source code analysis provided is for educational and security-research purposes only. You may not use this tool to facilitate unauthorized access or malicious activity.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6">4. Intellectual Property</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        CodeLens respects the IP of extension developers. We do not host extension binaries for redistribution. Our analyzer fetches publicly available packages, performs transient analysis, and generates a security report metadata.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6">5. Limitation of Liability</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        CodeLens Security shall not be held liable for any data loss, browser instability, or security breaches resulting from the use of extensions analyzed on this platform.
                    </p>
                </section>
            </div>
        </LegalLayout>
    );
}
