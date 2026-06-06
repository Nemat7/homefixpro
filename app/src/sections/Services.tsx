import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Wrench, CookingPot, Bath, Home } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: Wrench,
    title: 'Home Repair',
    description:
      'From leaky faucets to drywall patches, we handle all types of home repairs with precision and care. No job is too small for our skilled team.',
    featured: false,
  },
  {
    icon: CookingPot,
    title: 'Kitchen Remodeling',
    description:
      'Transform the heart of your home with custom cabinetry, modern countertops, and efficient layouts designed around how you live.',
    featured: false,
  },
  {
    icon: Bath,
    title: 'Bathroom Renovation',
    description:
      'Create your personal oasis with updated fixtures, tile work, lighting, and space optimization for maximum comfort and value.',
    featured: true,
  },
  {
    icon: Home,
    title: 'Full Home Renovation',
    description:
      'Breathe new life into older homes with comprehensive renovations — structural updates, electrical, plumbing, and beautiful finishes.',
    featured: false,
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            delay: i * 0.12,
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="w-full bg-parchment py-20 lg:py-28"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <p className="section-label mb-3">OUR SERVICES</p>
          <h2 className="font-display font-bold text-charcoal uppercase text-[clamp(1.8rem,4vw,2.8rem)]">
            WHAT WE DO
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                ref={(el) => { cardsRef.current[i] = el; }}
                className={`bg-cream rounded-xl p-8 card-hover ${
                  service.featured ? 'border-t-4 border-lava-orange' : ''
                }`}
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <div className="w-14 h-14 rounded-lg bg-lava-orange/10 flex items-center justify-center mb-5">
                  <Icon size={28} className="text-lava-orange" />
                </div>
                <h3 className="font-display font-bold text-lg uppercase text-charcoal mb-3">
                  {service.title}
                </h3>
                <p className="font-body text-sm text-ash-gray leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
