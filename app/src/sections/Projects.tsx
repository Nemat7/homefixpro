import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  { image: '/images/kitchen-after.jpg', title: 'Modern Kitchen Renovation', location: 'Somerset, NJ' },
  { image: '/images/bathroom-after.jpg', title: 'Spa Bathroom Remodel', location: 'Bridgewater, NJ' },
  { image: '/images/living-room.jpg', title: 'Open Concept Living Room', location: 'Hillsborough, NJ' },
  { image: '/images/exterior-home.jpg', title: 'Colonial Exterior Update', location: 'Somerset, NJ' },
  { image: '/images/deck-outdoor.jpg', title: 'Outdoor Deck Build', location: 'Franklin, NJ' },
  { image: '/images/basement-finish.jpg', title: 'Finished Basement', location: 'Somerset, NJ' },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);
  const col3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Heading animation
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { x: -40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Parallax columns
      const cols = [col1Ref.current, col2Ref.current, col3Ref.current];
      cols.forEach((col, i) => {
        if (!col) return;
        const direction = i % 2 === 0 ? -60 : 60;
        gsap.fromTo(
          col,
          { y: direction },
          {
            y: -direction,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="w-full bg-warm-white py-20 lg:py-28 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div ref={headingRef} className="mb-12">
          <p className="section-label mb-3">FEATURED PROJECTS</p>
          <h2 className="font-display font-bold text-charcoal uppercase text-[clamp(1.8rem,4vw,2.8rem)] mb-4">
            OUR CRAFT IN ACTION
          </h2>
          <p className="font-body text-ash-gray max-w-[560px]">
            Browse through our portfolio of completed projects across Somerset and surrounding areas.
          </p>
        </div>

        {/* Widescreen video showcase */}
        <div className="relative w-full rounded-2xl overflow-hidden mb-10 group" style={{ aspectRatio: '16/9' }}>
          <video
            src="/videos/project-showcase.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6">
            <p className="font-body text-[10px] sm:text-xs uppercase tracking-widest text-lava-orange mb-1">Behind the work</p>
            <h3 className="font-display font-bold text-white uppercase text-lg sm:text-2xl leading-tight">
              See Us In Action
            </h3>
          </div>
          <div className="absolute inset-0 rounded-2xl border-[3px] border-transparent group-hover:border-lava-orange transition-all duration-300 pointer-events-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div ref={col1Ref} className="flex flex-col gap-6">
            {projects.slice(0, 2).map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>

          {/* Column 2 */}
          <div ref={col2Ref} className="flex flex-col gap-6 md:mt-12">
            {projects.slice(2, 4).map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>

          {/* Column 3 */}
          <div ref={col3Ref} className="flex flex-col gap-6">
            {projects.slice(4, 6).map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: typeof projects[0] }) {
  return (
    <div className="group relative overflow-hidden rounded-xl cursor-pointer">
      <div className="aspect-[4/3] overflow-hidden rounded-xl">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 rounded-xl border-[3px] border-transparent group-hover:border-lava-orange transition-all duration-300 pointer-events-none"
           style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)' }} />
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="font-display font-bold text-white uppercase text-lg">
          {project.title}
        </h3>
        <p className="font-body text-white/80 text-sm">{project.location}</p>
      </div>
    </div>
  );
}
