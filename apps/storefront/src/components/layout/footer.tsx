import LocalizedClientLink from "@modules/common/components/localized-client-link"

const socialLinks = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M14.7 10.4 22 2h-2.2l-6.3 7.2L8.3 2H2l7.7 11.2L2 22h2.2l7-8 5.5 8H22l-7.3-11.6Zm-2.5 2.8-.8-1.2L5 3.5h2.7l5.1 7.4.8 1.2 6.7 9.7H17.5l-5.3-8.6Z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M6.5 9H3.7v11h2.8V9ZM5.1 3.3C4.1 3.3 3.3 4.1 3.3 5s.8 1.7 1.8 1.7 1.8-.8 1.8-1.7-.8-1.7-1.8-1.7ZM20.3 12.7c0-2.6-1.4-4-3.5-4-1.6 0-2.3.8-2.7 1.4V9H11.3c0 1.1 0 11 0 11h2.8v-6.1c0-.3 0-.7.1-1 .3-.7.9-1.4 2-1.4 1.4 0 2 1.1 2 2.6V20h2.8v-7.3Z" />
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer className="bg-dark-50 border-t border-border">
      <div className="max-w-7xl mx-auto px-gutter py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="space-y-6">
            <LocalizedClientLink href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent flex items-center justify-center text-dark-100 font-black text-sm">
                P
              </div>
              <span className="text-xl font-black tracking-tighter">
                CAMERA<span className="text-accent">PRO</span>
              </span>
            </LocalizedClientLink>
            <p className="text-text-secondary text-sm leading-relaxed font-light">
              Equipamiento fotográfico profesional para creadores visuales
              globales.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-text-primary font-black text-sm uppercase tracking-widest">
              TIENDA
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Cámaras", href: "/store?category=camaras" },
                { label: "Lentes", href: "/store?category=lentes" },
                { label: "Accesorios", href: "/store?category=accesorios" },
                { label: "Ofertas", href: "/deals" },
              ].map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink
                    href={link.href}
                    className="text-text-secondary hover:text-accent text-sm transition-colors font-light"
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-text-primary font-black text-sm uppercase tracking-widest">
              COMPAÑÍA
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Acerca de", href: "/about" },
                { label: "Contacto", href: "/contact" },
                { label: "Tienda", href: "/store" },
                { label: "Carrito", href: "/cart" },
              ].map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink
                    href={link.href}
                    className="text-text-secondary hover:text-accent text-sm transition-colors font-light"
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-text-primary font-black text-sm uppercase tracking-widest">
              LEGAL
            </h4>
            <ul className="space-y-3">
              {["Privacidad", "Términos", "Retiros", "Cookies"].map((label) => (
                <li key={label}>
                  <LocalizedClientLink
                    href="/about"
                    className="text-text-secondary hover:text-accent text-sm transition-colors font-light"
                  >
                    {label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-text-secondary text-sm">
            © 2026 CAMERA PRO. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-text-secondary hover:text-accent transition-colors"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
