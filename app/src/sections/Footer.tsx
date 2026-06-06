const quickLinks = ['Services', 'Projects', 'About', 'Contact', 'Privacy Policy'];

const serviceAreas = [
  'Somerset',
  'Bridgewater',
  'Hillsborough',
  'Franklin Township',
  'Surrounding NJ areas',
];

export default function Footer() {
  const handleNavClick = (label: string) => {
    const href = label === 'Privacy Policy' ? '#' : `#${label.toLowerCase()}`;
    if (href === '#') return;
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-charcoal pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Column 1 - Logo & Tagline */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/images/logo.png"
                alt="HomeFixPros LLC"
                className="h-14 w-auto"
              />
              <span className="font-display font-bold text-2xl text-lava-orange tracking-tight">
                HomeFixPros
              </span>
            </div>
            <p className="font-body text-ash-gray text-sm uppercase tracking-wider">
              Repair · Remodel · Renovate
            </p>
            <p className="font-body text-ash-gray/70 text-sm mt-4 leading-relaxed">
              Family-owned construction company serving New Jersey with quality
              craftsmanship since 2015.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="font-display font-bold text-white uppercase text-sm tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link}>
                  <button
                    onClick={() => handleNavClick(link)}
                    className="font-body text-ash-gray hover:text-lava-orange transition-colors duration-300 text-sm"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Service Areas */}
          <div>
            <h4 className="font-display font-bold text-white uppercase text-sm tracking-wider mb-5">
              Service Areas
            </h4>
            <ul className="space-y-3">
              {serviceAreas.map((area) => (
                <li key={area}>
                  <span className="font-body text-ash-gray text-sm">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-body text-ash-gray/60 text-xs">
              © 2025 HomeFixPros LLC. All rights reserved.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-body text-ash-gray/80 text-xs uppercase tracking-wider">
                Licensed & Insured
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
