import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createTaxRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

const shippingRules = [
  {
    attribute: "enabled_in_store",
    value: "true",
    operator: "eq" as const,
  },
  {
    attribute: "is_return",
    value: "false",
    operator: "eq" as const,
  },
]

export default async function addEcuadorRegion({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  )

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "countries.iso_2"],
  })

  let ecuador = regions.find((region) =>
    region.countries?.some((country) => country.iso_2 === "ec")
  )

  if (!ecuador) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Ecuador",
            currency_code: "usd",
            countries: ["ec"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    ecuador = result[0]
    logger.info("Región Ecuador creada en USD.")
  } else {
    logger.info(
      `La región Ecuador ya existe (${ecuador.currency_code}).`
    )
  }

  const europe = regions.find((region) =>
    region.countries?.some((country) => country.iso_2 === "dk")
  )
  if (europe && europe.currency_code !== "eur") {
    throw new Error("La región de Dinamarca ya no está en euros.")
  }

  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  })

  if (!taxRegions.some((taxRegion) => taxRegion.country_code === "ec")) {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "ec",
          provider_id: "tp_system",
        },
      ],
    })
    logger.info("Impuesto de Ecuador creado.")
  }

  const { data: fulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: [
      "id",
      "service_zones.id",
      "service_zones.geo_zones.country_code",
      "service_zones.geo_zones.type",
    ],
  })

  const coversEcuador = fulfillmentSets.some((set) =>
    set.service_zones?.some((zone) =>
      zone.geo_zones?.some(
        (geoZone) =>
          geoZone.type === "country" && geoZone.country_code === "ec"
      )
    )
  )

  if (coversEcuador) {
    logger.info("Ecuador ya tiene zona de envío.")
    return
  }

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  })
  const stockLocationId = stockLocations[0]?.id
  if (!stockLocationId) {
    throw new Error("No hay ubicación de inventario para el envío.")
  }

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfileId = shippingProfiles[0]?.id
  if (!shippingProfileId) {
    throw new Error("No hay perfil de envío.")
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Ecuador delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Ecuador",
        geo_zones: [
          {
            country_code: "ec",
            type: "country",
          },
        ],
      },
    ],
  })

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocationId,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  })

  const zoneId = fulfillmentSet.service_zones[0].id
  const prices = [
    {
      currency_code: "usd",
      amount: 10,
    },
    {
      region_id: ecuador.id,
      amount: 10,
    },
  ]

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zoneId,
        shipping_profile_id: shippingProfileId,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices,
        rules: shippingRules,
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zoneId,
        shipping_profile_id: shippingProfileId,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices,
        rules: shippingRules,
      },
    ],
  })

  logger.info("Envío estándar y express creados para Ecuador.")
}
