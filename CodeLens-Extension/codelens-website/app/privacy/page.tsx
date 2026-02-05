'use client';

import LegalLayout from '@/components/LegalLayout';

export default function PrivacyPage() {
    return (
        <LegalLayout title="Privacy Policy" lastUpdated="January 23, 2026">
            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6">1. Data Minimization</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        At CodeLens, we prioritize your privacy. We do not require account registration for basic analysis. We do not track individual browsing history or personal identity beyond necessary technical logs required to prevent service abuse.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6">2. Extension Source Code</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        When you analyze an extension, the source code is processed in a transient memory buffer. CodeLens does not store extension source code permanently in our databases. Analysis reports (metadata, risk scores, and findings) are cached to optimize service performance.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6">3. Tracking & Cookies</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        This site uses minimal functional cookies to maintain state during analysis. We do not use cross-site tracking pixels or sell your data to third-party advertisers.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6">4. Reporting Malice</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        If our automated systems flag an extension as "High Risk", this information is shared with the community to prevent widespread security incidents. No user-identifiable information is attached to these public risk reports.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-6">5. Your Rights</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        You have the right to request the deletion of any cached analysis reports associated with your extensions. Contact our privacy officer at privacy@codelens.sec.
                    </p>
                </section>
            </div>
        </LegalLayout>
    );
}
