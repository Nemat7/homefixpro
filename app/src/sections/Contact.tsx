import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (leftRef.current) {
        gsap.fromTo(
          leftRef.current,
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
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="w-full bg-parchment py-20 lg:py-28"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="bg-charcoal rounded-3xl overflow-hidden">
          <div ref={leftRef} className="p-8 lg:p-12 flex flex-col justify-center">
            <p className="section-label mb-3">GET IN TOUCH</p>
            <h2 className="font-display font-bold text-white uppercase text-[clamp(1.5rem,3.5vw,2.2rem)] leading-tight mb-5">
              READY TO START YOUR PROJECT?
            </h2>
            <p className="font-body text-white/70 leading-relaxed mb-8">
              Contact us today for a free, no-obligation estimate. We'll discuss
              your vision, assess your space, and provide a detailed quote.
            </p>

            <div className="space-y-4 mb-8">
              <a
                href="tel:8483168644"
                className="flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-lava-orange/20 flex items-center justify-center">
                  <Phone size={18} className="text-lava-orange" />
                </div>
                <span className="font-body text-white group-hover:text-lava-orange transition-colors">
                  (848) 316-8644
                </span>
              </a>

              <a
                href="mailto:Fara3320303@gmail.com"
                className="flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-lava-orange/20 flex items-center justify-center">
                  <Mail size={18} className="text-lava-orange" />
                </div>
                <span className="font-body text-white group-hover:text-lava-orange transition-colors">
                  Fara3320303@gmail.com
                </span>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-lava-orange/20 flex items-center justify-center">
                  <MapPin size={18} className="text-lava-orange" />
                </div>
                <span className="font-body text-white/80">
                  24 Leupp Ln, Somerset, NJ 08873
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-lava-orange transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook size={18} className="text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-lava-orange transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} className="text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
