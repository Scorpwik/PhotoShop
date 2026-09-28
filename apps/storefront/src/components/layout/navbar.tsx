"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Menu, Search, ShoppingBag, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"

type NavbarProps = {
  cartCount?: number
}

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const hideInicio =
    pathname === "/" ||
    /^\/[a-z]{2}\/?$/.test(pathname) ||
    pathname.includes("/checkout")

  const navItems = [
    ...(hideInicio ? [] : [{ label: "INICIO", href: "/" }]),
    { label: "CÁMARAS", href: "/store?category=camaras" },
    { label: "LENTES", href: "/store?category=lentes" },
    { label: "ACCESORIOS", href: "/store?category=accesorios" },
    { label: "OFERTAS", href: "/deals" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-100 border-b border-border">
      <div className="max-w-full px-gutter py-6 flex items-center justify-between">
        <LocalizedClientLink href="/" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/80 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <span className="text-dark-100 font-black text-lg tracking-tighter">
              CP
            </span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-text-primary">
            CAMERA<span className="text-accent">PRO</span>
          </span>
        </LocalizedClientLink>

        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <LocalizedClientLink
              key={item.href}
              href={item.href}
              className="text-text-secondary hover:text-accent font-bold text-sm tracking-wide transition-colors duration-200 uppercase"
            >
              {item.label}
            </LocalizedClientLink>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <LocalizedClientLink
            href="/store"
            className="hidden md:flex text-text-secondary hover:text-accent transition-colors"
            aria-label="Buscar"
          >
            <Search className="w-6 h-6" />
          </LocalizedClientLink>

          <LocalizedClientLink href="/cart" className="relative group">
            <ShoppingBag className="w-6 h-6 text-text-primary group-hover:text-accent transition-colors" />
            <span className="absolute -top-2 -right-2 btn-glass-primary text-xs font-black w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          </LocalizedClientLink>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-text-primary hover:text-accent transition-colors"
            aria-label="Abrir menú"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-dark-50 border-t border-border">
          <div className="px-gutter py-8 space-y-6">
            {navItems.map((item) => (
              <LocalizedClientLink
                key={item.href}
                href={item.href}
                className="block text-text-secondary hover:text-accent font-bold text-sm uppercase tracking-wide transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
