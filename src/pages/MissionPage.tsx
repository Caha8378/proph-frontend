import React from 'react';
import { useNavigate } from 'react-router-dom';

export const MissionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-proph-black text-proph-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-[70] bg-proph-grey/95 backdrop-blur-sm border-b border-proph-grey-text/20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="active:scale-95 transition-transform">
            <h1 
              className="text-2xl font-extrabold text-proph-yellow" 
              style={{ textShadow: '0 0 10px rgba(255, 236, 60, 0.5)', letterSpacing: '-2px' }}
            >
              Proph
            </h1>
          </button>

          {/* Navigation */}
          <nav className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-proph-white hover:text-proph-yellow transition-colors"
            >
              Home
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <section className="mb-20">
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            We Built What We Wish Existed
          </h1>
          <p className="text-xl md:text-2xl text-proph-grey-text mb-8">
            The smartest path from high school hoops to college ball.
          </p>
          <p className="text-base md:text-lg text-proph-grey-text leading-relaxed">
            We're Carter and Coby. We both went through the recruiting chaos and kept thinking the same thing: there has to be a better way.
          </p>
          <p className="mt-6 text-base md:text-lg text-proph-white font-semibold leading-relaxed">
            We both realized something simple: recruiting shouldn't feel like guessing in the dark.
          </p>
        </section>

        {/* What We Believe */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-black mb-8">What We Believe</h2>
          
          <ol className="space-y-4 text-base md:text-lg text-proph-grey-text leading-relaxed">
            <li className="flex gap-3">
              <span className="text-proph-yellow font-bold flex-shrink-0">1.</span>
              <span>Every player deserves to know where they fit — no more guessing if you're good enough.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-proph-yellow font-bold flex-shrink-0">2.</span>
              <span>D2/D3/NAIA players are underserved, and we're changing that.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-proph-yellow font-bold flex-shrink-0">3.</span>
              <span>Recruiting should work like a job search — based on fit, skills, and need.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-proph-yellow font-bold flex-shrink-0">4.</span>
              <span>Coaches need clarity too — not random emails.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-proph-yellow font-bold flex-shrink-0">5.</span>
              <span>Algorithms don't replace relationships — they enable them.</span>
            </li>
          </ol>
        </section>

        {/* Why Basketball (For Now) */}
        {/* <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Why Basketball (For Now)</h2>
          <p className="text-base md:text-lg text-proph-grey-text leading-relaxed">
            Basketball is the sport we know best. We'll expand eventually, but right now we're focused on fixing basketball recruiting.
          </p>
        </section> */}

        {/* The Mission */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-black mb-6">The Mission</h2>
          <p className="text-xl md:text-2xl text-proph-white font-semibold leading-relaxed">
            Make recruiting transparent, accessible, and built on data — not connections.
          </p>
          {/* <p className="mt-4 text-base md:text-lg text-proph-grey-text leading-relaxed">
            Whether you're a D3 prospect in a small town or a D1 prospect in a major city, you deserve a real shot.
          </p> */}
        </section>

        {/* Get in Touch */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Get in Touch</h2>
          <p className="text-base md:text-lg text-proph-grey-text mb-4">
            Email: <a href="mailto:hello@tryproph.com" className="text-proph-yellow hover:text-proph-yellow/80 transition-colors">hello@tryproph.com</a>
          </p>
          <p className="text-base md:text-lg text-proph-grey-text">
            We read every message.
          </p>
        </section>
      </main>
    </div>
  );
};

