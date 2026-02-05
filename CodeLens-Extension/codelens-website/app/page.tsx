import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Comparison from '@/components/Comparison';
import Installation from '@/components/Installation';
import UseCases from '@/components/UseCases';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="bg-background min-h-screen text-foreground">
      <Hero />
      <div className="py-20">
        <Features />
      </div>
      <div className="py-20 bg-muted/30">
        <Comparison />
      </div>
      <UseCases />
      <Installation />
      <FAQ />
      <Footer />
    </main>
  );
}
