'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [urlInput, setUrlInput] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    if (urlInput.trim()) {
      router.push(`/demo?url=${encodeURIComponent(urlInput)}`);
    } else {
      router.push('/demo');
    }
  };

  return (
    <main className="min-h-screen bg-[#FBFBF9] text-ink selection:bg-accent-amber/20 selection:text-ink overflow-hidden">

      {/* Navigation - Absolute Minimalist */}
      <nav className="absolute top-0 left-0 right-0 p-6 md:p-12 flex justify-between items-center z-50 pointer-events-none">
        <div className="font-display font-bold text-2xl tracking-tight pointer-events-auto text-ink">Sutra.</div>
        <a
          href="https://chrome.google.com/webstore"
          className="pointer-events-auto font-sans text-xs font-bold tracking-[0.2em] uppercase border-b border-black/10 pb-1 hover:border-black transition-colors text-ink"
        >
          Add to Chrome
        </a>
      </nav>

      {/* Hero Section - The Hook */}
      <section className="min-h-screen flex flex-col justify-center items-center px-6 relative">
        {/* The Thread - A single continuous line starting here */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-black/5 to-black/5" />

        <div className="max-w-4xl mx-auto text-center relative z-10 pt-20">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[14vw] md:text-[9rem] leading-[0.85] tracking-tighter text-ink mb-12"
          >
            Don’t read <br />
            <span className="font-serif italic text-ink-secondary/70">the whole thing.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-lg md:text-xl text-ink-secondary max-w-lg mx-auto mb-16 leading-relaxed font-light"
          >
            The internet is 90% noise. Sutra finds the 10% that matters before you commit your time.
          </motion.p>

          {/* The Input - Refined and Seamless */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl mx-auto relative group z-20"
          >
            <div className="absolute inset-0 bg-white rounded-full shadow-2xl shadow-black/5" />
            <div className="relative flex items-center p-2 h-16">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste an article link..."
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 pl-8 text-lg font-serif placeholder:font-sans placeholder:text-ink-muted/40 text-ink h-full rounded-l-full"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                onClick={handleSubmit}
                className="h-12 px-8 bg-ink text-white rounded-full font-sans text-sm font-bold tracking-wide hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10 mx-1"
              >
                Reveal
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6"
          >
            <a
              href="/demo"
              className="text-sm font-sans text-ink-muted/60 hover:text-ink hover:underline decoration-1 underline-offset-4 transition-all"
            >
              Or paste text directly
            </a>
          </motion.div>
        </div>
      </section>

      {/* The Argument - Pure Typography, Single Column */}
      <section className="py-32 px-6 relative">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-black/5" />

        <div className="max-w-2xl mx-auto relative z-10 bg-[#FBFBF9] py-12">

          <div className="space-y-32">

            {/* Stanza 1 */}
            <FadeIn className="text-center">
              <p className="font-serif text-3xl md:text-5xl leading-tight text-ink">
                Your attention is the only<br /> currency you really have.
              </p>
            </FadeIn>

            {/* Stanza 2 */}
            <FadeIn className="text-center max-w-lg mx-auto">
              <p className="font-sans text-lg text-ink-secondary leading-loose">
                Yet modern interfaces are designed to bankrupt you. They lure you with clickbait, bury you in ads, and fracture your focus.
              </p>
            </FadeIn>

            {/* The Solution */}
            <FadeIn className="text-center border-y border-black/5 py-24 my-16">
              <p className="font-display text-6xl md:text-8xl mb-6 text-ink">Sutra <span className="text-accent-amber/80 text-5xl align-middle font-serif">(सूत्र)</span></p>
              <p className="font-sans text-xs font-bold tracking-[0.3em] uppercase text-ink-muted mb-12">Means "Thread"</p>
              <p className="font-serif text-2xl md:text-3xl text-ink leading-relaxed max-w-2xl mx-auto px-6">
                We built an engine that finds the connecting thread of an article. It scans the page, identifies the core arguments, and fades the rest.
              </p>
            </FadeIn>

            {/* Stanza 3 - The Fork */}
            <div className="relative">
              {/* Visual Split */}
              <div className="absolute left-1/2 -top-12 bottom-0 w-px bg-black/10 hidden md:block" />

              <FadeIn className="grid md:grid-cols-2 gap-12 text-center md:text-left items-start max-w-xl mx-auto bg-[#FBFBF9] relative z-10">
                <div className="md:pr-8 md:text-right group">
                  <div className="inline-block p-3 mb-4 rounded-full bg-black/5 text-ink-muted group-hover:bg-red-50 group-hover:text-red-900 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </div>
                  <span className="block font-sans text-xs font-bold tracking-widest text-ink-muted uppercase mb-4">If the thread is weak</span>
                  <p className="font-serif text-2xl text-ink-secondary leading-tight opacity-60 group-hover:opacity-100 transition-opacity">
                    You move on.<br />You save 10 minutes.
                  </p>
                </div>

                <div className="md:pl-8 group">
                  <div className="inline-block p-3 mb-4 rounded-full bg-accent-amber/10 text-accent-amber group-hover:bg-accent-amber group-hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="block font-sans text-xs font-bold tracking-widest text-accent-amber uppercase mb-4">If the thread is strong</span>
                  <p className="font-serif text-3xl text-ink leading-tight font-medium">
                    You read deeply.<br />Without distractions.
                  </p>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </section>

      {/* The Tool - Visual Demonstration */}
      <section className="py-32 px-6 bg-white border-y border-black/5">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="grid md:grid-cols-2 gap-24 items-center">
            <div className="order-2 md:order-1">
              <h2 className="font-display text-6xl md:text-8xl mb-12 text-ink">Two modes.<br />One purpose.</h2>
              <div className="space-y-16">
                <div className="group cursor-default">
                  <h3 className="font-sans font-bold text-sm uppercase tracking-[0.2em] mb-4 text-accent-amber">01. Scan Mode</h3>
                  <p className="font-serif text-2xl text-ink leading-relaxed">
                    An X-Ray for the web. We highlight core insights and fade the fluff. Understand the structure of an argument in seconds.
                  </p>
                </div>
                <div className="group cursor-default">
                  <h3 className="font-sans font-bold text-sm uppercase tracking-[0.2em] mb-4 text-ink">02. Read Mode</h3>
                  <p className="font-serif text-2xl text-ink leading-relaxed">
                    When you decide to commit, the clutter vanishes. No ads. No popups. Just pure typography that respects the author's work.
                  </p>
                </div>
              </div>
            </div>

            {/* Animated Tool Visual */}
            <ToolVisualizer />
          </FadeIn>
        </div>
      </section>

      {/* Footer - The Challenge */}
      <footer className="py-40 px-6 text-center bg-[#FBFBF9] relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-black/5 to-transparent" />

        <FadeIn>
          <h2 className="font-display text-5xl md:text-7xl text-ink mb-16 tracking-tight">
            Protect your mind.
          </h2>

          <a
            href="https://chrome.google.com/webstore"
            className="inline-flex items-center gap-3 px-10 py-5 bg-ink text-white rounded-full text-lg font-medium hover:scale-105 hover:bg-black transition-all shadow-xl shadow-black/20 font-sans"
          >
            Add to Chrome — It’s Free
          </a>

          <div className="mt-24 text-[10px] font-sans font-bold text-ink-muted tracking-[0.2em] uppercase">
            © 2026 Sutra Inc.
          </div>
        </FadeIn>
      </footer>
    </main>
  );
}

function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ToolVisualizer() {
  const [isScanned, setIsScanned] = useState(false);

  useEffect(() => {
    // Toggle every 3.5 seconds
    const interval = setInterval(() => {
      setIsScanned(prev => !prev);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="order-1 md:order-2 relative aspect-[4/5] bg-[#FBFBF9] border border-black/5 p-12 flex flex-col justify-center shadow-2xl shadow-black/5 overflow-hidden group">
      {/* Background Grid/Noise Pattern - subtle texture */}
      <div className={`absolute inset-0 opacity-[0.03] transition-opacity duration-1000 ${isScanned ? 'opacity-0' : 'opacity-[0.03]'}`}
        style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Top Paragraph Blocks */}
      <div className="space-y-6">
        <div className={`h-4 bg-black/10 w-3/4 rounded-full transition-all duration-1000 ease-in-out ${isScanned ? 'opacity-10 translate-x-2' : 'opacity-40'}`} />
        <div className={`h-4 bg-black/10 w-full rounded-full transition-all duration-1000 delay-75 ease-in-out ${isScanned ? 'opacity-10 translate-x-4' : 'opacity-40'}`} />
        <div className={`h-4 bg-black/10 w-5/6 rounded-full transition-all duration-1000 delay-100 ease-in-out ${isScanned ? 'opacity-10 translate-x-1' : 'opacity-40'}`} />
      </div>

      {/* The Core Insight (The Thread) */}
      <div className="my-12 space-y-6 relative">
        <div className={`transition-all duration-1000 ease-out transform origin-left ${isScanned ? 'scale-105 opacity-100' : 'scale-100 opacity-30 grayscale'}`}>
          <div className="h-6 bg-accent-amber/20 border-l-4 border-accent-amber w-full shadow-sm rounded-r-lg" />
        </div>
        <div className={`transition-all duration-1000 delay-100 ease-out transform origin-left ${isScanned ? 'scale-105 opacity-100 translate-x-2' : 'scale-100 opacity-30 grayscale'}`}>
          <div className="h-6 bg-accent-amber/20 border-l-4 border-accent-amber w-11/12 shadow-sm rounded-r-lg" />
        </div>
      </div>

      {/* Bottom Paragraph Blocks */}
      <div className="space-y-6">
        <div className={`h-4 bg-black/10 w-full rounded-full transition-all duration-1000 delay-150 ease-in-out ${isScanned ? 'opacity-10 translate-x-3' : 'opacity-40'}`} />
        <div className={`h-4 bg-black/10 w-4/5 rounded-full transition-all duration-1000 delay-200 ease-in-out ${isScanned ? 'opacity-10 translate-x-1' : 'opacity-40'}`} />
      </div>

      {/* Floating State Badge */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 transform ${isScanned ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-4'}`}>
        <div className="bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-8 border border-black/5 text-center min-w-[200px]">
          <div className="font-display text-5xl mb-2 text-ink">65%</div>
          <div className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted">Noise Reduced</div>
        </div>
      </div>

      {/* Scanning Line Effect */}
      <div className={`absolute left-0 right-0 h-1 bg-accent-amber/50 blur-sm transition-all duration-[2000ms] ease-linear top-0 ${isScanned ? 'top-[120%] opacity-100' : 'top-[-20%] opacity-0'}`} />
    </div>
  );
}
