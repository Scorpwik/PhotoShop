import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  deleteProductsWorkflow,
} from "@medusajs/medusa/core-flows";

const IMAGE_BASE = "http://localhost:8000/products";

const cameraProducts = [
  {
    title: "Sony α7",
    handle: "sony-alpha-7",
    sku: "SONY-A7",
    category: "Cámaras",
    categoryHandle: "camaras",
    description:
      "Cuerpo mirrorless Sony α7 full-frame. Lista para montar el lente que necesites en cada toma.",
    image: `${IMAGE_BASE}/sony-alpha-7.jpg`,
    badge: "NEW",
    eur: 2498,
    usd: 2698,
    material: "Aleación de magnesio",
    origin_country: "JP",
    weight: 474,
    length: 127,
    width: 94,
    height: 48,
  },
  {
    title: "Lentes Sony FE",
    handle: "lentes-sony-fe",
    sku: "SONY-FE-LENSES",
    category: "Lentes",
    categoryHandle: "lentes",
    description:
      "Par de lentes Sony FE para cubrir desde el plano general hasta el detalle.",
    image: `${IMAGE_BASE}/lentes-sony-fe.jpg`,
    badge: null,
    eur: 1798,
    usd: 1948,
    material: "Aluminio y cristal ED",
    origin_country: "JP",
    weight: 520,
    length: 70,
    width: 70,
    height: 105,
  },
  {
    title: "Sony FE 70-200mm GM OSS",
    handle: "sony-fe-70-200-gm",
    sku: "SONY-FE-70-200-GM",
    category: "Lentes",
    categoryHandle: "lentes",
    description:
      "Teleobjetivo Sony FE 70-200mm f/2.8 GM OSS con estabilización Optical SteadyShot.",
    image: `${IMAGE_BASE}/sony-fe-70-200.jpg`,
    badge: "HOT",
    eur: 2798,
    usd: 2998,
    material: "Magnesio sellado",
    origin_country: "JP",
    weight: 1480,
    length: 88,
    width: 88,
    height: 200,
  },
  {
    title: "Trípode de fibra de carbono",
    handle: "tripode-fibra-carbono",
    sku: "TRIPOD-CARBON",
    category: "Trípodes",
    categoryHandle: "tripodes",
    description:
      "Trípode de viaje en fibra de carbono. Compacto cuando se pliega y estable en el set.",
    image: `${IMAGE_BASE}/tripode-carbono.jpg`,
    badge: null,
    eur: 449,
    usd: 489,
    material: "Fibra de carbono",
    origin_country: "DE",
    weight: 1250,
    length: 420,
    width: 90,
    height: 90,
  },
  {
    title: "Kit de fotografía",
    handle: "kit-fotografia",
    sku: "PHOTO-KIT",
    category: "Accesorios",
    categoryHandle: "accesorios",
    description:
      "Kit completo: cuerpos, lentes, baterías, trípode y accesorios para salir a grabar.",
    image: `${IMAGE_BASE}/kit-fotografia.jpg`,
    badge: null,
    eur: 1498,
    usd: 1628,
    material: "Nylon balístico y aleación",
    origin_country: "JP",
    weight: 3450,
    length: 450,
    width: 300,
    height: 200,
  },
];

const allowedHandles = new Set(cameraProducts.map((product) => product.handle));

export default async function createCameraProducts({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "name", "default_sales_channel_id"],
  });
  const salesChannelId = stores[0]?.default_sales_channel_id;
  if (!salesChannelId) {
    throw new Error("No hay canal de ventas por defecto en la tienda.");
  }

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  });
  const shippingProfileId = shippingProfiles[0]?.id;
  if (!shippingProfileId) {
    throw new Error("No hay perfil de envío. El catálogo no se puede publicar.");
  }

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  const stockLocationId = stockLocations[0]?.id;

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title"],
  });

  const extraIds = existingProducts
    .filter((product) => !allowedHandles.has(product.handle))
    .map((product) => product.id);

  if (extraIds.length) {
    await deleteProductsWorkflow(container).run({
      input: { ids: extraIds },
    });
    logger.info(`Se quitaron ${extraIds.length} productos que no pertenecen al catálogo.`);
  }

  const existingHandles = new Set(
    existingProducts
      .filter((product) => allowedHandles.has(product.handle))
      .map((product) => product.handle)
  );

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle"],
  });

  const categories = new Map(
    existingCategories.map((category) => [category.handle, category])
  );

  const missingCategories = [
    { name: "Cámaras", handle: "camaras" },
    { name: "Lentes", handle: "lentes" },
    { name: "Trípodes", handle: "tripodes" },
    { name: "Accesorios", handle: "accesorios" },
  ].filter((category) => !categories.has(category.handle));

  if (missingCategories.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCategories.map((category) => ({
          name: category.name,
          handle: category.handle,
          is_active: true,
        })),
      },
    });

    for (const category of result) {
      categories.set(category.handle, category);
    }
  }

  const pending = cameraProducts.filter(
    (product) => !existingHandles.has(product.handle)
  );

  if (!pending.length) {
    logger.info("Los 5 productos ya existen.");
  } else {
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
      (option) => option.title === "Presentacion"
    );
    if (!presentation) {
      throw new Error("No se pudo crear la opción del producto.");
    }

    const { result: created } = await createProductsWorkflow(container).run({
      input: {
        products: pending.map((product) => ({
          title: product.title,
          handle: product.handle,
          description: product.description,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfileId,
          thumbnail: product.image,
          category_ids: [categories.get(product.categoryHandle)!.id],
          images: [{ url: product.image }],
          metadata: {
            category_slug: product.categoryHandle,
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
                { amount: product.eur, currency_code: "eur" },
                { amount: product.usd, currency_code: "usd" },
              ],
            },
          ],
          sales_channels: [{ id: salesChannelId }],
        })),
      },
    });

    logger.info(
      `Productos creados: ${created.map((product) => product.title).join(", ")}`
    );
  }

  if (!stockLocationId) {
    logger.warn("No hay ubicación de inventario. Los productos quedan sin stock.");
    return;
  }

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  });
  const { data: levels } = await query.graph({
    entity: "inventory_level",
    fields: ["inventory_item_id", "location_id"],
  });

  const skus = new Set(cameraProducts.map((product) => product.sku));
  const covered = new Set(
    levels
      .filter((level) => level.location_id === stockLocationId)
      .map((level) => level.inventory_item_id)
  );

  const inventoryLevels = inventoryItems
    .filter((item) => skus.has(item.sku) && !covered.has(item.id))
    .map((item) => ({
      location_id: stockLocationId,
      inventory_item_id: item.id,
      stocked_quantity: 12,
    }));

  if (inventoryLevels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels },
    });
    logger.info(`Stock asignado a ${inventoryLevels.length} variantes.`);
  }

  logger.info("Catálogo listo: 5 productos publicados en el canal de la tienda.");
}
