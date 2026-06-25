import { useRef, useEffect } from 'react';
import { ScrollTransition } from '@/lib/effects/ScrollTransition';

const scenes = [
  {
    image: '/images/hero-3d-topo.jpg',
    title: 'Credit Monitoring',
    description:
      'Real-time balance tracking across all your cards. Get instant visibility into spending patterns, credit utilization, and payment history from Amex, CIBC, Scotiabank, and more.',
  },
  {
    image: '/images/data-stream.jpg',
    title: 'Automated Payments',
    description:
      'Never miss a due date again. Set up automatic minimum or full balance payments. Get smart reminders 3 days before each due date with one-tap payment execution.',
  },
  {
    image: '/images/fiber-optic.jpg',
    title: 'Flow Analytics',
    description:
      'Visualize your financial flow with beautiful, real-time charts. Track spending velocity, identify savings opportunities, and optimize your credit strategy for maximum rewards.',
  },
];

export default function ServiceEcosystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<ScrollTransition | null>(null);

  useEffect(() => {
    if (containerRef.current && !transitionRef.current) {
      transitionRef.current = new ScrollTransition(containerRef.current, {
        images: scenes.map((s) => s.image),
        labels: scenes.map((s) => ({ title: s.title, description: s.description })),
      });
    }
    return () => {
      transitionRef.current?.destroy();
      transitionRef.current = null;
    };
  }, []);

  return (
    <section id="ecosystem" className="relative w-full bg-black">
      <div className="h-[40vh] flex items-end justify-center pb-16">
        <div className="text-center">
          <p className="font-mono-data text-xs tracking-[0.15em] text-zinc-600 uppercase mb-4">
            Service Ecosystem
          </p>
          <h2
            className="text-4xl md:text-5xl font-semibold text-white"
            style={{ letterSpacing: '-0.01em' }}
          >
            Three Pillars of Control
          </h2>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[80vh] overflow-hidden"
        style={{ background: '#000' }}
      />

      <div className="h-[20vh]" />
    </section>
  );
}
