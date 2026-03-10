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
            Welcome to <b>Cis Collect Locations</b>. This app allows you to customize the pickup locations displayed to your customers during checkout based on individual product settings.
          </s-paragraph>
          <s-paragraph>
            By using the <code>magento.cis_collect_locations</code> metafield on your products, you can filter pickup options to show only relevant locations, show all locations, or disable pickup entirely for specific items.
          </s-paragraph>
        </s-stack>
      </s-section>

      <s-section heading="How it works">
        <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
          <s-stack direction="block" gap="base">
            <p><b>Metafield values:</b></p>
            <ul>
              <li><code>[All Locations]</code>: Displays all available pickup locations.</li>
              <li><code>[Disabled]</code>: Hides all pickup options at checkout.</li>
              <li><code>Location Name</code> (e.g., <i>Alexandria</i>): Displays only the specified location.</li>
            </ul>
          </s-stack>
        </s-box>
      </s-section>

      <s-section heading="Configuration">
        <s-paragraph>
          You can enable or manage the checkout customization logic by navigating to the 
          <s-link href="/app/pickup-customization">Pickup Customization settings</s-link>.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Support">
        <s-paragraph>
          Need help? Contact our support team for assistance with configuration or custom logic requests.
        </s-paragraph>
        <s-paragraph>
          Powered by <b>Icecube Digital</b>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}
