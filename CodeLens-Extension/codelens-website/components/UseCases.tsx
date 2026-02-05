export default function UseCases() {
    const useCases = [
        {
            emoji: '🕵️',
            title: 'Security Researchers',
            description: 'Audit extensions for vulnerabilities, malware, and privacy violations',
            features: ['Deep code analysis', 'Permission auditing', 'Network behavior tracking']
        },
        {
            emoji: '🧑💻',
            title: 'Developers',
            description: 'Learn from other extensions, debug issues, and improve your own code',
            features: ['Source code learning', 'Best practices', 'GitHub integration']
        },
        {
            emoji: '🛡️',
            title: 'Privacy Advocates',
            description: 'Verify extensions respect user privacy and don\'t track behavior',
            features: ['Tracking detection', 'Data collection analysis', 'Privacy scoring']
        },
        {
            emoji: '🎓',
            title: 'Students & Educators',
            description: 'Study real-world extension code and teach secure development',
            features: ['Code examples', 'Security patterns', 'Educational reports']
        }
    ];

    return (
        <section className="py-24 bg-muted/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-headline font-bold mb-4 text-foreground">
                        Who Uses <span className="gradient-text">CodeLens</span>?
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Trusted by security professionals, developers, and privacy advocates worldwide
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {useCases.map((useCase, index) => (
                        <div key={index} className="glass p-8 rounded-2xl hover:border-primary/50 transition-all">
                            <div className="text-6xl mb-4">{useCase.emoji}</div>
                            <h3 className="text-2xl font-headline font-bold mb-3 text-foreground">{useCase.title}</h3>
                            <p className="text-muted-foreground mb-6">{useCase.description}</p>
                            <ul className="space-y-2">
                                {useCase.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-foreground/80">
                                        <span className="text-primary">→</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
