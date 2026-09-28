"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProductBack() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-secondary hover:text-accent"
    >
      <ArrowLeft className="h-4 w-4" />
      Volver
    </button>
  )
}
