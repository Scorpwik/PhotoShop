import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "Created by Medusa",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  const {
    result: [store],
  } = await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Default Store",
          supported_currencies: [
            {
              currency_code: "eur",
              is_default: true,
            },
            {
              currency_code: "usd",
              is_default: false,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "se",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  logger.info("Seeding Ecuador region...");
  const { result: ecuadorRegionResult } = await createRegionsWorkflow(
    container
  ).run({
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
  });
  const ecuadorRegion = ecuadorRegionResult[0];

  await createTaxRegionsWorkflow(container).run({
    input: [
      {
        country_code: "ec",
        provider_id: "tp_system",
      },
    ],
  });

  const ecuadorFulfillmentSet =
    await fulfillmentModuleService.createFulfillmentSets({
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
    });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: ecuadorFulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: ecuadorFulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            region_id: ecuadorRegion.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: ecuadorFulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            region_id: ecuadorRegion.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding Ecuador region.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Cámaras",
          handle: "camaras",
          is_active: true,
        },
        {
          name: "Lentes",
          handle: "lentes",
          is_active: true,
        },
        {
          name: "Trípodes",
          handle: "tripodes",
          is_active: true,
        },
        {
          name: "Accesorios",
          handle: "accesorios",
          is_active: true,
        },
      ],
    },
  });

  const { result: productOptionsResult } = await createProductOptionsWorkflow(
    container
  ).run({
    input: {
      product_options: [
        {
          title: "Presentacion",
          values: ["Estandar"],
        },
      ],
    },
  });
  const presentation = productOptionsResult.find(
    (o) => o.title === "Presentacion"
  )!;

  const imageBase = "http://localhost:8000/products";
  const catalog = [
    {
      title: "Sony α7",
      handle: "sony-alpha-7",
      sku: "SONY-A7",
      category: "camaras",
      description:
        "Cuerpo mirrorless Sony α7 full-frame. Lista para montar el lente que necesites en cada toma.",
      image: `${imageBase}/sony-alpha-7.jpg`,
      badge: "NEW",
      eur: 2498,
      usd: 2698,
    },
    {
      title: "Lentes Sony FE",
      handle: "lentes-sony-fe",
      sku: "SONY-FE-LENSES",
      category: "lentes",
      description:
        "Par de lentes Sony FE para cubrir desde el plano general hasta el detalle.",
      image: `${imageBase}/lentes-sony-fe.jpg`,
      badge: null,
      eur: 1798,
      usd: 1948,
    },
    {
      title: "Sony FE 70-200mm GM OSS",
      handle: "sony-fe-70-200-gm",
      sku: "SONY-FE-70-200-GM",
      category: "lentes",
      description:
        "Teleobjetivo Sony FE 70-200mm f/2.8 GM OSS con estabilización Optical SteadyShot.",
      image: `${imageBase}/sony-fe-70-200.jpg`,
      badge: "HOT",
      eur: 2798,
      usd: 2998,
    },
    {
      title: "Trípode de fibra de carbono",
      handle: "tripode-fibra-carbono",
      sku: "TRIPOD-CARBON",
      category: "tripodes",
      description:
        "Trípode de viaje en fibra de carbono. Compacto cuando se pliega y estable en el set.",
      image: `${imageBase}/tripode-carbono.jpg`,
      badge: null,
      eur: 449,
      usd: 489,
    },
    {
      title: "Kit de fotografía",
      handle: "kit-fotografia",
      sku: "PHOTO-KIT",
      category: "accesorios",
      description:
        "Kit completo: cuerpos, lentes, baterías, trípode y accesorios para salir a grabar.",
      image: `${imageBase}/kit-fotografia.jpg`,
      badge: null,
      eur: 1498,
      usd: 1628,
    },
  ];

  await createProductsWorkflow(container).run({
    input: {
      products: catalog.map((product) => ({
        title: product.title,
        handle: product.handle,
        category_ids: [
          categoryResult.find((cat) => cat.handle === product.category)!.id,
        ],
        description: product.description,
        weight: 800,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile.id,
        thumbnail: product.image,
        images: [{ url: product.image }],
        metadata: {
          category_slug: product.category,
          ...(product.badge ? { badge: product.badge } : {}),
        },
        options: [{ id: presentation.id }],
        variants: [
          {
            title: "Estándar",
            sku: product.sku,
            options: {
              Presentacion: "Estandar",
            },
            prices: [
              {
                amount: product.eur,
                currency_code: "eur",
              },
              {
                amount: product.usd,
                currency_code: "usd",
              },
            ],
          },
        ],
        sales_channels: [
          {
            id: defaultSalesChannel.id,
          },
        ],
      })),
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
