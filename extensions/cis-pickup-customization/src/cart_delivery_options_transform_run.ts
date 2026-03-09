import type {
  RunInput,
  CartDeliveryOptionsTransformRunResult,
} from "../generated/api";

const NO_CHANGES: CartDeliveryOptionsTransformRunResult = {
  operations: [],
};
// For Testing
const ALL_LOCATIONS_VALUE = "[All Locations]";
const DISABLED_VALUE = "[Disabled]";
const AVAILABLE_LOCATIONS = ["Alexandria", "Chullora", "Brookvale", "Sans Souci"];

export function cartDeliveryOptionsTransformRun(input: RunInput): CartDeliveryOptionsTransformRunResult {
  const productLocations = new Set<string>();
  let hasDisabled = false;
  let allProductsAllowed = true;

  for (const line of input.cart.lines) {
    if (line.merchandise.__typename !== "ProductVariant") continue;

    const locationValue = line.merchandise.product.cisCollectLocations?.value?.trim() || ALL_LOCATIONS_VALUE;

    if (locationValue === DISABLED_VALUE) {
      hasDisabled = true;
    } else if (locationValue !== ALL_LOCATIONS_VALUE) {
      allProductsAllowed = false;
      if (AVAILABLE_LOCATIONS.includes(locationValue)) {
        productLocations.add(locationValue);
      }
    }
  }

  const locationsToHide = new Set<string>();

  if (hasDisabled) {
    AVAILABLE_LOCATIONS.forEach(loc => locationsToHide.add(loc));
  }
  else if (productLocations.size > 1) {
    AVAILABLE_LOCATIONS.forEach(loc => locationsToHide.add(loc));
  }
  else if (!allProductsAllowed && productLocations.size > 0) {
    AVAILABLE_LOCATIONS.forEach(loc => {
      if (!productLocations.has(loc)) {
        locationsToHide.add(loc);
      }
    });
  }

  if (locationsToHide.size === 0) {
    return NO_CHANGES;
  }

  const operations: CartDeliveryOptionsTransformRunResult["operations"] = [];

  for (const group of input.cart.deliveryGroups) {
    for (const option of group.deliveryOptions) {
      if (option.title) {
        for (const loc of Array.from(locationsToHide)) {
          if (option.title.includes(loc)) {
            operations.push({
              deliveryOptionHide: {
                deliveryOptionHandle: option.handle,
              }
            });
            break;
          }
        }
      }
    }
  }

  return {
    operations,
  };
};