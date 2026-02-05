export default function DocsPage() {
    return (
        <div className="min-h-screen bg-linear-to-b from-black to-gray-900 py-24">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-6xl font-headline font-bold mb-8 gradient-text">Documentation</h1>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-3xl font-headline font-bold mb-4">Getting Started</h2>
                        <div className="glass p-6 rounded-xl">
                            <p className="text-gray-300 mb-4">
                                CodeLens is a powerful browser extension that lets you analyze, download, and inspect the source code of any publicly available browser extension.
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                <li>Install CodeLens from your browser's extension store</li>
                                <li>Copy the URL of any extension you want to analyze</li>
                                <li>Paste the URL into CodeLens</li>
                                <li>View source code, security analysis, and more!</li>
                            </ol>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-headline font-bold mb-4">Features</h2>
                        <div className="space-y-4">
                            <div className="glass p-6 rounded-xl">
                                <h3 className="text-xl font-semibold mb-2">🔍 Source Code Viewer</h3>
                                <p className="text-gray-300">
                                    View and navigate extension source code with syntax highlighting, line numbers, and auto-beautification for minified code.
                                </p>
                            </div>

                            <div className="glass p-6 rounded-xl">
                                <h3 className="text-xl font-semibold mb-2">🛡️ Security Analysis</h3>
                                <p className="text-gray-300">
                                    Automated security scanning detects dangerous patterns like eval(), innerHTML, and script injection. Get a security score from 0-100.
                                </p>
                            </div>

                            <div className="glass p-6 rounded-xl">
                                <h3 className="text-xl font-semibold mb-2">📦 Download & Export</h3>
                                <p className="text-gray-300">
                                    Download extension source as ZIP or push directly to GitHub with one click. Perfect for archiving or studying extensions.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-headline font-bold mb-4">Keyboard Shortcuts</h2>
                        <div className="glass p-6 rounded-xl">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <kbd className="px-3 py-1 bg-black rounded text-sm">Ctrl + P</kbd>
                                    <span className="ml-3 text-gray-300">Quick file search</span>
                                </div>
                                <div>
                                    <kbd className="px-3 py-1 bg-black rounded text-sm">Ctrl + F</kbd>
                                    <span className="ml-3 text-gray-300">Find in file</span>
                                </div>
                                <div>
                                    <kbd className="px-3 py-1 bg-black rounded text-sm">Ctrl + K</kbd>
                                    <span className="ml-3 text-gray-300">Command palette</span>
                                </div>
                                <div>
                                    <kbd className="px-3 py-1 bg-black rounded text-sm">Ctrl + B</kbd>
                                    <span className="ml-3 text-gray-300">Toggle sidebar</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-headline font-bold mb-4">Privacy & Security</h2>
                        <div className="glass p-6 rounded-xl">
                            <p className="text-gray-300 mb-4">
                                CodeLens is built with privacy as the top priority:
                            </p>
                            <ul className="space-y-2 text-gray-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-green">✓</span>
                                    <span>All processing happens locally in your browser</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-green">✓</span>
                                    <span>No data is sent to external servers</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-green">✓</span>
                                    <span>No tracking or analytics</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-green">✓</span>
                                    <span>100% open source - verify the code yourself</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-headline font-bold mb-4">Support</h2>
                        <div className="glass p-6 rounded-xl">
                            <p className="text-gray-300 mb-4">
                                Need help? Have questions? We're here for you:
                            </p>
                            <div className="flex flex-col gap-3">
                                <a href="https://github.com/haider-subhan/CodeLens-Extension/issues" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    → Report an issue on GitHub
                                </a>
                                <a href="https://github.com/haider-subhan/CodeLens-Extension/discussions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    → Join the discussion
                                </a>
                                <a href="/" className="text-primary hover:underline">
                                    → Back to homepage
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
