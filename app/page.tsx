import HeroSection from './components/sections/HeroSection';
import FeaturedProjects from './components/sections/FeaturedProjects';
import TechStack from './components/sections/TechStack';
import CTA from './components/sections/CTA';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <section className="px-4 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="gradient-text mb-4 text-4xl font-bold md:text-5xl">Featured Work</h2>
            <p className="text-lg text-gray-300">Showcasing selected projects and digital work.</p>
          </div>
          <FeaturedProjects />
        </div>
      </section>
      <section className="bg-gradient-to-b from-transparent via-brand-slate/20 to-transparent px-4 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl"><TechStack /></div>
      </section>
      <section className="px-4 py-20 md:px-8 md:py-32"><CTA /></section>
    </div>
  );
}
