"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Menu, Search, ShoppingBag, X, ArrowRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { catalogProducts, CatalogProduct, fetchCatalogProducts } from "@lib/catalog"

type NavbarProps = {
  cartCount?: number
}

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [catalog, setCatalog] = useState<CatalogProduct[]>(catalogProducts)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const countryCode = (params?.countryCode as string) || "dk"

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

  useEffect(() => {
    fetchCatalogProducts()
      .then((products) => {
        if (products.length) setCatalog(products)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/${countryCode}/store?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  const suggestions = searchQuery.trim()
    ? catalog
        .filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
        .slice(0, 4)
    : []

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-100/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-full px-gutter py-6 flex items-center justify-between gap-4">
        <LocalizedClientLink href="/" className="flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-full bg-accent/80 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <span className="text-dark-100 font-black text-lg tracking-tighter">
              P
            </span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-text-primary">
            CAMERA<span className="text-accent">PRO</span>
          </span>
        </LocalizedClientLink>

        {/* Desktop Nav Items (hidden when search is open) */}
        {!isSearchOpen && (
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
        )}

        {/* Search Bar when open */}
        {isSearchOpen && (
          <div className="relative flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cámaras, lentes, accesorios..."
                className="w-full bg-dark-50 border border-accent/50 focus:border-accent text-text-primary text-sm rounded-full py-2.5 pl-11 pr-10 outline-none transition-all shadow-lg"
              />
              <Search className="w-5 h-5 text-accent absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false)
                  setSearchQuery("")
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
                aria-label="Cerrar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-dark-50/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-2 space-y-1">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        router.push(`/${countryCode}/store?q=${encodeURIComponent(product.name)}`)
                        setIsSearchOpen(false)
                        setSearchQuery("")
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-dark-100 text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg bg-dark-100"
                          />
                        )}
                        <div>
                          <p className="text-text-primary font-bold text-sm group-hover:text-accent transition-colors">
                            {product.name}
                          </p>
                          <p className="text-text-secondary text-xs">{product.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-accent font-black text-sm">{product.price}</span>
                        <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-6">
          {!isSearchOpen && (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center text-text-secondary hover:text-accent transition-colors p-1"
              aria-label="Abrir búsqueda"
            >
              <Search className="w-6 h-6" />
            </button>
          )}

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

