import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Sarah M.',
    rating: 5,
    text: 'HomeFixPros transformed our outdated kitchen into a space we actually want to spend time in. The team was professional, punctual, and the craftsmanship exceeded our expectations. Highly recommend!',
  },
  {
    name: 'James & Linda K.',
    rating: 5,
    text: "We hired them for a full bathroom renovation and couldn't be happier. They handled everything from permits to the final cleanup. The attention to detail was remarkable.",
  },
  {
    name: 'Robert T.',
    rating: 5,
    text: 'After a water damage situation, HomeFixPros came in and not only fixed the problem but made the space look better than before. Fast, fair pricing, and great communication throughout.',
  },
  {
    name: 'The Henderson Family',
    rating: 5,
    text: 'From our initial consultation to the final walkthrough, the entire experience was seamless. Our deck is now the favorite gathering spot for family barbecues.',
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (cardsContainerRef.current) {
        gsap.fromTo(
          cardsContainerRef.current.children,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="w-full bg-parchment py-20 lg:py-28"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <p className="section-label mb-3">TESTIMONIALS</p>
          <h2 className="font-display font-bold text-charcoal uppercase text-[clamp(1.8rem,4vw,2.8rem)]">
            WHAT OUR CLIENTS SAY
          </h2>
        </div>

        {/* Desktop Grid */}
        <div
          ref={cardsContainerRef}
          className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} testimonial={t} />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((t) => (
                <div key={t.name} className="w-full flex-shrink-0 px-1">
                  <TestimonialCard testimonial={t} />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="p-2 rounded-full border border-ash-gray text-ash-gray hover:bg-charcoal hover:text-white hover:border-charcoal transition-all duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'bg-lava-orange w-6' : 'bg-ash-gray/40'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-2 rounded-full border border-ash-gray text-ash-gray hover:bg-charcoal hover:text-white hover:border-charcoal transition-all duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div
      className="bg-cream rounded-xl p-6 lg:p-8 h-full flex flex-col"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} size={16} className="text-molten-gold fill-molten-gold" />
        ))}
      </div>
      <p className="font-body text-ash-gray leading-relaxed flex-1 mb-5 text-sm">
        &ldquo;{testimonial.text}&rdquo;
      </p>
      <p className="font-body font-semibold text-charcoal text-sm">
        — {testimonial.name}
      </p>
    </div>
  );
}
