import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    let customizations: any[] = [];
    try {
        const response = await admin.graphql(
            `#graphql
          query {
            deliveryCustomizations(first: 10) {
              nodes {
                id
                title
              }
            }
          }`
        );
        const responseJson = await response.json();
        customizations = responseJson.data?.deliveryCustomizations?.nodes || [];
    } catch (e: any) {
        console.error("Loader Error:", e);
    }

    return { isInstalled: customizations.length > 0 };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    try {
        const functionQuery = await admin.graphql(
            `#graphql
          query {
            shopifyFunctions(first: 20) {
              nodes {
                id
                apiType
                title
              }
            }
          }`
        );

        const functionQueryJson = await functionQuery.json();
        const functions = functionQueryJson.data?.shopifyFunctions?.nodes || [];
        const functionId = functions.find((f: any) => f.apiType === "delivery_customization")?.id;

        if (!functionId) {
            return { success: false, error: "Customization function not found on the store." };
        }

        const createMutation = await admin.graphql(
            `#graphql
          mutation deliveryCustomizationCreate($deliveryCustomization: DeliveryCustomizationInput!) {
            deliveryCustomizationCreate(deliveryCustomization: $deliveryCustomization) {
              deliveryCustomization {
                id
              }
              userErrors {
                message
                field
              }
            }
          }`,
            {
                variables: {
                    deliveryCustomization: {
                        functionId: functionId,
                        title: "CIS Pickup Customization",
                        enabled: true,
                    },
                },
            }
        );

        const createMutationJson = await createMutation.json();

        if (createMutationJson.data?.deliveryCustomizationCreate?.userErrors?.length > 0) {
            return { success: false, error: createMutationJson.data.deliveryCustomizationCreate.userErrors[0].message };
        }

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Unknown error" };
    }
};

export default function PickupCustomization() {
    const { isInstalled } = useLoaderData<typeof loader>();
    const fetcher = useFetcher<typeof action>();
    const shopify = useAppBridge();

    const isLoading = ["loading", "submitting"].includes(fetcher.state) && fetcher.formMethod === "POST";
    const [installed, setInstalled] = useState(isInstalled);

    useEffect(() => {
        if (fetcher.data?.success) {
            shopify.toast.show("Customization Enabled Successfully");
            setInstalled(true);
        } else if (fetcher.data?.error) {
            shopify.toast.show("Error: " + fetcher.data.error, { isError: true });
        }
    }, [fetcher.data, shopify]);

    const enableCustomization = () => fetcher.submit({}, { method: "POST" });

    return (
        <s-page heading="Pickup Location Customization" back-url="/app">
            {installed ? (
                <s-section>
                    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
                        <p><b>✅ Pickup Customization is Active</b></p>
                        <p>
                            The checkout will now automatically filter pickup locations
                            based on each product's <b>magento.cis_collect_locations</b> metafield.
                        </p>
                        <br />
                        <p><b>Rules applied at checkout:</b></p>
                        <ul>
                            <li><b>[All Locations]</b> — All 4 locations shown (Alexandria, Chullora, Brookvale, Sans Souci)</li>
                            <li><b>[Disabled]</b> — Pickup completely disabled at checkout</li>
                            <li><b>Alexandria</b> — Only Alexandria shown, others hidden</li>
                            <li><b>Chullora</b> — Only Chullora shown, others hidden</li>
                            <li><b>Brookvale</b> — Only Brookvale shown, others hidden</li>
                            <li><b>Sans Souci</b> — Only Sans Souci shown, others hidden</li>
                        </ul>
                    </s-box>
                </s-section>
            ) : (
                <s-section heading="Enable Delivery Customization">
                    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
                        <s-paragraph>
                            Click the button below to enable the pickup location filtering logic in your store's checkout.
                            It will read each product's <b>magento.cis_collect_locations</b> metafield and show or hide
                            pickup locations accordingly.
                        </s-paragraph>
                        <br />
                        <s-button
                            variant="primary"
                            onClick={enableCustomization}
                            {...(isLoading ? { loading: true } : {})}
                        >
                            Enable Customization
                        </s-button>
                    </s-box>
                </s-section>
            )}
        </s-page>
    );
}
