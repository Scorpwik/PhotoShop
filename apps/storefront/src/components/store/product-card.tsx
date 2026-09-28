"use client"

import { addToCart } from "@lib/data/cart"
import { CatalogProduct } from "@lib/catalog"
import { listProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type ProductCardProps = {
  product: CatalogProduct
  imageHeight?: string
  cover?: boolean
}

type CartStatus = "idle" | "adding" | "added" | "error"

export default function ProductCard({
  product,
  imageHeight = "h-80",
  cover = false,
}: ProductCardProps) {
  const router = useRouter()
  const params = useParams()
  const countryCode = Array.isArray(params.countryCode)
    ? params.countryCode[0]
    : params.countryCode
  const [status, setStatus] = useState<CartStatus>("idle")
  const detailsHref = `/products/${product.handle}`

  useEffect(() => {
    if (status !== "added" && status !== "error") {
      return
    }

    const timer = window.setTimeout(() => setStatus("idle"), 1800)
    return () => window.clearTimeout(timer)
  }, [status])

  const handleAddToCart = async () => {
    if (!countryCode || status === "adding") {
      return
    }

    setStatus("adding")

    try {
      let variantId = product.variantId

      if (!variantId) {
        const { response } = await listProducts({
          countryCode,
          queryParams: { handle: product.handle, limit: 1 },
        })
        variantId = response.products[0]?.variants?.[0]?.id
      }

      if (!variantId) {
        setStatus("error")
        return
      }

      await addToCart({
        variantId,
        quantity: 1,
        countryCode,
      })
      setStatus("added")
      router.refresh()
    } catch {
      setStatus("error")
    }
  }

  const cartLabel =
    status === "adding"
      ? "Agregando..."
      : status === "added"
        ? "Agregado"
        : status === "error"
          ? "Inténtalo de nuevo"
          : "Agregar al Carrito"

  return (
    <div className="group h-full flex flex-col">
      <LocalizedClientLink href={detailsHref} className="block">
        <div
          className={`relative ${imageHeight} overflow-hidden rounded-t-[28px] border border-white/10 bg-dark-200 group-hover:border-accent/40 transition-colors`}
        >
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full group-hover:scale-110 transition-transform duration-500 ${
              cover ? "object-cover" : "object-contain p-4"
            }`}
          />

          {product.badge && (
            <div className="btn-glass-primary absolute top-6 right-6 px-4 py-2 font-black uppercase text-xs tracking-wider">
              {product.badge}
            </div>
          )}

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <span className="btn-glass-primary px-8 py-3 font-black uppercase tracking-wider">
              Ver Detalles
            </span>
          </div>
        </div>
      </LocalizedClientLink>

      <div className="flex flex-1 flex-col gap-3 bg-dark-50/80 backdrop-blur-xl border border-t-0 border-white/10 rounded-b-[28px] p-6">
        <LocalizedClientLink href={detailsHref} className="block space-y-3">
          <p className="text-accent font-bold text-xs uppercase tracking-widest">
            {product.category}
          </p>
          <h3 className="text-lg font-black group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <p className="text-accent font-black text-lg">{product.price}</p>
        </LocalizedClientLink>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={status === "adding"}
          className="btn-glass-primary mt-auto w-full py-3 font-bold uppercase tracking-wider disabled:opacity-60"
        >
          {cartLabel}
        </button>
      </div>
    </div>
  )
}
