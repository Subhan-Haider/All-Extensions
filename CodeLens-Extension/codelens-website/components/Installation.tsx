export default function Installation() {
    const stores = [
        {
            name: 'Chrome Web Store',
            logo: '🌐',
            url: 'https://chromewebstore.google.com/detail/ehaocblggffmileeoeoiafpfjegonhjj',
            color: 'from-blue-500 to-blue-700'
        },
        {
            name: 'Microsoft Edge Add-ons',
            logo: '🔷',
            url: 'https://microsoftedge.microsoft.com/addons',
            color: 'from-cyan-500 to-blue-600'
        },
        {
            name: 'GitHub Releases',
            logo: '📦',
            url: 'https://github.com/haider-subhan/CodeLens-Extension/releases',
            color: 'from-gray-600 to-gray-800'
        }
    ];

    return (
        <section id="installation" className="py-24 bg-background">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-headline font-bold mb-4">
                        <span className="gradient-text">Get Started</span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Install CodeLens on your favorite browser in seconds
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {stores.map((store, index) => (
                        <a
                            key={index}
                            href={store.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass p-8 rounded-2xl hover:border-primary/50 transition-all transform hover:scale-105 text-center group"
                        >
                            <div className="text-6xl mb-4">{store.logo}</div>
                            <h3 className="text-xl font-headline font-bold mb-4 text-foreground">{store.name}</h3>
                            <div className={`inline-block px-6 py-3 bg-linear-to-r ${store.color} text-white rounded-lg font-semibold group-hover:shadow-lg transition-all`}>
                                Install Now
                            </div>
                        </a>
                    ))}
                </div>

                <div className="glass p-8 rounded-2xl">
                    <h3 className="text-2xl font-headline font-bold mb-6 text-center text-foreground">Quick Start Guide</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary">1</span>
                            </div>
                            <h4 className="font-semibold mb-2 text-foreground">Install Extension</h4>
                            <p className="text-muted-foreground text-sm">Click the install button for your browser</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary">2</span>
                            </div>
                            <h4 className="font-semibold mb-2 text-foreground">Paste Extension Link</h4>
                            <p className="text-muted-foreground text-sm">Copy any extension URL from the web store</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary">3</span>
                            </div>
                            <h4 className="font-semibold mb-2 text-foreground">Analyze & Download</h4>
                            <p className="text-muted-foreground text-sm">View code, check security, export to GitHub</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
