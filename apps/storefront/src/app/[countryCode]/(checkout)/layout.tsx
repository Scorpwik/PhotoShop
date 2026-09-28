import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="checkout-page min-h-screen bg-dark-100 text-text-primary">
      <header className="border-b border-white/10 bg-dark-100">
        <nav className="content-container flex h-20 items-center justify-between">
          <LocalizedClientLink
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-secondary hover:text-accent"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            Volver al carrito
          </LocalizedClientLink>
          <LocalizedClientLink href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-accent/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
              <span className="text-sm font-black tracking-tighter text-dark-100">
                CP
              </span>
            </div>
            <span className="text-xl font-black tracking-tighter text-text-primary">
              CAMERA<span className="text-accent">PRO</span>
            </span>
          </LocalizedClientLink>
        </nav>
      </header>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
