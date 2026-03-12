import type {
  RunInput,
  CartDeliveryOptionsTransformRunResult,
} from "../generated/api";

const NO_CHANGES: CartDeliveryOptionsTransformRunResult = {
  operations: [],
};
const ALL_LOCATIONS_VALUE = "[All Locations]";
const DISABLED_VALUE = "[Disabled]";
const AVAILABLE_LOCATIONS = ["Alexandria", "Chullora", "Brookvale", "Sans Souci"];

export function cartDeliveryOptionsTransformRun(input: RunInput): CartDeliveryOptionsTransformRunResult {
  let allowedLocations = new Set<string>(AVAILABLE_LOCATIONS);
  let hasRestrictedProduct = false;

  for (const line of input.cart.lines) {
    if (line.merchandise.__typename !== "ProductVariant") continue;

    const metafieldValue = line.merchandise.product.cisCollectLocations?.value;
    
    if (metafieldValue) {
      try {
        const productAllowed = JSON.parse(metafieldValue) as string[];
        if (Array.isArray(productAllowed) && productAllowed.length > 0) {
          hasRestrictedProduct = true;
          // Calculate intersection
          allowedLocations = new Set(
            Array.from(allowedLocations).filter(loc => productAllowed.includes(loc))
          );
        }
      } catch (e) {
        // If parsing fails, fall back to allowing all for this product
        console.error("Failed to parse metafield value:", metafieldValue);
      }
    }
  }

  const locationsToHide = new Set<string>();
  
  // If we have restrictions and the intersection resulted in fewer than all locations
  AVAILABLE_LOCATIONS.forEach(loc => {
    if (!allowedLocations.has(loc)) {
      locationsToHide.add(loc);
    }
  });

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