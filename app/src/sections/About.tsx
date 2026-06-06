import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '10+', label: 'Years Experience' },
  { value: '500+', label: 'Projects Completed' },
  { value: '100%', label: 'Client Satisfaction' },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { x: -40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { x: 40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="w-full bg-parchment py-20 lg:py-28"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="bg-cream rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%]">
            {/* Image */}
            <div ref={imageRef} className="relative min-h-[400px] lg:min-h-[600px]">
              <img
                src="/images/about-team.jpg"
                alt="HomeFixPros team member at work site"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-cream/20 lg:to-cream/40" />
            </div>

            {/* Text Content */}
            <div ref={textRef} className="p-8 lg:p-12 flex flex-col justify-center">
              <p className="section-label mb-3">ABOUT US</p>
              <h2 className="font-display font-bold text-charcoal uppercase text-[clamp(1.5rem,3.5vw,2.2rem)] leading-tight mb-6">
                BUILDING TRUST, ONE HOME AT A TIME
              </h2>
              <p className="font-body text-ash-gray leading-relaxed mb-4">
                HomeFixPros LLC is a family-owned construction company serving
                Somerset, NJ and surrounding communities. With over a decade of
                hands-on experience, we've built our reputation on quality
                workmanship, honest pricing, and treating every home like it's our
                own.
              </p>
              <p className="font-body text-ash-gray leading-relaxed mb-8">
                Whether you need a quick repair, a room refresh, or a complete
                home transformation, our licensed and insured team brings the same
                level of dedication to every project. We use premium materials,
                maintain clean job sites, and communicate clearly from start to
                finish.
              </p>

              {/* Stats */}
              <div className="flex gap-6 lg:gap-10 mb-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display font-bold text-lava-orange text-3xl lg:text-4xl">
                      {stat.value}
                    </p>
                    <p className="font-body text-xs text-ash-gray uppercase tracking-wider mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const el = document.querySelector('#contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary self-start"
              >
                Learn More About Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
