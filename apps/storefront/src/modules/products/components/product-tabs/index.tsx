"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product Information",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const productSpecs: Record<
  string,
  {
    material: string
    origin_country: string
    type: string
    weight: string
    dimensions: string
  }
> = {
  "sony-alpha-7": {
    material: "Aleación de magnesio",
    origin_country: "Japón",
    type: "Cámara Mirrorless Full-Frame",
    weight: "474 g",
    dimensions: "127L x 94W x 48H mm",
  },
  "lentes-sony-fe": {
    material: "Aleación de aluminio y cristal ED",
    origin_country: "Japón",
    type: "Set de Objetivos Sony FE",
    weight: "520 g",
    dimensions: "70L x 70W x 105H mm",
  },
  "sony-fe-70-200-gm": {
    material: "Magnesio y sellado contra intemperie",
    origin_country: "Japón",
    type: "Teleobjetivo f/2.8 G Master",
    weight: "1480 g",
    dimensions: "88L x 88W x 200H mm",
  },
  "tripode-fibra-carbono": {
    material: "Fibra de carbono de 8 capas",
    origin_country: "Alemania",
    type: "Trípode Profesional de Viaje",
    weight: "1250 g",
    dimensions: "420L x 90W x 90H mm",
  },
  "kit-fotografia": {
    material: "Nylon balístico y aleación de aluminio",
    origin_country: "Japón",
    type: "Kit Completo Audiovisual",
    weight: "3450 g",
    dimensions: "450L x 300W x 200H mm",
  },
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const fallback = (product.handle && productSpecs[product.handle]) || {
    material: "Aleación de aluminio y polímero reforzado",
    origin_country: "Japón",
    type: "Equipamiento Fotográfico Profesional",
    weight: "650 g",
    dimensions: "130L x 95W x 50H mm",
  }

  const material = product.material || fallback.material
  const country = product.origin_country || fallback.origin_country
  const type = product.type?.value || fallback.type
  const weight = product.weight ? `${product.weight} g` : fallback.weight
  const dimensions =
    product.length && product.width && product.height
      ? `${product.length}L x ${product.width}W x ${product.height}H mm`
      : fallback.dimensions

  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Material</span>
            <p>{material}</p>
          </div>
          <div>
            <span className="font-semibold">Country of origin</span>
            <p>{country}</p>
          </div>
          <div>
            <span className="font-semibold">Type</span>
            <p>{type}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Weight</span>
            <p>{weight}</p>
          </div>
          <div>
            <span className="font-semibold">Dimensions</span>
            <p>{dimensions}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Fast delivery</span>
            <p className="max-w-sm">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Simple exchanges</span>
            <p className="max-w-sm">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Easy returns</span>
            <p className="max-w-sm">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
