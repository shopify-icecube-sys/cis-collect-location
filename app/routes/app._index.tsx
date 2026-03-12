import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  return (
    <s-page heading="Cis Collect Locations">
      <s-section heading="Overview">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Welcome to <b>Cis Collect Locations</b>. This app dynamically filters checkout pickup options based on your product settings.
          </s-paragraph>
          <s-paragraph>
            The app now uses the <code>custom.collect_locations</code> metafield (Choice List type) to determine which locations are eligible for pickup.
          </s-paragraph>
        </s-stack>
      </s-section>

      <s-section heading="How it works">
        <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
          <s-stack direction="block" gap="base">
            <p><b>Instruction for Product Metafields:</b></p>
            <ul>
              <li><b>Single Product:</b> Only the locations you select in the <i>Collect Locations</i> metafield will be shown at checkout.</li>
              <li><b>Multiple Products (Intersection):</b> If a customer adds different products, only the <b>common</b> locations selected for all products will be displayed.</li>
              <li><b>Automatic Hide:</b> If products in the cart have no overlapping locations (e.g., Product A only Alexandria and Product B only Brookvale), the entire pickup option will be hidden.</li>
              <li><b>No Selection:</b> If a product has no locations selected, it is treated as "All Locations Allowed".</li>
            </ul>
          </s-stack>
        </s-box>
      </s-section>

      <s-section heading="Supported Locations">
        <s-stack direction="inline" gap="base">
          <s-badge tone="info">Alexandria</s-badge>
          <s-badge tone="info">Chullora</s-badge>
          <s-badge tone="info">Brookvale</s-badge>
          <s-badge tone="info">Sans Souci</s-badge>
        </s-stack>
      </s-section>

      <s-section heading="Configuration">
        <s-paragraph>
          Ensure the delivery customization is active in your 
          <s-link href="/app/pickup-customization">Settings Page</s-link> to enable this logic.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Support">
        <s-paragraph>
          Need a special rule or more locations? Contact our support team for custom adjustments.
        </s-paragraph>
        <s-paragraph>
          Powered by <b>Icecube Digital</b>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}
