"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  return await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

async function loadRegions() {
  const backend =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  if (!publishableKey) {
    return null
  }

  const response = await fetch(`${backend}/store/regions?limit=50`, {
    headers: {
      "x-publishable-api-key": publishableKey,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  const { regions } = (await response.json()) as {
    regions?: HttpTypes.StoreRegion[]
  }

  return regions ?? null
}

export const getRegion = async (countryCode: string) => {
  const cached = regionMap.get(countryCode)
  if (cached) {
    return cached
  }

  const regions = (await loadRegions()) || (await listRegions())

  if (!regions) {
    return null
  }

  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      if (c?.iso_2) {
        regionMap.set(c.iso_2, region)
      }
    })
  })

  return regionMap.get(countryCode) ?? null
}
