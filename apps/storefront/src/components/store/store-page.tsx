"use client"

import {
  CatalogProduct,
  catalogForCountry,
  fetchCatalogProducts,
  mergeCatalog,
} from "@lib/catalog"
import ProductCard from "@components/store/product-card"
import { SlidersHorizontal } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"

const filters = [
  { label: "Todos", value: "all" },
  { label: "Cámaras", value: "camaras" },
  { label: "Lentes", value: "lentes" },
  { label: "Accesorios", value: "accesorios" },
  { label: "Trípodes", value: "tripodes" },
  { label: "Almacenamiento", value: "almacenamiento" },
]

type StorePageProps = {
  title?: string
  subtitle?: string
  dealsOnly?: boolean
}

export default function StorePage({
  title = "TODOS LOS\nPRODUCTOS",
  subtitle = "EXPLORAR",
  dealsOnly = false,
}: StorePageProps) {
  const searchParams = useSearchParams()
  const { countryCode } = useParams<{ countryCode: string }>()
  const categoryFromUrl = searchParams.get("category") || "all"
  const searchQuery = searchParams.get("q") || ""
  const [active, setActive] = useState(categoryFromUrl)
  const [showFilters, setShowFilters] = useState(categoryFromUrl !== "all")
  const [catalog, setCatalog] = useState<CatalogProduct[]>(() =>
    catalogForCountry(countryCode)
  )

  useEffect(() => {
    setActive(categoryFromUrl)
    if (categoryFromUrl !== "all") {
      setShowFilters(true)
    }
  }, [categoryFromUrl])

  useEffect(() => {
    let activeRequest = true
    setCatalog(catalogForCountry(countryCode))

    fetchCatalogProducts(countryCode)
      .then((products) => {
        if (activeRequest && products.length) {
          setCatalog((current) => mergeCatalog(current, products))
        }
      })
      .catch(() => {})

    return () => {
      activeRequest = false
    }
  }, [countryCode])

  const products = useMemo(() => {
    let source = dealsOnly
      ? catalog.filter((product) => product.badge)
      : catalog

    if (active !== "all") {
      source = source.filter((product) => product.categorySlug === active)
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim()
      source = source.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q)
      )
    }

    return source
  }, [active, catalog, dealsOnly, searchQuery])

  const displayTitle = searchQuery
    ? `BÚSQUEDA:\n"${searchQuery}"`
    : title

  return (
    <div className="min-h-screen bg-dark-100 pt-24">
      <section className="border-b border-border py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-gutter space-y-8">
          <div>
            <p className="text-accent font-bold uppercase tracking-widest text-sm mb-4">
              {searchQuery ? "RESULTADOS DE BÚSQUEDA" : subtitle}
            </p>
            <h1 className="text-6xl md:text-7xl font-black leading-tight whitespace-pre-line">
              {displayTitle}
            </h1>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-text-secondary">
              Mostrando {products.length} productos
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 btn-glass px-4 py-2 uppercase tracking-wider font-bold text-sm"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtrar
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActive(filter.value)}
                  className={`px-5 py-2 font-bold uppercase tracking-wider text-sm ${
                    active === filter.value
                      ? "btn-glass-primary"
                      : "btn-glass text-text-secondary"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-gutter">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.handle}
                product={product}
                imageHeight="h-96"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
