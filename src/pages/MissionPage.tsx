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
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Hero Section */}
        <section className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
            We Built What We Wish Existed
          </h1>
          <p className="text-base md:text-lg text-proph-grey-text leading-relaxed">
            We're Carter and Coby. We saw the recruiting process first hand and thought the same thing: there has to be a better way
          </p>
        </section>

        {/* What We Believe */}
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-black mb-8">What We Believe</h2>
          
          <ol className="space-y-4 text-base md:text-lg text-proph-grey-text leading-relaxed">
            <li className="flex gap-3">
              <span className="text-proph-yellow font-bold flex-shrink-0">1.</span>
              <span>Whether you're a D3 prospect in a small town or a D1 prospect in a major city, you deserve a REAL shot</span>
            </li>
            <li className="flex gap-3">
              <span className="text-proph-yellow font-bold flex-shrink-0">2.</span>
              <span>Recruiting should work like a job search - based on fit, skills, and need</span>
            </li>
            <li className="flex gap-3">
              <span className="text-proph-yellow font-bold flex-shrink-0">3.</span>
              <span>Coaches need clarity too</span>
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
        <section className="mb-15">
          <h2 className="text-2xl md:text-3xl font-black mb-6">The Mission</h2>
          <p className="text-base md:text-lg text-proph-grey-text leading-relaxed">
            We're on a mission to make recruiting transparent, accessible, and built on data — not connections.
          </p>
        </section>

        {/* Get in Touch */}
        <section className="mb-15">
          <h2 className="text-2xl md:text-3xl font-black mb-6">Get in Touch</h2>
          <p className="text-base md:text-lg text-proph-grey-text mb-4">
            Email: <a href="mailto:hello@tryproph.com" className="text-proph-yellow hover:text-proph-yellow/80 transition-colors">hello@tryproph.com</a>
          </p>
          <p className="text-base md:text-lg text-proph-grey-text">
            We pride ourselves on getting back to everyone.
          </p>
        </section>
      </main>
    </div>
  );
};

