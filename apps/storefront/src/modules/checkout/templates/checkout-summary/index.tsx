import { Heading } from "@modules/common/components/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  return (
    <div className="sticky top-8 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0">
      <div className="flex w-full flex-col rounded-[28px] border border-white/10 bg-dark-50/80 p-6">
        <Divider className="my-6 border-white/10 small:hidden" />
        <Heading
          level="h2"
          className="flex flex-row items-baseline text-3xl-regular text-text-primary"
        >
          In your Cart
        </Heading>
        <Divider className="my-6 border-white/10" />
        <CartTotals totals={cart} tone="dark" />
        <ItemsPreviewTemplate cart={cart} />
        <div className="my-6">
          <DiscountCode cart={cart} variant="dark" />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
